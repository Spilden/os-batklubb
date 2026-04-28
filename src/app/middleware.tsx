import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('payload-token')

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/members/:path*'],
}