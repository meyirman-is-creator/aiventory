import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authPaths = ["/login", "/register", "/verify"];
  const protectedPaths = ["/warehouse", "/store", "/prediction"];
  
  const isAuth = authPaths.some((path) => pathname.startsWith(path));
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

//   if (isProtectedPath && !session) {
//     const url = new URL("/login", request.url);
//     url.searchParams.set("callbackUrl", encodeURI(request.url));
//     return NextResponse.redirect(url);
//   }
  
  if (isAuth && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};