const baseUrl = new URL(process.argv[2] || "http://127.0.0.1:3000");
const normalizedBase = baseUrl.href.replace(/\/$/, "");

function decodeHtml(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[3]);
  }
  return attributes;
}

function getMeta(html, key, value) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    if (attributes[key] === value) return attributes.content || "";
  }
  return "";
}

function getCanonical(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    if ((attributes.rel || "").split(/\s+/).includes("canonical")) return attributes.href || "";
  }
  return "";
}

function stripHtml(html) {
  return decodeHtml(
    html
      .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
  ).trim();
}

function extractTitle(html) {
  return decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
}

function extractJsonLd(html) {
  const values = [];
  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    values.push(JSON.parse(decodeHtml(match[1])));
  }
  return values;
}

function collectSchemaTypes(value, types = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectSchemaTypes(item, types);
    return types;
  }
  if (!value || typeof value !== "object") return types;

  const type = value["@type"];
  if (Array.isArray(type)) type.forEach((item) => types.add(item));
  else if (typeof type === "string") types.add(type);

  for (const child of Object.values(value)) collectSchemaTypes(child, types);
  return types;
}

function expectedSchemaTypes(path) {
  if (path === "/") return ["Organization", "WebSite"];
  if (path === "/kien-thuc") return ["CollectionPage", "ItemList", "BreadcrumbList"];
  if (path.startsWith("/kien-thuc/")) return ["BlogPosting", "BreadcrumbList", "FAQPage"];
  if (path.startsWith("/dich-vu/")) return ["Service", "BreadcrumbList", "FAQPage"];
  if (path === "/dao-tao-ai") return ["Service", "BreadcrumbList", "FAQPage"];
  if (path === "/tu-van-marketing") return ["Service", "BreadcrumbList"];
  if (path === "/ve-mot-ngum") return ["AboutPage", "BreadcrumbList"];
  if (path === "/lien-he") return ["ContactPage", "BreadcrumbList"];
  if (path === "/nguyen-tac-noi-dung") return ["WebPage", "BreadcrumbList"];
  if (path === "/chinh-sach-bao-mat") return ["WebPage", "BreadcrumbList"];
  return [];
}

function urlForBase(urlOrPath) {
  const parsed = new URL(urlOrPath, baseUrl);
  return `${normalizedBase}${parsed.pathname}${parsed.search}`;
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    headers: { "user-agent": "MotNgumSeoAudit/1.0" },
    ...options,
  });
  return { response, text: await response.text() };
}

const errors = [];
const warnings = [];

const { response: sitemapResponse, text: sitemapXml } = await fetchText(
  `${normalizedBase}/sitemap.xml`
);
if (!sitemapResponse.ok) {
  throw new Error(`Không tải được sitemap: HTTP ${sitemapResponse.status}`);
}

const sitemapLocations = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) =>
  decodeHtml(match[1])
);
const sitemapPaths = sitemapLocations.map((location) => new URL(location).pathname);
const uniquePaths = [...new Set(sitemapPaths)];

if (uniquePaths.length !== sitemapPaths.length) {
  errors.push(`Sitemap có ${sitemapPaths.length - uniquePaths.length} URL trùng.`);
}

const pageResults = await Promise.all(
  uniquePaths.map(async (path) => {
    const auditUrl = urlForBase(path);
    try {
      const { response, text: html } = await fetchText(auditUrl);
      return { path, auditUrl, response, html };
    } catch (error) {
      return { path, auditUrl, error };
    }
  })
);

const titleOwners = new Map();
const descriptionOwners = new Map();
const internalPaths = new Set();
const socialImagePaths = new Set();

for (const result of pageResults) {
  if (result.error) {
    errors.push(`${result.path}: không tải được (${result.error.message}).`);
    continue;
  }

  const { path, response, html } = result;
  if (response.status !== 200) {
    errors.push(`${path}: HTTP ${response.status}.`);
    continue;
  }

  const title = extractTitle(html);
  const description = getMeta(html, "name", "description");
  const robots = getMeta(html, "name", "robots");
  const canonical = getCanonical(html);
  const openGraphTitle = getMeta(html, "property", "og:title");
  const openGraphDescription = getMeta(html, "property", "og:description");
  const openGraphImage = getMeta(html, "property", "og:image");
  const openGraphImageWidth = getMeta(html, "property", "og:image:width");
  const openGraphImageHeight = getMeta(html, "property", "og:image:height");
  const h1Count = [...html.matchAll(/<h1\b/gi)].length;

  if (!title) errors.push(`${path}: thiếu title.`);
  if (!description) errors.push(`${path}: thiếu meta description.`);
  if (!canonical) errors.push(`${path}: thiếu canonical.`);
  if (h1Count !== 1) errors.push(`${path}: có ${h1Count} thẻ H1.`);
  if (!openGraphTitle || !openGraphDescription || !openGraphImage) {
    errors.push(`${path}: thiếu dữ liệu Open Graph bắt buộc.`);
  }
  if (openGraphImageWidth !== "1200" || openGraphImageHeight !== "630") {
    errors.push(`${path}: metadata ảnh chia sẻ không khai báo đúng 1200×630.`);
  }
  if (/noindex/i.test(robots)) errors.push(`${path}: URL trong sitemap đang noindex.`);

  if (canonical) {
    const canonicalPath = new URL(canonical, baseUrl).pathname.replace(/\/$/, "") || "/";
    const expectedPath = path.replace(/\/$/, "") || "/";
    if (canonicalPath !== expectedPath) {
      errors.push(`${path}: canonical trỏ đến ${canonicalPath}.`);
    }
  }

  if (title.length < 20 || title.length > 65) {
    warnings.push(`${path}: title dài ${title.length} ký tự.`);
  }
  if (description.length < 100 || description.length > 165) {
    warnings.push(`${path}: description dài ${description.length} ký tự.`);
  }

  if (titleOwners.has(title)) {
    errors.push(`${path}: trùng title với ${titleOwners.get(title)}.`);
  } else {
    titleOwners.set(title, path);
  }
  if (descriptionOwners.has(description)) {
    errors.push(`${path}: trùng description với ${descriptionOwners.get(description)}.`);
  } else {
    descriptionOwners.set(description, path);
  }

  try {
    const jsonLd = extractJsonLd(html);
    if (jsonLd.length === 0) errors.push(`${path}: không có JSON-LD.`);
    const schemaTypes = collectSchemaTypes(jsonLd);
    for (const expectedType of expectedSchemaTypes(path)) {
      if (!schemaTypes.has(expectedType)) {
        errors.push(`${path}: thiếu schema ${expectedType}.`);
      }
    }
  } catch (error) {
    errors.push(`${path}: JSON-LD không hợp lệ (${error.message}).`);
  }

  if (path.startsWith("/kien-thuc/") && path !== "/kien-thuc/") {
    const articleHtml = html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] || html;
    const wordCount = stripHtml(articleHtml).split(/\s+/).filter(Boolean).length;
    if (wordCount < 800) warnings.push(`${path}: chỉ khoảng ${wordCount} từ hiển thị.`);
  }

  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = parseAttributes(match[0]).href;
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    const target = new URL(href, baseUrl);
    const isInternal = href.startsWith("/") || target.host === baseUrl.host;
    if (isInternal) internalPaths.add(target.pathname);
  }

  if (openGraphImage) socialImagePaths.add(new URL(openGraphImage, baseUrl).pathname);
}

const linkedResults = await Promise.all(
  [...internalPaths].map(async (path) => {
    try {
      const response = await fetch(urlForBase(path), {
        redirect: "manual",
        headers: { "user-agent": "MotNgumSeoAudit/1.0" },
      });
      return { path, status: response.status };
    } catch (error) {
      return { path, error };
    }
  })
);

for (const result of linkedResults) {
  if (result.error || result.status >= 400) {
    errors.push(
      `${result.path}: liên kết nội bộ lỗi${result.error ? ` (${result.error.message})` : ` HTTP ${result.status}`}.`
    );
  }
}

const imageResults = await Promise.all(
  [...socialImagePaths].map(async (path) => {
    try {
      const response = await fetch(urlForBase(path), {
        headers: { "user-agent": "MotNgumSeoAudit/1.0" },
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      return { path, response, buffer };
    } catch (error) {
      return { path, error };
    }
  })
);

for (const result of imageResults) {
  if (result.error || !result.response.ok) {
    errors.push(`${result.path}: ảnh chia sẻ không tải được.`);
  } else if (!result.response.headers.get("content-type")?.startsWith("image/")) {
    errors.push(`${result.path}: ảnh chia sẻ trả về sai content-type.`);
  } else if (
    result.buffer.length < 24 ||
    result.buffer.readUInt32BE(16) !== 1200 ||
    result.buffer.readUInt32BE(20) !== 630
  ) {
    errors.push(`${result.path}: tệp ảnh chia sẻ không đúng kích thước 1200×630.`);
  }
}

const robotsResponse = await fetch(`${normalizedBase}/robots.txt`);
if (!robotsResponse.ok || !(await robotsResponse.text()).includes("sitemap")) {
  errors.push("robots.txt thiếu hoặc không khai báo sitemap.");
}

console.log(`SEO audit: ${uniquePaths.length} URL sitemap, ${internalPaths.size} liên kết nội bộ, ${socialImagePaths.size} ảnh chia sẻ.`);
if (warnings.length) {
  console.log(`Cảnh báo (${warnings.length}):`);
  for (const warning of warnings) console.log(`- ${warning}`);
}
if (errors.length) {
  console.error(`Lỗi (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Kết quả: không phát hiện lỗi SEO kỹ thuật trong phạm vi kiểm tra.");
}
