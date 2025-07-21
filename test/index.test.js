import { describe, it, expect } from "vitest";
import { encodeURL, decodeURL } from "../src/index.js";

describe("URL Encoding/Decoding", () => {
  const originalData = {
    site: "www",
    key: 12345,
    bbsNo: 678,
    nttNo: 9012,
  };

  it("should correctly encode and then decode the URL parameters", () => {
    // 인코딩
    const encodeResult = encodeURL(originalData);
    expect(encodeResult.code).toBeTypeOf("string");
    expect(encodeResult.error).toBeUndefined();

    // 디코딩
    const decodeResult = decodeURL(encodeResult.code);
    expect(decodeResult.url).toBeTypeOf("string");
    expect(decodeResult.error).toBeUndefined();

    const url = new URL(decodeResult.url);

    // 검증
    expect(url.hostname).toBe("www.knue.ac.kr");
    expect(url.pathname).toBe(`/${originalData.site}/selectBbsNttView.do`);
    expect(url.searchParams.get("key")).toBe(originalData.key.toString());
    expect(url.searchParams.get("bbsNo")).toBe(originalData.bbsNo.toString());
    expect(url.searchParams.get("nttNo")).toBe(originalData.nttNo.toString());

    // Verify all original data is preserved
    const preservedData = {
      key: parseInt(url.searchParams.get("key"), 10),
      bbsNo: parseInt(url.searchParams.get("bbsNo"), 10),
      nttNo: parseInt(url.searchParams.get("nttNo"), 10),
    };
    expect(preservedData.key).toBe(originalData.key);
    expect(preservedData.bbsNo).toBe(originalData.bbsNo);
    expect(preservedData.nttNo).toBe(originalData.nttNo);
  });

  it("should return an error for invalid encoding data", () => {
    const invalidData = { ...originalData, site: "invalid-site" };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.code).toBeUndefined();
  });

  it("should return an error for invalid decoding code", () => {
    const result = decodeURL("invalid-code");
    expect(result.error).toBeDefined();
    expect(result.url).toBeUndefined();
  });
});
