import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Herkese açık sayfalar
const publicPaths = ["/", "/login", "/register"];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Oturum bilgisini al (kurabiye/cookie üzerinden)
  const authCookie = request.cookies.get("__session");
  const isAuthenticated = authCookie !== undefined && authCookie.value !== "";
  const path = request.nextUrl.pathname;

  // CSP başlıklarını yanıta ekle (çift koruma olarak next.config.ts'deki CSP'yi destekler)
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseio.com https://*.firebase.com https://*.googleapis.com https://*.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://*.firebase.com https://*.firebasestorage.app blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com https://*.firebasestorage.app wss://*.firebaseio.com",
      "frame-src 'self' https://*.firebase.com https://*.firebaseapp.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  // Strict-Transport-Security header ekleme
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Auth kontrolü ve yönlendirme
  // Eğer kullanıcı giriş yapmamışsa ve korumalı bir rotaya erişmeye çalışıyorsa login sayfasına yönlendir
  if (
    !isAuthenticated &&
    !publicPaths.includes(path) &&
    !path.includes("/_next") &&
    !path.includes("/api/")
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Eğer kullanıcı zaten giriş yapmışsa ve login/register sayfalarına gitmeye çalışıyorsa
  // dashboard'a yönlendir (otomatik giriş)
  if (isAuthenticated && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
