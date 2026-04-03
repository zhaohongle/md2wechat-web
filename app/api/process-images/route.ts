import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: false,
    error: {
      message: '图片自动上传功能开发中，敬请期待',
    },
  }, { status: 501 });
}
