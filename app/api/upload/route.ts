import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// 强制使用 Node.js Runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: { message: '未找到上传文件' },
      }, { status: 400 });
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: { message: '仅支持 JPG / PNG / GIF 格式' },
      }, { status: 400 });
    }

    // 验证文件大小（2 MB）
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: { message: `文件过大: ${(file.size / 1024 / 1024).toFixed(2)} MB（最大 2 MB）` },
      }, { status: 400 });
    }

    // 创建临时目录
    const tmpDir = join(process.cwd(), 'tmp', 'uploads');
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    // 生成文件名
    const ext = file.name.split('.').pop();
    const fileName = `cover-${Date.now()}.${ext}`;
    const filePath = join(tmpDir, fileName);

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      data: {
        path: filePath,
        filename: fileName,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || '文件上传失败',
      },
    }, { status: 500 });
  }
}
