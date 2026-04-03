/**
 * 微信公众号 API 客户端
 * 负责与微信公众平台 API 交互
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
import WechatErrorHandler from './WechatErrorHandler';

export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface UploadImageResponse {
  url: string;
}

export interface DraftResponse {
  media_id: string;
}

export interface Article {
  title: string;
  author?: string;
  digest?: string;
  content: string;
  content_source_url?: string;
  thumb_media_id?: string;
  need_open_comment?: number;
  only_fans_can_comment?: number;
}

export class WechatClient {
  private appid: string;
  private secret: string;
  private client: AxiosInstance;
  private accessToken?: string;
  private tokenExpireTime?: number;

  constructor(appid: string, secret: string) {
    this.appid = appid;
    this.secret = secret;
    this.client = axios.create({
      baseURL: 'https://api.weixin.qq.com',
      timeout: 30000,
    });
  }

  /**
   * 获取 Access Token
   */
  async getAccessToken(): Promise<string> {
    // 如果 token 还未过期，直接返回
    if (this.accessToken && this.tokenExpireTime && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    const response = await this.client.get<AccessTokenResponse>('/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: this.appid,
        secret: this.secret,
      },
    });

    // 检查错误
    if ((response.data as any).errcode) {
      throw WechatErrorHandler.parseError(response.data);
    }

    if (!response.data.access_token) {
      throw new Error(`获取 Access Token 失败: ${JSON.stringify(response.data)}`);
    }

    this.accessToken = response.data.access_token;
    // 提前 5 分钟过期（安全边际）
    this.tokenExpireTime = Date.now() + (response.data.expires_in - 300) * 1000;

    return this.accessToken;
  }

  /**
   * 上传图片到微信素材库（永久素材）
   */
  async uploadImage(imagePath: string): Promise<string> {
    const accessToken = await this.getAccessToken();

    if (!fs.existsSync(imagePath)) {
      throw new Error(`图片文件不存在: ${imagePath}`);
    }

    const form = new FormData();
    form.append('media', fs.createReadStream(imagePath));

    const response = await this.client.post<UploadImageResponse>(
      '/cgi-bin/media/uploadimg',
      form,
      {
        params: { access_token: accessToken },
        headers: form.getHeaders(),
      }
    );

    // 检查错误
    if ((response.data as any).errcode) {
      throw WechatErrorHandler.parseError(response.data);
    }

    if (!response.data.url) {
      throw new Error(`图片上传失败: ${JSON.stringify(response.data)}`);
    }

    return response.data.url;
  }

  /**
   * 上传图片 URL 到微信素材库（先下载后上传）
   */
  async uploadImageUrl(imageUrl: string): Promise<string> {
    // 下载图片到临时文件
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const tmpPath = `/tmp/md2wechat-${Date.now()}.jpg`;
    fs.writeFileSync(tmpPath, response.data);

    try {
      const wechatUrl = await this.uploadImage(tmpPath);
      return wechatUrl;
    } finally {
      // 清理临时文件
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
    }
  }

  /**
   * 上传图片为永久素材（获取 media_id）
   */
  async uploadPermanentImage(imagePath: string): Promise<string> {
    const accessToken = await this.getAccessToken();

    if (!fs.existsSync(imagePath)) {
      throw new Error(`图片文件不存在: ${imagePath}`);
    }

    const form = new FormData();
    form.append('media', fs.createReadStream(imagePath));
    form.append('type', 'image');

    const response = await this.client.post<{ media_id: string }>(
      '/cgi-bin/material/add_material',
      form,
      {
        params: { access_token: accessToken, type: 'image' },
        headers: form.getHeaders(),
      }
    );

    // 检查错误
    if ((response.data as any).errcode) {
      throw WechatErrorHandler.parseError(response.data);
    }

    if (!response.data.media_id) {
      throw new Error(`永久素材上传失败: ${JSON.stringify(response.data)}`);
    }

    return response.data.media_id;
  }

  /**
   * 创建草稿
   */
  async createDraft(article: Article): Promise<string> {
    const accessToken = await this.getAccessToken();

    const response = await this.client.post<DraftResponse>(
      '/cgi-bin/draft/add',
      { articles: [article] },
      { params: { access_token: accessToken } }
    );

    // 检查错误
    if ((response.data as any).errcode) {
      throw WechatErrorHandler.parseError(response.data);
    }

    if (!response.data.media_id) {
      throw new Error(`草稿创建失败: ${JSON.stringify(response.data)}`);
    }

    return response.data.media_id;
  }

  /**
   * 批量上传图片
   */
  async uploadImages(imagePaths: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const imagePath of imagePaths) {
      try {
        const url = await this.uploadImage(imagePath);
        results.set(imagePath, url);
      } catch (error) {
        console.error(`图片上传失败 ${imagePath}:`, error);
        throw error;
      }
    }

    return results;
  }
}

export default WechatClient;
