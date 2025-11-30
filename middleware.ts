import { PrivyClient } from "@privy-io/node";
import { NextRequest, NextResponse } from "next/server";

const privyClient = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
  appSecret: process.env.PRIVY_SECRET as string,
});

const PROTECTED_ROUTES = [
  {
    pattern: /^\/api\/creators/,
    method: "POST",
    roles: ["admin"],
  },
];

export const config = {
  matcher: "/api/:path*",
};

export async function middleware(req: NextRequest) {
  const cookieIdToken = req.cookies.get("privy-id-token");

  const protectedRoute = PROTECTED_ROUTES.find(
    (route) => route.pattern.test(req.nextUrl.pathname) && req.method === route.method,
  );

  if (!protectedRoute) {
    return NextResponse.next();
  }

  if (!cookieIdToken?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await privyClient.users().get({ id_token: cookieIdToken.value });
    const userRole = user.custom_metadata?.role as string | undefined;

    if (!userRole || !protectedRoute.roles.includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error verifying privy token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
