import { NextRequest, NextResponse } from 'next/server';
import { MarkdownParser } from '@/lib/core/MarkdownParser';
import { HtmlRenderer } from '@/lib/core/HtmlRenderer';
import WechatClient from '@/lib/core/WechatClient';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { markdown, theme = 'default', appid, secret, coverImagePath } = await request.json();

    // 验证必填参数
    if (!markdown) {
      return NextResponse.json({
        success: false,
        error: { message: 'Markdown 内容不能为空' },
      }, { status: 400 });
    }

    if (!appid || !secret) {
      return NextResponse.json({
        success: false,
        error: { message: '请先配置微信公众号 AppID 和 AppSecret' },
      }, { status: 400 });
    }

    // 解析 Markdown
    const { content, metadata } = MarkdownParser.parse(markdown);

    // 加载主题
    const themePath = path.join(process.cwd(), 'lib', 'themes', `${theme}.json`);
    if (!fs.existsSync(themePath)) {
      return NextResponse.json({
        success: false,
        error: { message: `主题不存在: ${theme}` },
      }, { status: 400 });
    }

    const themeConfig = JSON.parse(fs.readFileSync(themePath, 'utf-8'));

    // 渲染 HTML
    const renderer = new HtmlRenderer(themeConfig);
    const html = renderer.render(content);

    // 初始化微信客户端
    const wechatClient = new WechatClient(appid, secret);

    // 上传封面图（如果有）
    let thumbMediaId: string | undefined;
    if (coverImagePath) {
      try {
        thumbMediaId = await wechatClient.uploadPermanentImage(coverImagePath);
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: {
            message: '封面图上传失败',
            hint: error.hint,
            details: error.message,
          },
        }, { status: 500 });
      }
    }

    // 创建草稿
    const article = {
      title: metadata.title,
      author: metadata.author || '未知作者',
      digest: metadata.digest || '',
      content: html,
      content_source_url: '',
      thumb_media_id: thumbMediaId || '',
      need_open_comment: 0,
      only_fans_can_comment: 0,
    };

    try {
      const mediaId = await wechatClient.createDraft(article);

      return NextResponse.json({
        success: true,
        data: {
          media_id: mediaId,
          title: article.title,
          author: article.author,
          digest: article.digest,
          message: '草稿创建成功，请在微信公众平台查看',
        },
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: {
          message: '草稿创建失败',
          hint: error.hint,
          details: error.message,
        },
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || '服务器错误',
      },
    }, { status: 500 });
  }
}
