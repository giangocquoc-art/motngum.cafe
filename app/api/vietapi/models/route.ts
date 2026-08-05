import { NextResponse } from "next/server";
import {
  FALLBACK_MODELS,
  normalizeModelRecords,
  VIETAPI_BASE_URL,
  type VietApiModel,
} from "@/data/vietapi-models";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { models: VietApiModel[]; expiresAt: number; syncedAt: string } | null = null;

function response(payload: { models: VietApiModel[]; live: boolean; syncedAt: string; message: string }) {
  return NextResponse.json(
    { ok: true, ...payload },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET() {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return response({ ...cache, live: true, message: "Đã đồng bộ từ VietAPI." });
  }

  const apiKey = process.env.VIETAPI_API_KEY?.trim();
  if (!apiKey) {
    return response({
      models: FALLBACK_MODELS,
      live: false,
      syncedAt: new Date().toISOString(),
      message: "Đang hiển thị danh sách đã kiểm tra. Cấu hình VIETAPI_API_KEY để tự đồng bộ.",
    });
  }

  try {
    const baseUrl = (process.env.VIETAPI_BASE_URL || VIETAPI_BASE_URL).replace(/\/+$/, "");
    const upstream = await fetch(`${baseUrl}/models`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) throw new Error(`VietAPI HTTP ${upstream.status}`);

    const models = normalizeModelRecords(await upstream.json());
    if (!models.length) throw new Error("VietAPI không trả model OpenAI-compatible");

    cache = { models, expiresAt: now + CACHE_TTL_MS, syncedAt: new Date().toISOString() };
    return response({ ...cache, live: true, message: "Đang hiển thị model còn hoạt động từ VietAPI." });
  } catch (error) {
    console.error("[vietapi/models] sync failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return response({
      models: cache?.models || FALLBACK_MODELS,
      live: false,
      syncedAt: cache?.syncedAt || new Date().toISOString(),
      message: "VietAPI tạm thời chưa phản hồi; đang giữ danh sách gần nhất.",
    });
  }
}
