import { encodeURL, decodeURL } from "./index.js";
import QRCode from "qrcode";

window.onload = function () {
  const search = window.location.search;
  const resultDiv = document.getElementById("result");
  const qrCanvas = document.getElementById("qrCanvas");
  const copyInfoDiv = document.getElementById("copy-info");

  // 1. Decode Mode (e.g., ?XyZ123)
  if (search && !search.includes("=")) {
    const code = search.substring(1);
    const decodeResult = decodeURL(code);

    if (decodeResult.url) {
      window.location.href = decodeResult.url;
    } else {
      alert("잘못된 주소입니다.");
      window.location.href = "/"; // Redirect to home
    }
    return; // Stop execution
  }

  // 2. Encode Mode (e.g., ?site=www&...)
  if (search && search.includes("=")) {
    const searchParams = new URLSearchParams(search);
    const params = Object.fromEntries(searchParams.entries());

    const result = encodeURL({
      site: params.site,
      key: parseInt(params.key, 10),
      bbsNo: parseInt(params.bbsNo, 10),
      nttNo: parseInt(params.nttNo, 10),
    });

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
              alert("클립보드에 복사되었습니다.");
            },
            () => {
              alert("클립보드 복사에 실패했습니다.");
            }
          );
        } else {
          alert(
            "자동 복사 기능이 지원되지 않는 환경입니다. 수동으로 복사해주세요."
          );
        }
      });

      QRCode.toCanvas(qrCanvas, shortUrl, { width: 300 }, (error) => {
        if (error) console.error(error);
      });
    } else {
      resultDiv.innerText = `오류: ${result.error}`;
    }
    return; // Stop execution
  }

  // 3. Default Mode (No query string)
  resultDiv.innerText = "KNUE 단축 URL 생성기";
};
