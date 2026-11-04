(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory;
  else root.ChimSeBranchTutor = factory(root);
})(typeof window !== "undefined" ? window : globalThis, function createBranchTutor(environment) {
  "use strict";
  var env = environment || (typeof window !== "undefined" ? window : globalThis);
  var document = env.document;
  var PRACTICE_SCENES = new Set([
    "hsk1.e01.arrival-greeting", "hsk1.e01.school-introduction", "hsk1.e01.xiaoyu-friendship",
    "hsk1.e01.class-counting", "hsk1.e01.liu-noodle-order", "hsk1.e01.liu-payment", "hsk1.e01.walk-home"
  ]);
  var MAX_MESSAGES = 6, MAX_MESSAGE_CHARS = 400, MAX_REPLY_CHARS = 1400, MAX_WAIT_MS = 54000;
  var panel = null, messagesNode = null, statusNode = null, input = null, send = null;
  var available = false, activeScene = "", currentScene = "", opened = false;
  var onHelp = null, onClose = null, history = [], chatItems = [], currentItem = 0, currentPage = 0, generation = 0, pending = null, resizeObserver = null;

  function make(tag, text) {
    var node = document.createElement(tag);
    if (text) node.textContent = text;
    return node;
  }
  function addChat(role, text, className) {
    var item = { role: role, text: text, className: className || "" };
    chatItems.push(item);
    if (chatItems.length > MAX_MESSAGES) chatItems.shift();
    currentItem = chatItems.length - 1;
    currentPage = 0;
    renderCurrentChat();
    return item;
  }
  function appendMessage(role, text, className) { return addChat(role, text, className); }
  function removeChatItem(item) {
    var index = chatItems.indexOf(item);
    if (index < 0) return;
    chatItems.splice(index, 1);
    currentItem = Math.max(0, Math.min(currentItem, chatItems.length - 1));
    currentPage = 0;
    renderCurrentChat();
  }
  function appendPagedAssistant(text) { return addChat("assistant", text, ""); }
  function fittedPages(copy, text, available) {
    if (!text) return [""];
    if (!(available > 0) || typeof copy.scrollHeight !== "number") return Array.from(text);
    var pages = [], start = 0, guard = 0;
    while (start < text.length && guard++ < text.length) {
      var low = start + 1, high = text.length, fit = start;
      while (low <= high) {
        var mid = Math.floor((low + high) / 2);
        copy.textContent = text.slice(start, mid);
        if (copy.scrollHeight <= available) { fit = mid; low = mid + 1; } else high = mid - 1;
      }
      if (fit <= start) fit = Math.min(text.length, start + 1);
      if (fit < text.length && /[\uD800-\uDBFF]/.test(text.charAt(fit - 1)) && /[\uDC00-\uDFFF]/.test(text.charAt(fit))) fit -= 1;
      if (fit < text.length) {
        var boundary = Math.max(text.lastIndexOf(" ", fit), text.lastIndexOf("\n", fit));
        if (boundary > start + Math.floor((fit - start) / 2)) fit = boundary + 1;
      }
      pages.push(text.slice(start, fit));
      start = fit;
    }
    return pages.length ? pages : [text];
  }
  function renderCurrentChat() {
    if (!messagesNode || !chatItems.length) return;
    currentItem = Math.max(0, Math.min(currentItem, chatItems.length - 1));
    var item = chatItems[currentItem], wrapper = make("article"), copy = make("p"), nav = make("nav");
    wrapper.className = "branch-tutor-message branch-tutor-" + item.role + (item.className ? " " + item.className : "");
    wrapper.setAttribute("data-role", item.role);
    copy.className = "branch-tutor-reply-page";
    // Measure natural text height; the displayed copy is flex-sized by the dialog CSS.
    if (copy.style) { copy.style.flex = "none"; copy.style.height = "auto"; copy.style.minHeight = "0"; copy.style.maxHeight = "none"; copy.style.overflow = "visible"; }
    nav.className = "branch-tutor-reply-pages";
    nav.setAttribute("aria-label", "Điều hướng tin nhắn và phần trả lời");
    var prevMessage = make("button", "← Tin trước"), prevPage = make("button", "‹ Trang"), status = make("span"), nextPage = make("button", "Trang ›"), nextMessage = make("button", "Tin sau →");
    [prevMessage, prevPage, nextPage, nextMessage].forEach(function (button) { button.type = "button"; });
    nav.append(prevMessage, prevPage, status, nextPage, nextMessage);
    wrapper.append(copy, nav);
    messagesNode.replaceChildren(wrapper);
    var navHeight = nav.offsetHeight || 44;
    var availableHeight = Math.max(0, messagesNode.clientHeight - navHeight - 12);
    var pages = fittedPages(copy, item.text, availableHeight);
    currentPage = Math.max(0, Math.min(currentPage, pages.length - 1));
    function renderPage() {
      copy.textContent = pages[currentPage];
      status.textContent = (currentItem + 1) + " / " + chatItems.length + " · " + (currentPage + 1) + " / " + pages.length;
      prevMessage.disabled = currentItem === 0;
      nextMessage.disabled = currentItem === chatItems.length - 1;
      prevPage.disabled = currentPage === 0;
      nextPage.disabled = currentPage === pages.length - 1;
      if (wrapper.classList) wrapper.classList.toggle("branch-tutor-paged", pages.length > 1);
    }
    prevMessage.addEventListener("click", function () { if (currentItem > 0) { currentItem--; currentPage = 0; renderCurrentChat(); } });
    nextMessage.addEventListener("click", function () { if (currentItem + 1 < chatItems.length) { currentItem++; currentPage = 0; renderCurrentChat(); } });
    prevPage.addEventListener("click", function () { if (currentPage > 0) { currentPage--; renderPage(); } });
    nextPage.addEventListener("click", function () { if (currentPage + 1 < pages.length) { currentPage++; renderPage(); } });
    renderPage();
  }
  function setStatus(text, kind) {
    statusNode.textContent = text || "";
    statusNode.dataset.state = kind || "";
  }
  function ensurePanel() {
    if (!document) return false;
    panel = document.getElementById("branchTutorPanel");
    if (!panel) return false;
    if (panel.dataset.branchTutorReady === "true") {
      messagesNode = panel.querySelector("[data-branch-tutor-messages]");
      statusNode = panel.querySelector("[data-branch-tutor-status]");
      input = panel.querySelector("[data-branch-tutor-input]");
      send = panel.querySelector("[data-branch-tutor-send]");
      return !!(messagesNode && statusNode && input && send);
    }
    var heading = make("h2", "Hỏi Sẻ");
    var closeButton = make("button", "Đóng");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Đóng Hỏi Sẻ");
    closeButton.addEventListener("click", close);
    messagesNode = make("div");
    messagesNode.dataset.branchTutorMessages = "";
    messagesNode.setAttribute("role", "log");
    messagesNode.setAttribute("aria-live", "polite");
    statusNode = make("p");
    statusNode.dataset.branchTutorStatus = "";
    statusNode.setAttribute("role", "status");
    statusNode.setAttribute("aria-live", "polite");
    var form = make("form");
    input = make("textarea");
    input.dataset.branchTutorInput = "";
    input.maxLength = MAX_MESSAGE_CHARS;
    input.rows = 2;
    input.setAttribute("aria-label", "Câu hỏi dành cho Sẻ");
    input.placeholder = "Hỏi về từ hoặc câu trong cảnh này…";
    send = make("button", "Hỏi ↗");
    send.dataset.branchTutorSend = "";
    send.type = "submit";
    form.addEventListener("submit", submit);
    form.append(input, send);
    panel.replaceChildren(heading, closeButton, messagesNode, statusNode, form);
    panel.dataset.branchTutorReady = "true";
    panel.addEventListener("cancel", function (event) { event.preventDefault(); close(); });
    panel.addEventListener("close", function () {
      if (opened) finishClose();
    });
    if (typeof env.ResizeObserver === "function") {
      resizeObserver = new env.ResizeObserver(function () { if (opened) renderCurrentChat(); });
      resizeObserver.observe(messagesNode);
    }
    if (typeof env.addEventListener === "function") env.addEventListener("resize", function () { if (opened) renderCurrentChat(); });
    if (env.visualViewport && typeof env.visualViewport.addEventListener === "function") env.visualViewport.addEventListener("resize", function () { if (opened) renderCurrentChat(); });
    return true;
  }
  function isDialogOpen() { return !!(panel && (panel.open || opened)); }
  function cancelPending() {
    if (!pending) return;
    var prior = pending;
    pending = null;
    clearTimeout(prior.timer);
    try { prior.controller.abort(); } catch (_) {}
    if (prior.node) removeChatItem(prior.node);
    if (send) send.disabled = false;
    if (input) input.disabled = false;
  }
  function finishClose() {
    generation += 1;
    cancelPending();
    var wasOpen = opened;
    opened = false;
    history = [];
    chatItems = [];
    activeScene = "";
    onHelp = null;
    if (messagesNode) messagesNode.replaceChildren();
    if (statusNode) setStatus("", "");
    if (input) input.value = "";
    var callback = onClose;
    onClose = null;
    if (wasOpen && typeof callback === "function") callback();
  }
  function close() {
    if (!opened) { cancelPending(); return; }
    if (panel && panel.open && typeof panel.close === "function") {
      panel.close();
      if (opened) finishClose();
    } else finishClose();
  }
  function sync(options) {
    options = options || {};
    var sceneId = typeof options.sceneId === "string" ? options.sceneId : "";
    currentScene = sceneId;
    available = options.available === true && PRACTICE_SCENES.has(sceneId);
    if (opened && (!available || sceneId !== activeScene)) close();
    return available;
  }
  function open(options) {
    options = options || {};
    var sceneId = typeof options.sceneId === "string" ? options.sceneId : "";
    if (!ensurePanel() || !available || sceneId !== currentScene || !PRACTICE_SCENES.has(sceneId)) return false;
    if (opened) close();
    generation += 1;
    opened = true;
    activeScene = sceneId;
    onHelp = typeof options.onHelp === "function" ? options.onHelp : null;
    onClose = typeof options.onClose === "function" ? options.onClose : null;
    history = [];
    messagesNode.replaceChildren();
    setStatus("", "");
    input.value = "";
    appendMessage("welcome", "Cậu đang băn khoăn chỗ nào? Tớ thử nghĩ cùng nhé.");
    if (typeof panel.showModal === "function") panel.showModal();
    else { panel.open = true; panel.hidden = false; }
    renderCurrentChat();
    try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }
    return true;
  }
  function current(token, sceneId, request) {
    return token === generation && opened && available && activeScene === sceneId && currentScene === sceneId && pending === request;
  }
  function publicError(response, data) {
    var code = data && data.error;
    if (response.status === 429 || code === "RATE_LIMITED") return "Sẻ xin nghỉ một chút. Mình thử lại sau nhé.";
    if (code === "AI_NOT_CONFIGURED") return "Sẻ chưa được nối với dịch vụ AI. Mình vẫn có thể tiếp tục câu chuyện.";
    if (response.status === 403 || code === "TUTOR_UNAVAILABLE") return "Sẻ chỉ giúp giải thích trong lúc luyện tập.";
    return "Sẻ chưa gọi được bạn bè ở đám mây. Mình thử lại sau nhé.";
  }
  async function submit(event) {
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    if (!opened || !available || activeScene !== currentScene || !send || send.disabled) return;
    var question = String(input.value || "").trim().slice(0, MAX_MESSAGE_CHARS);
    if (!question) { setStatus("Cậu viết câu hỏi trước nhé.", "retry"); return; }
    input.value = "";
    history.push({ role: "user", content: question });
    history = history.slice(-MAX_MESSAGES);
    appendMessage("user", question);
    if (typeof env.fetch !== "function" || typeof env.AbortController !== "function") {
      var unavailable = "Chưa kết nối được với Sẻ. Mình thử lại nhé.";
      setStatus(unavailable, "retry"); appendMessage("assistant", unavailable, "error");
      return;
    }
    setStatus("Sẻ đang nghĩ một chút…", "pending");
    var token = ++generation, sceneId = activeScene;
    var controller = new env.AbortController();
    var marker = appendMessage("assistant", "Sẻ đang nghĩ một chút…", "pending");
    var request = { controller: controller, node: marker, timer: null };
    pending = request;
    send.disabled = true;
    input.disabled = true;
    request.timer = setTimeout(function () { controller.abort(); }, MAX_WAIT_MS);
    try {
      var compact = !!(env.visualViewport && env.visualViewport.height <= 320);
      var response = await env.fetch("/api/ai/tutor", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneId: sceneId, messages: history, compact: compact }),
        signal: controller.signal
      });
      var data = null;
      try { data = await response.json(); } catch (_) {}
      if (!current(token, sceneId, request)) return;
      removeChatItem(marker);
      pending = null;
      clearTimeout(request.timer);
      if (!response.ok) {
        setStatus(publicError(response, data), "retry");
        appendMessage("assistant", publicError(response, data), "error");
        return;
      }
      var answer = data && typeof data.reply === "string" ? data.reply.trim().slice(0, MAX_REPLY_CHARS) : "";
      if (!answer) {
        var empty = "Sẻ chưa nghĩ ra câu trả lời. Mình thử hỏi cách khác nhé.";
        setStatus(empty, "retry"); appendMessage("assistant", empty, "error"); return;
      }
      history.push({ role: "assistant", content: answer });
      history = history.slice(-MAX_MESSAGES);
      appendPagedAssistant(answer);
      setStatus("", "");
      if (typeof onHelp === "function" && currentScene === sceneId && available && opened) onHelp({ sceneId: sceneId });
    } catch (_) {
      if (!current(token, sceneId, request)) return;
      removeChatItem(marker);
      pending = null;
      clearTimeout(request.timer);
      var failure = controller.signal.aborted ? "Sẻ mất quá nhiều thời gian để trả lời. Mình thử lại nhé." : "Chưa kết nối được với Sẻ. Mình thử lại nhé.";
      setStatus(failure, "retry"); appendMessage("assistant", failure, "error");
    } finally {
      if (token === generation && opened && activeScene === sceneId) {
        send.disabled = false; input.disabled = false;
      }
    }
  }
  return { open: open, close: close, sync: sync };
});
