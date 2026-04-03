/**
 * Markdown 解析器
 * 解析 Markdown 内容，提取元数据（标题/作者/摘要）和正文
 */

import { marked } from 'marked';
import * as fs from 'fs';

export interface ArticleMetadata {
  title: string;
  author?: string;
  digest?: string;
  coverImage?: string;
}

export interface FrontMatter {
  title?: string;
  author?: string;
  digest?: string;
  summary?: string;
  description?: string;
  cover?: string;
  [key: string]: any;
}

export interface ParsedArticle {
  metadata: ArticleMetadata;
  content: string;
  rawMarkdown: string;
}

export class MarkdownParser {
  /**
   * 解析 Markdown 文件
   */
  static parseFile(filePath: string): ParsedArticle {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return this.parse(content);
  }

  /**
   * 解析 Markdown 字符串
   */
  static parse(markdown: string): ParsedArticle {
    const { frontMatter, content } = this.extractFrontMatter(markdown);
    const metadata = this.extractMetadata(content, frontMatter);

    return {
      metadata,
      content,
      rawMarkdown: markdown,
    };
  }

  /**
   * 提取 Front Matter（YAML 元数据）
   */
  private static extractFrontMatter(markdown: string): {
    frontMatter: FrontMatter | null;
    content: string;
  } {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = markdown.match(frontMatterRegex);

    if (!match) {
      return { frontMatter: null, content: markdown };
    }

    const frontMatterText = match[1];
    const content = markdown.replace(frontMatterRegex, '');

    try {
      const yaml = require('js-yaml');
      const frontMatter = yaml.load(frontMatterText) as FrontMatter;
      return { frontMatter, content };
    } catch (error) {
      console.warn('Front Matter 解析失败，忽略:', error);
      return { frontMatter: null, content: markdown };
    }
  }

  /**
   * 提取文章元数据
   * 优先级：命令行参数 > frontMatter > 正文首个标题
   */
  private static extractMetadata(
    content: string,
    frontMatter: FrontMatter | null
  ): ArticleMetadata {
    const metadata: ArticleMetadata = {
      title: '未命名文章',
    };

    // 1. 标题：frontMatter > 正文首个 H1
    if (frontMatter?.title) {
      metadata.title = frontMatter.title;
    } else {
      const h1Match = content.match(/^#\s+(.+)$/m);
      if (h1Match) {
        metadata.title = h1Match[1].trim();
      }
    }

    // 2. 作者：frontMatter
    if (frontMatter?.author) {
      metadata.author = frontMatter.author;
    }

    // 3. 摘要：frontMatter.digest > summary > description > 自动生成
    if (frontMatter?.digest) {
      metadata.digest = frontMatter.digest;
    } else if (frontMatter?.summary) {
      metadata.digest = frontMatter.summary;
    } else if (frontMatter?.description) {
      metadata.digest = frontMatter.description;
    } else {
      // 自动从正文生成摘要（移除 Markdown 标记，提取前 120 字符）
      metadata.digest = this.generateDigest(content);
    }

    // 4. 封面图：frontMatter.cover
    if (frontMatter?.cover) {
      metadata.coverImage = frontMatter.cover;
    }

    return metadata;
  }

  /**
   * 从正文自动生成摘要
   * 移除 Markdown 标记，提取前 120 字符
   */
  private static generateDigest(content: string): string {
    // 移除 Front Matter
    content = content.replace(/^---[\s\S]*?---\s*/m, '');
    
    // 移除标题（# 开头的行）
    let text = content.replace(/^#{1,6}\s+.+$/gm, '');

    // 移除代码块
    text = text.replace(/```[\s\S]*?```/g, '');

    // 移除行内代码
    text = text.replace(/`[^`]+`/g, '');

    // 移除图片（必须在链接之前）
    text = text.replace(/!\[.*?\]\([^\)]+\)/g, '');

    // 移除链接
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

    // 移除引用标记
    text = text.replace(/^>\s+/gm, '');

    // 移除列表标记
    text = text.replace(/^[\*\-\+]\s+/gm, '');
    text = text.replace(/^\d+\.\s+/gm, '');

    // 移除粗体/斜体标记
    text = text.replace(/\*\*([^\*]+)\*\*/g, '$1');
    text = text.replace(/\*([^\*]+)\*/g, '$1');
    text = text.replace(/__([^_]+)__/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');

    // 移除分隔线
    text = text.replace(/^[\-\*_]{3,}$/gm, '');

    // 移除表格标记
    text = text.replace(/\|/g, ' ');

    // 移除多余空白和空行
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/^\s+|\s+$/gm, '');
    text = text.trim();

    // 提取前 120 字符
    if (text.length > 120) {
      text = text.substring(0, 117) + '...';
    }

    return text || '暂无摘要';
  }

  /**
   * 将 Markdown 转为 HTML（基础转换）
   */
  static toHtml(markdown: string): string {
    return marked.parse(markdown) as string;
  }

  /**
   * 提取图片 URL 列表
   */
  static extractImages(markdown: string): string[] {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const images: string[] = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      images.push(match[1]);
    }

    return images;
  }

  /**
   * 替换图片 URL（用于上传后替换为微信 URL）
   */
  static replaceImages(markdown: string, replacements: Map<string, string>): string {
    let result = markdown;

    replacements.forEach((newUrl, oldUrl) => {
      const regex = new RegExp(`!\\[.*?\\]\\(${this.escapeRegex(oldUrl)}\\)`, 'g');
      result = result.replace(regex, (match) => {
        return match.replace(oldUrl, newUrl);
      });
    });

    return result;
  }

  /**
   * 转义正则表达式特殊字符
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 截断字符串（用于标题/作者/摘要长度限制）
   */
  static truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - 3) + '...';
  }
}

export default MarkdownParser;
