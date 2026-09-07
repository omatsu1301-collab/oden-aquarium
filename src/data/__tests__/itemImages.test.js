import { describe, expect, it } from "vitest";
import { getAssistImageUrl, getBrothImageUrl } from "../itemImages.js";

describe("getBrothImageUrl", () => {
  it("昆布だしは専用画像のURLを返す", () => {
    const url = getBrothImageUrl("kombu");
    expect(url).toContain("broth-kombu.webp");
    expect(url).not.toContain("broth-neutral.webp");
  });

  it("専用画像が未登録の有効な出汁は無地陶器(broth-neutral.webp)を返す(誤った絵柄を流用しない)", () => {
    for (const brothId of ["katsuo", "miso", "soy", "salt", "yuzu"]) {
      expect(getBrothImageUrl(brothId)).toContain("broth-neutral.webp");
    }
  });

  it("本番パスがimport.meta.env.BASE_URLを含む", () => {
    expect(getBrothImageUrl("kombu")).toBe(`${import.meta.env.BASE_URL}assets/items/broth-kombu.webp`);
    expect(getBrothImageUrl("katsuo")).toBe(`${import.meta.env.BASE_URL}assets/items/broth-neutral.webp`);
  });
});

describe("getAssistImageUrl", () => {
  it("4種のおたすけすべてに対応する画像URLを返す(既存マッピングを壊していない)", () => {
    expect(getAssistImageUrl("drop")).toContain("assist-drop.webp");
    expect(getAssistImageUrl("rich-drop")).toContain("assist-rich-drop.webp");
    expect(getAssistImageUrl("care")).toContain("assist-care.webp");
    expect(getAssistImageUrl("long-care")).toContain("assist-long-care.webp");
  });

  it("未知のIDはnullを返す", () => {
    expect(getAssistImageUrl("mystery")).toBeNull();
  });
});
