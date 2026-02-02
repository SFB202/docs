(() => {
  const NGROK_ORIGIN = "https://madelaine-peritrichate-skye.ngrok-free.dev";
  const HEADER_NAME = "ngrok-skip-browser-warning";
  const HEADER_VALUE = "true";

  function patchWindow(win) {
    if (!win || win.__ngrokPatched) return;
    win.__ngrokPatched = true;

    // 1) fetch 패치: 헤더 + 쿠키 포함
    const originalFetch = win.fetch?.bind(win);
    if (originalFetch) {
      win.fetch = (input, init = {}) => {
        try {
          const url = typeof input === "string" ? input : input?.url;
          if (url && String(url).startsWith(NGROK_ORIGIN)) {
            const headers = new win.Headers(init.headers || (typeof input !== "string" ? input.headers : undefined));
            headers.set(HEADER_NAME, HEADER_VALUE);
            init = { ...init, headers, credentials: "include" };
          }
        } catch (_) {}
        return originalFetch(input, init);
      };
    }

    // 2) XHR 패치: 헤더 + 쿠키 포함
    const XHR = win.XMLHttpRequest;
    if (XHR?.prototype) {
      const originalOpen = XHR.prototype.open;
      const originalSend = XHR.prototype.send;

      XHR.prototype.open = function (method, url) {
        this.__ngrokUrl = url;
        return originalOpen.apply(this, arguments);
      };

      XHR.prototype.send = function (body) {
        try {
          if (this.__ngrokUrl && String(this.__ngrokUrl).startsWith(NGROK_ORIGIN)) {
            this.withCredentials = true;
            this.setRequestHeader(HEADER_NAME, HEADER_VALUE);
          }
        } catch (_) {}
        return originalSend.apply(this, arguments);
      };
    }
  }

  function hookSwaggerIframes() {
    document.querySelectorAll("iframe").forEach((iframe) => {
      const src = iframe.getAttribute("src") || "";
      // mkdocs-swagger-ui-tag가 생성한 iframe은 /assets/swagger-ui/ 아래를 보게 됨
      if (!src.includes("/assets/swagger-ui/")) return;

      iframe.addEventListener("load", () => {
        try {
          patchWindow(iframe.contentWindow);
        } catch (_) {}
      });

      // 이미 로드된 경우 대비
      try {
        if (iframe.contentWindow && iframe.contentDocument?.readyState === "complete") {
          patchWindow(iframe.contentWindow);
        }
      } catch (_) {}
    });
  }

  window.addEventListener("DOMContentLoaded", hookSwaggerIframes);
})();
