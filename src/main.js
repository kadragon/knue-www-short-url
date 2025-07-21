import { encodeURL, decodeURL } from './index.js';

window.onload = function () {
    const search = window.location.search;
    const resultDiv = document.getElementById('result');

    // Decode mode: single parameter without '='. e.g., ?XyZ123
    if (search && !search.includes('=')) {
        const code = search.substring(1);
        const decodeResult = decodeURL(code);

        if (decodeResult.url) {
            window.location.href = decodeResult.url;
        } else {
            alert('잘못된 주소입니다.');
            window.location.href = 'https://www.knue.ac.kr/www/index.do';
        }
        return; // Stop further execution
    }

    // Encode mode or no query string, display JSON
    resultDiv.style.whiteSpace = 'pre-wrap';
    let result;

    if (!search) {
        result = { message: "KNUE 단축 URL 생성기" };
    } else {
        const searchParams = new URLSearchParams(search);
        const params = Object.fromEntries(searchParams.entries());
        result = encodeURL({
            site: params.site,
            key: parseInt(params.key, 10),
            bbsNo: parseInt(params.bbsNo, 10),
            nttNo: parseInt(params.nttNo, 10)
        });
    }

    resultDiv.innerText = JSON.stringify(result, null, 2);
};