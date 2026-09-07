import { describe, expect, it } from "vitest";
import { getAssistImageUrl, getBrothImageUrl } from "../itemImages.js";

describe("getBrothImageUrl", () => {
  it("昆布だしは本番画像のURLを返す", () => {
    expect(getBrothImageUrl("kombu")).toContain("broth-kombu.webp");
  });

  it("画像が未制作の出汁はnullを返す(誤った絵柄を流用しない)", () => {
    for (const brothId of ["katsuo", "miso", "soy", "salt", "yuzu"]) {
      expect(getBrothImageUrl(brothId)).toBeNull();
    }
  });
});

describe("getAssistImageUrl", () => {
  it("4種のおたすけすべてに対応する画像URLを返す", () => {
    expect(getAssistImageUrl("drop")).toContain("assist-drop.webp");
    expect(getAssistImageUrl("rich-drop")).toContain("assist-rich-drop.webp");
    expect(getAssistImageUrl("care")).toContain("assist-care.webp");
    expect(getAssistImageUrl("long-care")).toContain("assist-long-care.webp");
  });

  it("未知のIDはnullを返す", () => {
    expect(getAssistImageUrl("mystery")).toBeNull();
  });
});
