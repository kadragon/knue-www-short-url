import { encodeURL, decodeURL } from "./urlEncoder.js";
import { ERROR_MESSAGES, VALIDATION } from "./constants.js";
import QRCode from "qrcode";

// Global error handling and monitoring
window.addEventListener('error', (event) => {
  console.error('Global error:', {
    message: event.error?.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

window.onload = function () {
  const search = window.location.search;
  const resultDiv = document.getElementById("result");
  const qrCanvas = document.getElementById("qrCanvas");
  const copyInfoDiv = document.getElementById("copy-info");

  // 1. Decode Mode (e.g., ?XyZ123)
  if (search && !search.includes("=")) {
    const code = search.substring(1).trim();
    
    // Basic input validation
    if (!code || code.length > VALIDATION.MAX_CODE_LENGTH) {
      alert(ERROR_MESSAGES.INVALID_CODE);
      window.location.href = "/";
      return;
    }
    
    const decodeResult = decodeURL(code);

    // Security: Validate URL exists and is from KNUE domain before redirect
    if (decodeResult.url && decodeResult.url.startsWith(VALIDATION.KNUE_DOMAIN)) {
      window.location.href = decodeResult.url;
    } else {
      alert(ERROR_MESSAGES.INVALID_CODE);
      window.location.href = "/";
    }
    return;
  }

  // 2. Encode Mode (e.g., ?site=www&...)
  if (search && search.includes("=")) {
    const searchParams = new URLSearchParams(search);
    const params = Object.fromEntries(searchParams.entries());

    // Input validation and sanitization
    const site = params.site?.trim();
    const key = parseInt(params.key, 10);
    const bbsNo = parseInt(params.bbsNo, 10);
    const nttNo = parseInt(params.nttNo, 10);

    // Validate required parameters
    if (!site || isNaN(key) || isNaN(bbsNo) || isNaN(nttNo)) {
      resultDiv.innerText = ERROR_MESSAGES.MISSING_PARAMETERS;
      return;
    }

    // Validate numeric ranges (prevent extremely large numbers)
    if ([key, bbsNo, nttNo].some(n => n < VALIDATION.MIN_NUMERIC_VALUE || n > VALIDATION.MAX_NUMERIC_VALUE)) {
      resultDiv.innerText = ERROR_MESSAGES.INVALID_PARAMETER_RANGE;
      return;
    }

    const result = encodeURL({ site, key, bbsNo, nttNo });

    if (result.code) {
      const shortUrl = `${window.location.origin}${window.location.pathname}?${result.code}`;
      const link = document.createElement("a");
      link.href = shortUrl;
      link.textContent = shortUrl.replace(/^https?:\/\//, ""); // Display without protocol
      resultDiv.appendChild(link);

      copyInfoDiv.textContent = "(주소를 클릭하면 클립보드에 복사됩니다.)";

      link.addEventListener("click", (event) => {
        event.preventDefault();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shortUrl).then(
            () => {
              alert(ERROR_MESSAGES.CLIPBOARD_COPIED);
            },
            () => {
              alert(ERROR_MESSAGES.CLIPBOARD_COPY_FAILED);
            }
          );
        } else {
          alert(ERROR_MESSAGES.CLIPBOARD_NOT_SUPPORTED);
        }
      });

      QRCode.toCanvas(qrCanvas, shortUrl, { width: 300 }, (error) => {
        if (error) {
          console.error(ERROR_MESSAGES.QR_CODE_ERROR, error);
          // Don't expose internal error details to user
        }
      });
    } else {
      resultDiv.innerText = `오류: ${result.error}`;
    }
    return; // Stop execution
  }

  // 3. Default Mode (No query string)
  resultDiv.innerText = "KNUE 단축 URL 생성기";
};
