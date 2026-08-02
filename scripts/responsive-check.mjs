import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [
  urlArg = "http://127.0.0.1:3012/",
  widthArg = "390",
  heightArg = "844",
  portArg = "9224",
  screenshotArg,
] = process.argv.slice(2);

const pageUrl = new URL(urlArg);
const width = Number(widthArg);
const height = Number(heightArg);
const port = Number(portArg);
const isMobile = width <= 820;
const cdpBaseUrl = new URL(`http://127.0.0.1:${port}`);

if (!Number.isInteger(width) || width < 320 || !Number.isInteger(height) || height < 240) {
  throw new Error("Kích thước viewport không hợp lệ.");
}

async function createTarget() {
  const endpoint = new URL("/json/new?about:blank", cdpBaseUrl);
  const response = await fetch(endpoint, { method: "PUT" });
  if (!response.ok) throw new Error(`Chrome không tạo được target (HTTP ${response.status}).`);
  const target = await response.json();
  if (!target.id || !target.webSocketDebuggerUrl) {
    throw new Error("Chrome không trả về target DevTools hợp lệ.");
  }
  return target;
}

async function closeTarget(targetId) {
  await fetch(new URL(`/json/close/${targetId}`, cdpBaseUrl), { method: "PUT" }).catch(() => undefined);
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
    await new Promise((resolvePromise, reject) => {
      this.socket.addEventListener("open", resolvePromise, { once: true });
      this.socket.addEventListener("error", () => reject(new Error("Không thể kết nối Chrome DevTools.")), { once: true });
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
    return new Promise((resolvePromise, reject) => {
      const id = ++this.lastId;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Chrome DevTools timeout: ${method}`));
      }, 15_000);
      this.pending.set(id, { resolve: resolvePromise, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  waitFor(method, timeout = 15_000) {
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        stopListening();
        reject(new Error(`Timeout chờ sự kiện ${method}.`));
      }, timeout);
      const stopListening = this.on((message) => {
        if (message.method !== method) return;
        clearTimeout(timer);
        stopListening();
        resolvePromise(message.params || {});
      });
    });
  }

  close() {
    this.socket?.close();
  }

  #handle(message) {
    if (message.id && this.pending.has(message.id)) {
      const { resolve: resolvePromise, reject, timer } = this.pending.get(message.id);
      clearTimeout(timer);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolvePromise(message.result);
      return;
    }
    for (const listener of this.listeners) listener(message);
  }
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime.evaluate lỗi.");
  return result.result.value;
}

let target;
let client;

try {
  target = await createTarget();
  client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await Promise.all([
    client.send("Page.enable"),
    client.send("Runtime.enable"),
    client.send("Network.enable"),
  ]);
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: isMobile,
    screenWidth: width,
    screenHeight: height,
  });
  await client.send("Emulation.setUserAgentOverride", {
    userAgent: isMobile
      ? "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36"
      : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  });

  const loaded = client.waitFor("Page.loadEventFired", 20_000);
  await client.send("Page.navigate", { url: pageUrl.href });
  await loaded;
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));

  const result = await evaluate(client, `(() => {
    const menu = document.querySelector('.menu-toggle');
    const header = document.querySelector('.site-header');
    const heading = document.querySelector('h1');
    const rect = (element) => element ? element.getBoundingClientRect().toJSON() : null;
    return {
      url: location.href,
      innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      mobileMediaMatches: matchMedia('(max-width: 820px)').matches,
      menuDisplay: menu ? getComputedStyle(menu).display : null,
      menuRect: rect(menu),
      headerRect: rect(header),
      headingRect: rect(heading),
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
    };
  })()`);
  console.log(JSON.stringify({ ...result, targetId: target.id }, null, 2));

  if (result.scrollWidth > result.clientWidth + 1) {
    process.exitCode = 1;
    console.error(`Phát hiện tràn ngang: ${result.scrollWidth}px > ${result.clientWidth}px.`);
  }
  if (result.brokenImages.length) {
    process.exitCode = 1;
    console.error(`Ảnh lỗi: ${result.brokenImages.join(", ")}`);
  }

  if (screenshotArg) {
    const screenshotPath = resolve(screenshotArg);
    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await mkdir(dirname(screenshotPath), { recursive: true });
    await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
    console.log(`Screenshot: ${screenshotPath}`);
  }
} finally {
  client?.close();
  if (target?.id) await closeTarget(target.id);
}
