import { PrivyClient } from "@privy-io/node";
import { NextRequest, NextResponse } from "next/server";

const privyClient = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
  appSecret: process.env.PRIVY_SECRET as string,
});

const PROTECTED_ROUTES = [
  {
    path: "/api/creators",
    method: "POST",
    roles: ["admin"],
  },
];

export const config = {
  matcher: "/api/:path*",
};

function isRouteMatch(routePath: string, requestPath: string): boolean {
  const pattern = routePath.replace(/\//g, "\\/").replace(/:[a-zA-Z0-9_]+/g, "[^/]+");
  const regex = new RegExp(`^${pattern}$`);
  return regex.test(requestPath);
}

export async function middleware(req: NextRequest) {
  const cookieIdToken = req.cookies.get("privy-id-token");

  const protectedRoute = PROTECTED_ROUTES.find(
    (route) => isRouteMatch(route.path, req.nextUrl.pathname) && req.method === route.method,
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
