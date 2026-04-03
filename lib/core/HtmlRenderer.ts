/**
 * HTML 渲染器
 * 将 Markdown HTML 转为微信公众号格式（内联 CSS + 主题样式）
 */

import { marked } from 'marked';
import * as fs from 'fs';
import * as path from 'path';

export interface Theme {
  name: string;
  description: string;
  styles: {
    body?: string;
    h1?: string;
    h2?: string;
    h3?: string;
    p?: string;
    blockquote?: string;
    code?: string;
    pre?: string;
    a?: string;
    img?: string;
    ul?: string;
    ol?: string;
    li?: string;
    table?: string;
    th?: string;
    td?: string;
  };
}

export class HtmlRenderer {
  private theme: Theme;

  constructor(theme: Theme) {
    this.theme = theme;
  }

  /**
   * 渲染 Markdown 为微信 HTML
   */
  render(markdown: string): string {
    // 配置 marked 渲染器
    const renderer = this.createRenderer();
    marked.use({ renderer });

    // 转换 Markdown 为 HTML
    const html = marked.parse(markdown) as string;

    // 包装为完整 HTML
    return this.wrapHtml(html);
  }

  /**
   * 创建自定义渲染器（内联样式）
   */
  private createRenderer(): any {
    const renderer: any = {
      heading: (token: any) => {
        const level = token.depth;
        const text = token.text;
        const style = this.theme.styles[`h${level}` as keyof typeof this.theme.styles] || '';
        return `<h${level} style="${style}">${text}</h${level}>\n`;
      },

      paragraph: (token: any) => {
        const style = this.theme.styles.p || '';
        return `<p style="${style}">${token.text}</p>\n`;
      },

      blockquote: (token: any) => {
        const style = this.theme.styles.blockquote || '';
        return `<blockquote style="${style}">${token.text}</blockquote>\n`;
      },

      code: (token: any) => {
        const preStyle = this.theme.styles.pre || '';
        const codeStyle = this.theme.styles.code || '';
        return `<pre style="${preStyle}"><code style="${codeStyle}">${this.escapeHtml(token.text)}</code></pre>\n`;
      },

      codespan: (token: any) => {
        const style = this.theme.styles.code || '';
        return `<code style="${style}">${this.escapeHtml(token.text)}</code>`;
      },

      link: (token: any) => {
        const style = this.theme.styles.a || '';
        const titleAttr = token.title ? ` title="${token.title}"` : '';
        return `<a href="${token.href}" style="${style}"${titleAttr}>${token.text}</a>`;
      },

      image: (token: any) => {
        const style = this.theme.styles.img || '';
        const titleAttr = token.title ? ` title="${token.title}"` : '';
        const altAttr = token.text ? ` alt="${token.text}"` : '';
        return `<img src="${token.href}" style="${style}"${titleAttr}${altAttr} />`;
      },

      list: (token: any) => {
        const tag = token.ordered ? 'ol' : 'ul';
        const style = this.theme.styles[tag as keyof typeof this.theme.styles] || '';
        return `<${tag} style="${style}">${token.body}</${tag}>\n`;
      },

      listitem: (token: any) => {
        const style = this.theme.styles.li || '';
        return `<li style="${style}">${token.text}</li>\n`;
      },

      table: (token: any) => {
        const style = this.theme.styles.table || '';
        return `<table style="${style}"><thead>${token.header}</thead><tbody>${token.body}</tbody></table>\n`;
      },

      tablerow: (token: any) => {
        return `<tr>${token.text}</tr>\n`;
      },

      tablecell: (token: any) => {
        const tag = token.header ? 'th' : 'td';
        const style = this.theme.styles[tag as keyof typeof this.theme.styles] || '';
        return `<${tag} style="${style}">${token.text}</${tag}>`;
      },
    };

    return renderer;
  }

  /**
   * 包装为完整 HTML
   */
  private wrapHtml(content: string): string {
    const bodyStyle = this.theme.styles.body || '';

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WeChat Article</title>
</head>
<body style="${bodyStyle}">
  <div class="rich_media_content" id="js_content">
    ${content}
  </div>
</body>
</html>`;
  }

  /**
   * 转义 HTML 特殊字符
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * 加载主题
   */
  static loadTheme(themeName: string): Theme {
    const themesDir = path.join(__dirname, '../../themes');
    const themePath = path.join(themesDir, `${themeName}.json`);

    if (!fs.existsSync(themePath)) {
      throw new Error(`主题不存在: ${themeName}`);
    }

    const content = fs.readFileSync(themePath, 'utf-8');
    return JSON.parse(content) as Theme;
  }

  /**
   * 获取可用主题列表
   */
  static listThemes(): string[] {
    const themesDir = path.join(__dirname, '../../themes');

    if (!fs.existsSync(themesDir)) {
      return [];
    }

    return fs
      .readdirSync(themesDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));
  }
}

export default HtmlRenderer;
