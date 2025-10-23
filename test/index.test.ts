import { describe, it, expect } from "vitest";
import { encodeURL, decodeURL } from "../src/urlEncoder";

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
    const decodeResult = decodeURL(encodeResult.code!);
    expect(decodeResult.url).toBeTypeOf("string");
    expect(decodeResult.error).toBeUndefined();

    const url = new URL(decodeResult.url!);

    // 검증
    expect(url.hostname).toBe("www.knue.ac.kr");
    expect(url.pathname).toBe(`/${originalData.site}/selectBbsNttView.do`);
    expect(url.searchParams.get("key")).toBe(originalData.key.toString());
    expect(url.searchParams.get("bbsNo")).toBe(originalData.bbsNo.toString());
    expect(url.searchParams.get("nttNo")).toBe(originalData.nttNo.toString());

    // Verify all original data is preserved
    const preservedData = {
      key: parseInt(url.searchParams.get("key") || "", 10),
      bbsNo: parseInt(url.searchParams.get("bbsNo") || "", 10),
      nttNo: parseInt(url.searchParams.get("nttNo") || "", 10),
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

  it("should return an error when encoding with non-numeric values", () => {
    const invalidData = { ...originalData, key: "not-a-number" };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("반드시 숫자여야");
    expect(result.code).toBeUndefined();
  });

  it("should return an error when encoding with NaN bbsNo", () => {
    const invalidData = { ...originalData, bbsNo: NaN };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("반드시 숫자여야");
    expect(result.code).toBeUndefined();
  });

  it("should return an error when encoding with NaN nttNo", () => {
    const invalidData = { ...originalData, nttNo: NaN };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("반드시 숫자여야");
    expect(result.code).toBeUndefined();
  });

  it("should return an error when encoding with null key", () => {
    const invalidData = { ...originalData, key: null };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("반드시 숫자여야");
    expect(result.code).toBeUndefined();
  });

  it("should return an error when encoding with undefined bbsNo", () => {
    const invalidData = { ...originalData, bbsNo: undefined };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("반드시 숫자여야");
    expect(result.code).toBeUndefined();
  });

  it("should return an error when encoding with Infinity", () => {
    const invalidData = { ...originalData, nttNo: Infinity };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("반드시 숫자여야");
    expect(result.code).toBeUndefined();
  });

  it("should return an error when encoding with negative Infinity", () => {
    const invalidData = { ...originalData, key: -Infinity };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("반드시 숫자여야");
    expect(result.code).toBeUndefined();
  });

  it("should return an error when encoding with string number", () => {
    const invalidData = { ...originalData, key: "123" };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("반드시 숫자여야");
    expect(result.code).toBeUndefined();
  });
});
