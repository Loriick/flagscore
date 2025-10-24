import { NextResponse } from "next/server";

const BASE = process.env.FFFA_BASE!;
const ACTION = process.env.FFFA_ACTION ?? "fffa_calendar_api_proxy";

export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const upstream = new URL(BASE);
  upstream.searchParams.set("action", ACTION);

  for (const [paramName, paramValue] of url.searchParams)
    upstream.searchParams.append(paramName, paramValue);

  const response = await fetch(upstream.toString(), {
    headers: { "X-Requested-With": "XMLHttpRequest" },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Upstream ${response.status}` },
      { status: 502 }
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json"))
    return NextResponse.json(await response.json());
  return new NextResponse(await response.text(), {
    headers: { "content-type": contentType || "text/plain; charset=utf-8" },
  });
}
