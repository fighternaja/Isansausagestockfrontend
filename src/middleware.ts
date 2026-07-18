import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Middleware นี้ไม่ตรวจ session (ใช้ sessionStorage ฝั่ง client แทน) */
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
