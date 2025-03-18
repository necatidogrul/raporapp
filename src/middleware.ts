import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Eğer kullanıcı oturum açmışsa ve korumalı bir rotaya erişmeye çalışıyorsa izin ver
  // Şimdilik bu kısmı atlıyoruz, auth yapısı kurulduğunda eklenecek

  // Ana sayfaya gelen istekleri engelleme
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  return NextResponse.next();
}
