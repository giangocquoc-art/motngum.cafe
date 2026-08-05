import { proxyVietApiRequest } from "@/lib/vietapi-proxy";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function handle(request: Request, { params }: RouteContext) {
  const { path = [] } = await params;
  return proxyVietApiRequest(request, path);
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
