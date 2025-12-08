import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  // Check the 'session' cookie which stores Appwrite session.secret
  const sessionSecret = req.cookies.get("session")?.value;

  if (!sessionSecret) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], 
};
