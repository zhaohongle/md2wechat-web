import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import WechatClient from '@/lib/core/WechatClient';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let tmpPath: string | null = null;
  try {
    const body = await request.json();
    const { imageBase64, mimeType = 'image/jpeg', filename = 'image.jpg', appid, secret, target = 'smms' } = body;

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: { message: '图片数据不能为空' } }, { status: 400 });
    }

    const buffer = Buffer.from(imageBase64, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: { message: '图片超过 5MB 限制' } }, { status: 400 });
    }

    // 写临时文件
    const extMap: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif' };
    const ext = extMap[mimeType] || '.jpg';
    tmpPath = path.join(os.tmpdir(), `md2wechat-${Date.now()}${ext}`);
    fs.writeFileSync(tmpPath, buffer);

    if (target === 'wechat') {
      if (!appid || !secret) {
        return NextResponse.json({ success: false, error: { message: '请先配置微信 AppID 和 AppSecret' } }, { status: 400 });
      }
      const client = new WechatClient(appid, secret);
      const url = await client.uploadImage(tmpPath);
      return NextResponse.json({ success: true, data: { url, type: 'wechat' } });
    }

    // 默认 SM.MS
    const form = new FormData();
    form.append('smfile', buffer, { filename, contentType: mimeType });

    const resp = await axios.post('https://sm.ms/api/v2/upload', form, {
      headers: { ...form.getHeaders(), Authorization: process.env.SMMS_TOKEN || '' },
      timeout: 30000,
    });

    if (resp.data.success) {
      return NextResponse.json({ success: true, data: { url: resp.data.data.url } });
    } else if (resp.data.code === 'image_repeated') {
      return NextResponse.json({ success: true, data: { url: resp.data.images } });
    } else {
      throw new Error(resp.data.message || '上传失败');
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message || '上传失败' } }, { status: 500 });
  } finally {
    if (tmpPath && fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
}
