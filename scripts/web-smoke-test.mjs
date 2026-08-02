#!/usr/bin/env node

/**
 * Browser smoke test with only Node's built-ins and the Chrome DevTools Protocol.
 *
 * Usage:
 *   node scripts/web-smoke-test.mjs http://127.0.0.1:3000 --cdp=http://127.0.0.1:9224
 */

const FALLBACK_ROUTES = [
  "/",
  "/menu",
  "/dich-vu",
  "/api",
  "/kien-thuc",
  "/chinh-sach-bao-mat",
  "/nguyen-tac-noi-dung",
  "/qr",
  "/dao-tao-ai",
  "/tu-van-marketing",
  "/bang-gia",
  "/ve-mot-ngum",
  "/lien-he",
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844, mobile: true },
  { name: "tablet", width: 900, height: 1024, mobile: false },
  { name: "desktop", width: 1440, height: 900, mobile: false },
];

function parseArgs(argv) {
  let base = process.env.WEB_SMOKE_BASE_URL || "http://127.0.0.1:3000";
  let cdp = process.env.WEB_SMOKE_CDP_URL || "http://127.0.0.1:9224";

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--cdp") cdp = argv[++index];
    else if (value.startsWith("--cdp=")) cdp = value.slice("--cdp=".length);
    else if (value === "--base") base = argv[++index];
    else if (value.startsWith("--base=")) base = value.slice("--base=".length);
    else if (!value.startsWith("--")) base = value;
  }

  return {
    baseUrl: new URL(base),
    cdpUrl: new URL(cdp),
  };
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function normalizedOrigin(url) {
  return new URL(url).origin;
}

function urlFor(baseUrl, path) {
  const result = new URL(path, baseUrl);
  result.hash = "";
  return result;
}

function samePath(left, right) {
  const a = new URL(left);
  const b = new URL(right);
  return a.pathname.replace(/\/$/, "") === b.pathname.replace(/\/$/, "") && a.search === b.search;
}

async function routesFromSitemap(baseUrl) {
  try {
    const response = await fetch(urlFor(baseUrl, "/sitemap.xml"), { redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const routes = [...xml.matchAll(/<loc>(.*?)<\/loc>/gs)]
      .map((match) => match[1].replace(/&amp;/g, "&").trim())
      .map((location) => new URL(location).pathname)
      .filter((path) => path.startsWith("/"));
    if (!routes.length) throw new Error("không tìm thấy <loc>");
    return [...new Set(routes)];
  } catch (error) {
    console.warn(`Không đọc được sitemap (${error.message}); dùng ${FALLBACK_ROUTES.length} route mặc định.`);
    return FALLBACK_ROUTES;
  }
}

async function createTarget(cdpUrl) {
  const endpoint = new URL("/json/new?about:blank", cdpUrl);
  const response = await fetch(endpoint, { method: "PUT" });
  if (!response.ok) throw new Error(`Chrome không tạo được target mới (HTTP ${response.status}).`);
  const target = await response.json();
  if (!target.webSocketDebuggerUrl) throw new Error("Chrome không trả về WebSocket Debugger URL.");
  return target.webSocketDebuggerUrl;
}

class CdpClient {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl;
    this.lastId = 0;
    this.pending = new Map();
    this.listeners = new Set();
  }

  async connect() {
    this.socket = new WebSocket(this.webSocketUrl);
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", () => reject(new Error("Không thể kết nối tới Chrome DevTools.")), { once: true });
    });
    this.socket.addEventListener("message", (event) => this.#handle(JSON.parse(event.data)));
    this.socket.addEventListener("close", () => {
      for (const { reject, timer } of this.pending.values()) {
        clearTimeout(timer);
        reject(new Error("Kết nối Chrome DevTools đã đóng."));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.lastId;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Chrome DevTools timeout: ${method}`));
      }, 15_000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  close() {
    this.socket?.close();
  }

  #handle(message) {
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject, timer } = this.pending.get(message.id);
      clearTimeout(timer);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    for (const listener of this.listeners) listener(message);
  }
}

async function evaluate(client, expression, awaitPromise = false) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime.evaluate lỗi.");
  return result.result.value;
}

function makeIssue(issues, viewport, path, message) {
  issues.push(`[${viewport.name}] ${path}: ${message}`);
}

async function verifyCompactMenu(client) {
  const before = await evaluate(client, `(() => {
    const button = document.querySelector('.menu-toggle[aria-controls]');
    const menu = button && document.getElementById(button.getAttribute('aria-controls'));
    if (!button || !menu) return { found: false };
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    return { found: true, buttonVisible: visible(button), expanded: button.getAttribute('aria-expanded'), menuVisible: visible(menu) };
  })()`);
  if (!before.found) return "không tìm thấy nút menu thu gọn (.menu-toggle[aria-controls]).";
  if (!before.buttonVisible) return "nút menu thu gọn không hiển thị ở viewport nhỏ.";

  await evaluate(client, `document.querySelector('.menu-toggle[aria-controls]').click()`);
  await delay(100);
  const after = await evaluate(client, `(() => {
    const button = document.querySelector('.menu-toggle[aria-controls]');
    const menu = document.getElementById(button?.getAttribute('aria-controls'));
    const style = menu && getComputedStyle(menu);
    return { expanded: button?.getAttribute('aria-expanded'), menuVisible: Boolean(menu && style.display !== 'none' && style.visibility !== 'hidden') };
  })()`);
  if (after.expanded !== "true" || !after.menuVisible) return "click menu thu gọn không mở điều hướng.";
  return null;
}

async function verifyApiShowcase(client) {
  const initial = await evaluate(client, `(() => ({
    search: Boolean(document.querySelector('.api-search input[type="search"]')),
    filters: document.querySelectorAll('.api-filters button').length,
    cards: document.querySelectorAll('.api-model-card').length,
    status: Boolean(document.querySelector('.api-showcase-status')),
  }))()`);
  if (!initial.search || initial.filters < 2 || initial.cards < 1 || !initial.status) {
    return "catalogue /api thiếu search, filter, trạng thái đồng bộ hoặc model card.";
  }

  const clickedGpt = await evaluate(client, `(() => {
    const button = [...document.querySelectorAll('.api-filters button')]
      .find((item) => item.textContent.trim().startsWith('GPT'));
    button?.click();
    return Boolean(button);
  })()`);
  if (!clickedGpt) return "không tìm thấy filter GPT trên /api.";
  await delay(100);

  const filtered = await evaluate(client, `(() => {
    const cards = [...document.querySelectorAll('.api-model-card')];
    return {
      count: cards.length,
      allGpt: cards.every((card) => card.querySelector('.api-model-family')?.textContent.trim() === 'GPT'),
      pressed: [...document.querySelectorAll('.api-filters button')]
        .some((button) => button.textContent.trim().startsWith('GPT') && button.getAttribute('aria-pressed') === 'true'),
    };
  })()`);
  if (!filtered.count || !filtered.allGpt || !filtered.pressed) {
    return "filter GPT trên /api không cập nhật đúng model card hoặc aria-pressed.";
  }

  const searchWorked = await evaluate(client, `(() => {
    const allButton = [...document.querySelectorAll('.api-filters button')]
      .find((item) => item.textContent.trim().startsWith('Tất cả'));
    allButton?.click();
    const input = document.querySelector('.api-search input[type="search"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (!input || !setter) return false;
    setter.call(input, 'deepseek');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  if (!searchWorked) return "không thao tác được ô tìm model trên /api.";
  await delay(100);

  const searched = await evaluate(client, `(() => {
    const cards = [...document.querySelectorAll('.api-model-card')];
    return cards.length > 0 && cards.every((card) =>
      card.querySelector('.api-model-id')?.textContent.toLowerCase().includes('deepseek')
    );
  })()`);
  if (!searched) return "tìm kiếm “deepseek” trên /api không lọc đúng model card.";
  return null;
}

async function runPage(client, baseUrl, viewport, path, issues, links) {
  const pageUrl = urlFor(baseUrl, path).href;
  const browserErrors = [];
  const documentResponses = [];
  let loaded = false;
  const stopListening = client.on((message) => {
    if (message.method === "Page.loadEventFired") loaded = true;
    if (message.method === "Runtime.exceptionThrown") {
      browserErrors.push(message.params.exceptionDetails.text || "JavaScript exception");
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      const text = message.params.args.map((entry) => entry.value ?? entry.description ?? "console.error").join(" ");
      browserErrors.push(text);
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      browserErrors.push(message.params.entry.text);
    }
    if (message.method === "Network.responseReceived" && message.params.type === "Document" && samePath(message.params.response.url, pageUrl)) {
      documentResponses.push(message.params.response);
    }
  });

  try {
    await client.send("Page.navigate", { url: pageUrl });
    const deadline = Date.now() + 10_000;
    while (!loaded && Date.now() < deadline) await delay(100);
    if (!loaded) makeIssue(issues, viewport, path, "timeout chờ trang tải xong.");
    await delay(500);

    const response = documentResponses.at(-1);
    if (!response) makeIssue(issues, viewport, path, "không nhận được HTTP response của document.");
    else if (response.status < 200 || response.status >= 400) makeIssue(issues, viewport, path, `HTTP ${response.status}.`);

    await evaluate(client, `window.scrollTo(0, document.body.scrollHeight)`);
    await delay(250);
    const details = await evaluate(client, `(() => {
      const uniqueLinks = [...new Set([...document.querySelectorAll('a[href]')].map((anchor) => anchor.href))];
      return {
        h1Count: document.querySelectorAll('h1').length,
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        clientWidth: document.documentElement.clientWidth,
        brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src || '(không có src)'),
        links: uniqueLinks,
      };
    })()`);
    if (details.h1Count !== 1) makeIssue(issues, viewport, path, `có ${details.h1Count} thẻ H1 (cần đúng 1).`);
    if (details.scrollWidth > details.clientWidth + 1) {
      makeIssue(issues, viewport, path, `tràn ngang ${details.scrollWidth}px > ${details.clientWidth}px.`);
    }
    for (const source of details.brokenImages) makeIssue(issues, viewport, path, `ảnh không tải được: ${source}`);
    for (const href of details.links) {
      const target = new URL(href);
      if (target.origin === normalizedOrigin(baseUrl) && !target.pathname.startsWith("/_next/")) {
        target.hash = "";
        links.add(target.href);
      }
    }
    if (browserErrors.length) {
      for (const error of [...new Set(browserErrors)].slice(0, 5)) makeIssue(issues, viewport, path, `browser error: ${error}`);
    }
  } catch (error) {
    makeIssue(issues, viewport, path, `không kiểm tra được (${error.message}).`);
  } finally {
    stopListening();
  }
}

async function checkLinks(links, issues) {
  const results = await Promise.all(
    [...links].map(async (href) => {
      try {
        const response = await fetch(href, { method: "GET", redirect: "manual" });
        return { href, status: response.status };
      } catch (error) {
        return { href, error };
      }
    })
  );
  for (const result of results) {
    if (result.error) issues.push(`[links] ${result.href}: không tải được (${result.error.message}).`);
    else if (result.status >= 400) issues.push(`[links] ${result.href}: HTTP ${result.status}.`);
  }
}

async function main() {
  const { baseUrl, cdpUrl } = parseArgs(process.argv.slice(2));
  const routes = await routesFromSitemap(baseUrl);
  const issues = [];
  const links = new Set();
  let webSocketUrl;
  let client;

  try {
    webSocketUrl = await createTarget(cdpUrl);
    client = new CdpClient(webSocketUrl);
    await client.connect();
    await Promise.all([client.send("Page.enable"), client.send("Runtime.enable"), client.send("Network.enable"), client.send("Log.enable")]);

    for (const viewport of VIEWPORTS) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.mobile,
        screenWidth: viewport.width,
        screenHeight: viewport.height,
      });
      await client.send("Emulation.setUserAgentOverride", {
        userAgent: viewport.mobile
          ? "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36"
          : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      });
      for (const path of routes) {
        await runPage(client, baseUrl, viewport, path, issues, links);
        if (path === "/api") {
          const apiIssue = await verifyApiShowcase(client);
          if (apiIssue) makeIssue(issues, viewport, path, apiIssue);
        }
      }
      if (viewport.width <= 1100) {
        await client.send("Page.navigate", { url: urlFor(baseUrl, routes[0]).href });
        await delay(700);
        const menuIssue = await verifyCompactMenu(client);
        if (menuIssue) makeIssue(issues, viewport, routes[0], menuIssue);
      }
    }
    await checkLinks(links, issues);
  } finally {
    client?.close();
    if (webSocketUrl) {
      const targetId = new URL(webSocketUrl).pathname.split("/").pop();
      if (targetId) fetch(new URL(`/json/close/${targetId}`, cdpUrl), { method: "PUT" }).catch(() => {});
    }
  }

  console.log(`Web smoke test: ${routes.length} route, ${VIEWPORTS.length} viewport, ${links.size} internal link.`);
  if (issues.length) {
    console.error(`Lỗi (${issues.length}):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log("Kết quả: không phát hiện lỗi hiển thị hoặc runtime trong phạm vi smoke test.");
  }
}

main().catch((error) => {
  console.error(`Web smoke test không thể chạy: ${error.message}`);
  process.exitCode = 1;
});
