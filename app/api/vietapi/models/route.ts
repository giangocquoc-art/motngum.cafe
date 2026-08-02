import { NextResponse } from "next/server";
import {
  FALLBACK_MODELS,
  normalizeModelRecords,
  VIETAPI_BASE_URL,
  type VietApiModel,
} from "@/data/vietapi-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

type ModelCache = {
  models: VietApiModel[];
  expiresAt: number;
  live: boolean;
  syncedAt: string;
};

let modelCache: ModelCache | null = null;

function jsonResponse(payload: ModelCache & { ok: true; message?: string }, cacheSeconds = 300) {
  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": `public, max-age=${cacheSeconds}, stale-while-revalidate=600`,
    },
  });
}

function fallback(message?: string) {
  const now = new Date().toISOString();
  return jsonResponse(
    {
      ok: true,
      models: FALLBACK_MODELS,
      expiresAt: Date.now() + 60_000,
      live: false,
      syncedAt: now,
      message:
        message ||
        "Đang hiển thị danh mục công khai. Cấu hình VIETAPI_API_KEY để đồng bộ model theo key của bạn.",
    },
    60
  );
}

function upstreamUrl() {
  const configured = process.env.VIETAPI_API_BASE?.trim();
  if (!configured) return VIETAPI_BASE_URL;
  return configured.replace(/\/$/, "");
}

export async function GET() {
  const now = Date.now();
  if (modelCache && modelCache.expiresAt > now) {
    return jsonResponse({ ok: true, ...modelCache });
  }

  const apiKey = process.env.VIETAPI_API_KEY?.trim();
  if (!apiKey) return fallback();

  try {
    const response = await fetch(`${upstreamUrl()}/models`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`upstream-${response.status}`);
    const payload: unknown = await response.json();
    const models = normalizeModelRecords(payload);
    if (!models.length) throw new Error("upstream-empty");

    modelCache = {
      models,
      expiresAt: now + CACHE_TTL_MS,
      live: true,
      syncedAt: new Date().toISOString(),
    };

    return jsonResponse({ ok: true, ...modelCache });
  } catch (error) {
    // Keep the public catalogue available if VietAPI is temporarily down;
    // do not include upstream details or credentials in the browser response.
    console.error("[vietapi/models] sync failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    if (modelCache?.models.length) {
      return jsonResponse({
        ok: true,
        ...modelCache,
        live: false,
        message: "Đang hiển thị lần đồng bộ gần nhất; VietAPI đang tạm thời chưa phản hồi.",
      });
    }

    return fallback("Không đồng bộ được lúc này; đang hiển thị danh mục model công khai.");
  }
}
