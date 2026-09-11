// おたすけ「使う」不可時の短い理由文。CareSheetと同じ優先順位。
export function formatAssistDisabledReason({ owned, categoryBusy, careBlocked, disabled }) {
  if (!disabled) return null;
  if (owned <= 0) return "未所持";
  if (categoryBusy) return "同系統を使用中";
  if (careBlocked) return "出汁を足してから使えます";
  return null;
}
