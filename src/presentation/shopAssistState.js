// presentation層: 商店詳細・お世話のおたすけ「使う」可否を決める純粋関数。
// 商店分類(item.category === "assist")と効果分類(item.effectCategory)を混同しない。
// 不明なeffectCategoryはcareへfallbackせず、fail-safeにdisabledとする。

export function getActiveAssistEffect(state, effectCategory) {
  if (effectCategory === "growth") return state.effects.growth;
  if (effectCategory === "care") return state.effects.care;
  return null;
}

export function getShopAssistUseState(item, state, owned) {
  const effectCategory = item?.effectCategory;
  if (effectCategory !== "growth" && effectCategory !== "care") {
    return {
      isThisActive: false,
      categoryBusy: false,
      careBlocked: false,
      disabled: true,
    };
  }

  const activeEffect = getActiveAssistEffect(state, effectCategory);
  const isThisActive = activeEffect?.itemId === item.id;
  const categoryBusy = Boolean(activeEffect) && !isThisActive;
  const careBlocked = effectCategory === "care" && state.tank.remainingRatio <= 0;
  const disabled = owned <= 0 || categoryBusy || careBlocked;
  return { isThisActive, categoryBusy, careBlocked, disabled };
}
