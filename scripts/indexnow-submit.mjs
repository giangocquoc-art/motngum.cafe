const INDEXNOW_KEY = "b0c49fccbef165a4e3463b9f54b6c27c";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const baseArg = args.find((arg) => !arg.startsWith("--")) || "https://motngum.cafe";
const baseUrl = new URL(baseArg);
const base = baseUrl.href.replace(/\/$/, "");

if (baseUrl.protocol !== "https:") {
  throw new Error("IndexNow chỉ được gửi cho website HTTPS.");
}

const sitemapResponse = await fetch(`${base}/sitemap.xml`, {
  headers: { "user-agent": "MotNgumIndexNow/1.0" },
});
if (!sitemapResponse.ok) {
  throw new Error(`Không tải được sitemap: HTTP ${sitemapResponse.status}`);
}

const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) =>
  match[1].replace(/&amp;/g, "&")
);
const uniqueUrls = [...new Set(urlList)];

if (uniqueUrls.length === 0) throw new Error("Sitemap không có URL để gửi.");
if (uniqueUrls.length > 10_000) throw new Error("Sitemap vượt giới hạn 10.000 URL mỗi lần gửi.");

for (const url of uniqueUrls) {
  const parsed = new URL(url);
  if (parsed.hostname !== baseUrl.hostname) {
    throw new Error(`URL khác host trong sitemap: ${url}`);
  }
}

const keyLocation = `${base}/${INDEXNOW_KEY}.txt`;
const keyResponse = await fetch(keyLocation, {
  headers: { "user-agent": "MotNgumIndexNow/1.0" },
});
const keyContent = (await keyResponse.text()).trim();
if (!keyResponse.ok || keyContent !== INDEXNOW_KEY) {
  throw new Error(`Tệp xác minh IndexNow chưa hợp lệ tại ${keyLocation}.`);
}

const payload = {
  host: baseUrl.hostname,
  key: INDEXNOW_KEY,
  keyLocation,
  urlList: uniqueUrls,
};

if (dryRun) {
  console.log(JSON.stringify({ dryRun: true, endpoint: INDEXNOW_ENDPOINT, ...payload }, null, 2));
  process.exit(0);
}

const response = await fetch(INDEXNOW_ENDPOINT, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});
const responseBody = await response.text();

if (![200, 202].includes(response.status)) {
  throw new Error(
    `IndexNow trả về HTTP ${response.status}${responseBody ? `: ${responseBody}` : ""}`
  );
}

console.log(
  JSON.stringify(
    {
      ok: true,
      status: response.status,
      submittedUrls: uniqueUrls.length,
      host: baseUrl.hostname,
      keyLocation,
    },
    null,
    2
  )
);
