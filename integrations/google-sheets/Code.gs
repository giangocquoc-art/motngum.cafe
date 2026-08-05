const SPREADSHEET_ID = "1aOr0a218u3k71RM0XMekenQoPmZuvqfkjSqc1LrTdTg";
const SHEET_NAME = "Leads";

const SERVICE_LABELS = {
  "thiet-ke-website": "Thiết kế website",
  "chatbot-ai": "Chatbot AI",
  "xu-ly-du-lieu": "Xử lý dữ liệu",
  "tu-dong-hoa-quy-trinh": "Tự động hóa",
  "ho-tro-dang-bai": "Hỗ trợ đăng bài",
  "ho-tro-tuong-tac": "Hỗ trợ tương tác",
  "quang-cao": "Chạy quảng cáo",
  "dao-tao-ai-co-ban": "Đào tạo AI",
  "tu-van-marketing": "Tư vấn marketing miễn phí",
  "api-ai": "API AI",
};

const HEADERS = [
  "Thời gian",
  "Mã lead",
  "Họ và tên",
  "Số điện thoại",
  "Email",
  "Dịch vụ",
  "Model API",
  "Vấn đề",
  "Ngân sách",
  "Thời gian liên hệ",
  "Lời nhắn",
  "Nguồn",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
];

function doGet() {
  return jsonResponse({ ok: true, service: "motngum-leads" });
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    const data = JSON.parse((e.postData && e.postData.contents) || "{}");
    const webhookSecret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");

    if (!webhookSecret || data.secret !== webhookSecret) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    if (!data.name || !data.phone || !data.problem) {
      return jsonResponse({ ok: false, error: "Missing required fields" });
    }

    lock.waitLock(10000);

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    } else {
      const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      if (existingHeaders.indexOf("Model API") === -1) {
        sheet.insertColumnAfter(6);
        sheet.getRange(1, 7).setValue("Model API").setFontWeight("bold");
      }
    }

    sheet.appendRow([
      new Date(),
      Utilities.getUuid(),
      safeCell(data.name),
      safeCell(data.phone),
      safeCell(data.email),
      safeCell(SERVICE_LABELS[data.service] || data.service),
      safeCell(data.model),
      safeCell(data.problem),
      safeCell(data.budget),
      safeCell(data.contactTime),
      safeCell(data.note),
      safeCell(data.source),
      safeCell(data.utmSource),
      safeCell(data.utmMedium),
      safeCell(data.utmCampaign),
    ]);

    SpreadsheetApp.flush();
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function safeCell(value) {
  const text = String(value == null ? "" : value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
