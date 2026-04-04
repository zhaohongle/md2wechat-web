import { NextRequest, NextResponse } from 'next/server';
import { MarkdownParser } from '@/lib/core/MarkdownParser';
import { HtmlRenderer } from '@/lib/core/HtmlRenderer';
import * as fs from 'fs';
import * as path from 'path';

// 强制使用 Node.js Runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { markdown, theme = 'default', customStyles } = await request.json();

    if (!markdown) {
      return NextResponse.json({
        success: false,
        error: { message: 'Markdown 内容不能为空' },
      });
    }

    // 解析 Markdown
    const { content, metadata } = MarkdownParser.parse(markdown);

    // 加载主题
    const themePath = path.join(process.cwd(), 'lib', 'themes', `${theme}.json`);
    if (!fs.existsSync(themePath)) {
      return NextResponse.json({
        success: false,
        error: { message: `主题不存在: ${theme}` },
      });
    }

    const themeConfig = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
    if (customStyles) themeConfig.styles = { ...themeConfig.styles, ...customStyles };

    // 渲染 HTML
    const renderer = new HtmlRenderer(themeConfig);
    const html = renderer.render(content);

    return NextResponse.json({
      success: true,
      data: {
        html,
        metadata,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || '转换失败',
      },
    }, { status: 500 });
  }
}
