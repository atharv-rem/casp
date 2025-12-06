import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const sessionId = req.cookies.get("sessionId")?.value;
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!sessionId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
