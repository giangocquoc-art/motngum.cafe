// Kiểm tra route nội bộ mà không ghi API key vào mã nguồn hoặc log.
// Yêu cầu Node.js 22+ (cùng mức tối thiểu được khai báo trong package.json).

const apiKey = process.env.VIETAPI_API_KEY?.trim();
const port = process.env.VIETAPI_TEST_PORT?.trim() || "3000";
const baseUrl = (process.env.VIETAPI_BASE_URL?.trim() || `http://127.0.0.1:${port}`).replace(
  /\/+$/,
  ""
);

function fail(message, exitCode = 1) {
  console.error(`❌ ${message}`);
  process.exitCode = exitCode;
}

function maskKey(value) {
  if (value.length <= 12) return `${value.slice(0, 3)}…`;
  return `${value.slice(0, 7)}…${value.slice(-4)}`;
}

async function testVietAPIConnection() {
  if (!apiKey) {
    fail(
      "Thiếu VIETAPI_API_KEY. Ví dụ PowerShell: $env:VIETAPI_API_KEY='sk-...'; node test-vietapi-connection.js",
      2
    );
    return;
  }

  let endpoint;
  try {
    endpoint = new URL("/api/vietapi/check-key", `${baseUrl}/`);
    if (!/^https?:$/.test(endpoint.protocol)) throw new Error("protocol");
  } catch {
    fail("VIETAPI_BASE_URL không hợp lệ; chỉ hỗ trợ http hoặc https.", 2);
    return;
  }

  console.log(`Đang kiểm tra ${endpoint.href} với key ${maskKey(apiKey)}...`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiKey }),
      signal: AbortSignal.timeout(15_000),
    });

    const raw = await response.text();
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      fail(`Server trả HTTP ${response.status} nhưng nội dung không phải JSON.`);
      return;
    }

    console.log("Kết quả:", JSON.stringify(result, null, 2));

    if (response.ok && result?.ok) {
      console.log("✅ Kết nối thành công với VietAPI");
      console.log("Trạng thái:", result.status || "—");
      console.log("Số dư:", result.primaryCredit || "—");
      return;
    }

    fail(`Kết nối thất bại (HTTP ${response.status}): ${result?.error || "Không rõ lỗi"}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`Không gọi được endpoint: ${message}`);
  }
}

void testVietAPIConnection();
