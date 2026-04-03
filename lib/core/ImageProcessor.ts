/**
 * 图片处理器
 * 负责图片下载、上传到微信素材库、URL 替换
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import WechatClient from './WechatClient';

export interface ImageInfo {
  originalUrl: string;
  localPath?: string;
  wechatUrl?: string;
  error?: string;
}

export class ImageProcessor {
  private wechatClient: WechatClient;
  private tempDir: string;

  constructor(wechatClient: WechatClient) {
    this.wechatClient = wechatClient;
    this.tempDir = '/tmp/md2wechat-images';

    // 创建临时目录
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 处理 Markdown 中的所有图片
   * @returns 图片 URL 映射表（原始 URL → 微信 URL）
   */
  async processImages(markdown: string): Promise<Map<string, string>> {
    const imageUrls = this.extractImageUrls(markdown);
    const replacements = new Map<string, string>();

    for (const url of imageUrls) {
      try {
        const wechatUrl = await this.processImage(url);
        replacements.set(url, wechatUrl);
        console.log(`图片上传成功: ${url} → ${wechatUrl}`);
      } catch (error) {
        console.error(`图片处理失败 ${url}:`, error);
        throw new Error(`图片处理失败: ${url}`);
      }
    }

    return replacements;
  }

  /**
   * 处理单张图片（下载 + 上传）
   */
  private async processImage(url: string): Promise<string> {
    // 1. 下载图片到本地
    const localPath = await this.downloadImage(url);

    try {
      // 2. 验证图片格式和大小
      this.validateImage(localPath);

      // 3. 上传到微信素材库
      const wechatUrl = await this.wechatClient.uploadImage(localPath);

      return wechatUrl;
    } finally {
      // 清理临时文件
      this.cleanup(localPath);
    }
  }

  /**
   * 下载图片到本地
   */
  private async downloadImage(url: string): Promise<string> {
    // 生成唯一文件名
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const ext = this.getFileExtension(url);
    const filename = `${hash}${ext}`;
    const localPath = path.join(this.tempDir, filename);

    // 如果已存在，直接返回
    if (fs.existsSync(localPath)) {
      return localPath;
    }

    // 下载图片
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    fs.writeFileSync(localPath, response.data);
    return localPath;
  }

  /**
   * 验证图片格式和大小
   */
  private validateImage(localPath: string): void {
    const stats = fs.statSync(localPath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // 检查文件大小（微信限制 2 MB）
    if (fileSizeMB > 2) {
      throw new Error(`图片文件过大: ${fileSizeMB.toFixed(2)} MB（最大 2 MB）`);
    }

    // 检查文件格式（只支持 JPG / PNG / GIF）
    const ext = path.extname(localPath).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];

    if (!allowedExts.includes(ext)) {
      throw new Error(`不支持的图片格式: ${ext}（支持 JPG / PNG / GIF）`);
    }
  }

  /**
   * 提取 Markdown 中的图片 URL
   */
  private extractImageUrls(markdown: string): string[] {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const urls: string[] = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      const url = match[1].trim();
      // 只处理 HTTP(S) URL，忽略本地路径
      if (url.startsWith('http://') || url.startsWith('https://')) {
        urls.push(url);
      }
    }

    // 去重
    return Array.from(new Set(urls));
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(url: string): string {
    // 从 URL 中提取扩展名
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);

    // 如果没有扩展名，默认 .jpg
    return ext || '.jpg';
  }

  /**
   * 清理临时文件
   */
  private cleanup(localPath: string): void {
    try {
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (error) {
      console.warn(`清理临时文件失败: ${localPath}`, error);
    }
  }

  /**
   * 清理所有临时文件
   */
  cleanupAll(): void {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        files.forEach((file) => {
          const filePath = path.join(this.tempDir, file);
          fs.unlinkSync(filePath);
        });
      }
    } catch (error) {
      console.warn('清理临时目录失败:', error);
    }
  }
}

export default ImageProcessor;
