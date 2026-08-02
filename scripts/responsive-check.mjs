import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [
  url = "http://127.0.0.1:3012/",
  widthArg = "390",
  heightArg = "844",
  portArg = "9224",
  screenshotArg,
] = process.argv.slice(2);

const width = Number(widthArg);
const height = Number(heightArg);
const port = Number(portArg);
const isMobile = width <= 820;
const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === "page");

if (!target?.webSocketDebuggerUrl) {
  throw new Error(`Không tìm thấy page target trên cổng ${port}.`);
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let id = 0;

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const messageId = ++id;
    pending.set(messageId, { resolve, reject });
    socket.send(JSON.stringify({ id: messageId, method, params }));
  });
}

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: isMobile,
  screenWidth: width,
  screenHeight: height,
});
await send("Emulation.setUserAgentOverride", {
  userAgent: isMobile
    ? "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36"
    : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
});
await send("Page.enable");
await send("Page.navigate", { url });
await new Promise((resolve) => setTimeout(resolve, 2000));

const expression = `(() => {
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
  };
})()`;

const result = await send("Runtime.evaluate", { expression, returnByValue: true });
console.log(JSON.stringify(result.result.value, null, 2));

if (screenshotArg) {
  const screenshotPath = resolve(screenshotArg);
  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await mkdir(dirname(screenshotPath), { recursive: true });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
  console.log(`Screenshot: ${screenshotPath}`);
}

socket.close();
