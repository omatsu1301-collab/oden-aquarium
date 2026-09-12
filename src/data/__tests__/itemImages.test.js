import { describe, expect, it } from "vitest";
import { getAssistImageUrl, getBrothImageUrl } from "../itemImages.js";

describe("getBrothImageUrl", () => {
  it("出汁6種すべて専用画像のURLを返す", () => {
    const expected = {
      kombu: "broth-kombu.webp",
      katsuo: "broth-katsuo.webp",
      miso: "broth-miso.webp",
      soy: "broth-soy.webp",
      salt: "broth-salt.webp",
      yuzu: "broth-yuzu.webp",
    };
    for (const [id, file] of Object.entries(expected)) {
      const url = getBrothImageUrl(id);
      expect(url).toContain(file);
      expect(url).not.toContain("broth-neutral.webp");
      expect(url).toContain(import.meta.env.BASE_URL);
    }
  });

  it("未知の出汁IDのみ無地陶器へfallbackする", () => {
    expect(getBrothImageUrl("mystery")).toContain("broth-neutral.webp");
  });

  it("本番パスがimport.meta.env.BASE_URLを含む", () => {
    expect(getBrothImageUrl("kombu")).toBe(
      `${import.meta.env.BASE_URL}assets/items/broth-kombu.webp`,
    );
    expect(getBrothImageUrl("katsuo")).toBe(
      `${import.meta.env.BASE_URL}assets/items/broth-katsuo.webp`,
    );
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
