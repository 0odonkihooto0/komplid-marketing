import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const match = /^\/ref\/([^/]+)$/.exec(pathname);
  if (!match || !match[1]) {
    return NextResponse.next();
  }
  const code = match[1];

  const response = NextResponse.next();
  response.cookies.set('komplid_ref', code, {
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export const config = {
  matcher: ['/ref/:code*'],
};
