import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const deploymentId = process.env.NEXT_DEPLOYMENT_ID;

  // Next 16.1 decodes RSC (and can load its modules) before checking its build
  // ID. Reject skew before streaming any component data into an older runtime.
  // Its router falls back to a full document navigation on a non-2xx response.
  // A missing ID also covers tabs opened before this protection was deployed.
  if (
    deploymentId &&
    request.method === "GET" &&
    request.headers.get("x-deployment-id") !== deploymentId
  ) {
    return new NextResponse("This page has been updated. Reload to continue.", {
      status: 409,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "Vary": "RSC, X-Deployment-Id",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Next strips the RSC header before calling proxy(), so select these requests
  // in the matcher, where the original headers are still available.
  matcher: [{
    source: "/((?!_next/|api/).*)",
    has: [{ type: "header", key: "rsc", value: "1" }],
  }],
};
