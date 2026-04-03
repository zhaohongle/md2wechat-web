import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // 获取客户端 IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip');

  return NextResponse.json({
    success: true,
    data: {
      ip: ip || 'Unknown',
      headers: {
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-real-ip': request.headers.get('x-real-ip'),
      },
      message: '将此 IP 添加到微信公众平台白名单',
    },
  });
}
