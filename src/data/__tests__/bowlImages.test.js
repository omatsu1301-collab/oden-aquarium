import { describe, expect, it } from "vitest";
import { getBowlImageUrl } from "../bowlImages.js";

describe("getBowlImageUrl", () => {
  it("4種の器IDすべてに対応する画像URLを返す", () => {
    expect(getBowlImageUrl("bowl-white")).toContain("bowl-white.webp");
    expect(getBowlImageUrl("bowl-indigo")).toContain("bowl-indigo.webp");
    expect(getBowlImageUrl("bowl-cat")).toContain("bowl-cat.webp");
    expect(getBowlImageUrl("bowl-black")).toContain("bowl-black.webp");
  });

  it("本番パスがimport.meta.env.BASE_URLを含む", () => {
    expect(getBowlImageUrl("bowl-white")).toBe(`${import.meta.env.BASE_URL}assets/bowls/bowl-white.webp`);
    expect(getBowlImageUrl("bowl-black")).toBe(`${import.meta.env.BASE_URL}assets/bowls/bowl-black.webp`);
  });

  it("未知のIDはbowl-white(fallback)を返し、新しい正式商品として扱わない", () => {
    expect(getBowlImageUrl("bowl-mystery")).toBe(getBowlImageUrl("bowl-white"));
    expect(getBowlImageUrl(undefined)).toBe(getBowlImageUrl("bowl-white"));
  });
});
