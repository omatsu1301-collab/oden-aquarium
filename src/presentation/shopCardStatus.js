// presentation層: 商店カードの表示状態だけを決める純粋関数。
// 購入・装備・使用・消費の game action は呼ばない。PR #13 の effectCategory 契約を使う。
import { getShopAssistUseState } from "./shopAssistState.js";

function isShopItemActive(item, state) {
  if (item.category === "broth") return state.tank.brothId === item.id;
  if (item.category === "pot") return state.tank.potId === item.id;
  if (item.category === "tool") {
    return (
      (item.slotType === "lid" && state.tank.tools.lid === item.id) ||
      (item.slotType === "paddle" && state.tank.tools.paddle) ||
      (item.slotType === "lamp" && state.tank.tools.lamp)
    );
  }
  if (item.category === "decoration" && item.slotType === "tank") {
    return state.tank.decorationId === item.id;
  }
  if (item.category === "assist") {
    const owned = state.inventory.consumables[item.id] ?? 0;
    return getShopAssistUseState(item, state, owned).isThisActive;
  }
  return false;
}

function getOwnedCount(item, state) {
  if (item.kind === "consumable") return state.inventory.consumables[item.id] ?? 0;
  return state.inventory.ownedIds.includes(item.id) ? 1 : 0;
}

// 商店カード用の4状態。色だけでなく文言と kind で区別する。
export function getShopCardDisplayStatus(item, state) {
  if (isShopItemActive(item, state)) {
    return { kind: "active", label: "使用中", price: item.price };
  }

  const ownedCount = getOwnedCount(item, state);
  if (ownedCount > 0) {
    return {
      kind: "owned",
      label: item.kind === "consumable" ? `所持×${ownedCount}` : "所持",
      price: item.price,
    };
  }

  if (state.wallet >= item.price) {
    return { kind: "purchasable", label: "購入可能", price: item.price };
  }

  return { kind: "shortfall", label: "残高不足", price: item.price };
}
