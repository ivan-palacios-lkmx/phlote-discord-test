import { NextRequest, NextResponse } from "next/server";

const UNAUTHENTICATED_PAGES = [];

export const config = {
  matcher: "/api/:path*",
};

export async function middleware(req: NextRequest) {
  const cookieAuthToken = req.cookies.get("privy-token");
  const cookieSession = req.cookies.get("privy-session");

  const definitelyAuthenticated = Boolean(cookieAuthToken);
  const maybeAuthenticated = Boolean(cookieSession);

  if (!definitelyAuthenticated && maybeAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}
