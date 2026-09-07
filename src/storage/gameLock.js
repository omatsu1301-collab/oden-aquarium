// 複数タブでの書き込み競合を防ぐための排他制御。
// Web Locksが使えればそれを使い、使えない環境では単一アクティブタブ方式のleaseにフォールバックする。
// localStorageのread-modify-writeだけを原子的とは扱わない(仕様7.3)。
const LOCK_NAME = "oden-aquarium-game-lock";
const LEASE_KEY = "oden-aquarium/tab-lease";
const LEASE_TTL_MS = 5000;
const LEASE_RENEW_MS = 2000;

function hasWebLocks() {
  return typeof navigator !== "undefined" && navigator.locks && typeof navigator.locks.request === "function";
}

// 排他区間内でfnを実行する(fn: () => 結果 または Promise<結果>)。
export async function withGameLock(fn) {
  if (hasWebLocks()) {
    return navigator.locks.request(LOCK_NAME, { mode: "exclusive" }, () => fn());
  }
  return withLeaseFallback(fn);
}

let tabId = null;
function getTabId() {
  if (tabId === null) {
    tabId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return tabId;
}

function readLease() {
  try {
    const raw = window.localStorage.getItem(LEASE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLease() {
  try {
    window.localStorage.setItem(
      LEASE_KEY,
      JSON.stringify({ tabId: getTabId(), expiresAt: Date.now() + LEASE_TTL_MS }),
    );
    return true;
  } catch {
    return false;
  }
}

function isLeaseHeldByOther() {
  const lease = readLease();
  if (!lease) return false;
  if (lease.tabId === getTabId()) return false;
  return lease.expiresAt > Date.now();
}

// Web Locks非対応環境向け: 他タブのleaseが有効な間は待機してから実行する。
async function withLeaseFallback(fn) {
  const maxWaitMs = 1500;
  const start = Date.now();
  while (isLeaseHeldByOther() && Date.now() - start < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  writeLease();
  try {
    return await fn();
  } finally {
    // 短命の排他区間なので明示的な解放は行わず、TTL切れに委ねる(次のrequest時に再取得)。
  }
}

// このタブが「閲覧のみ」(他タブがアクティブ)かどうか。Web Locks対応環境では常にfalse。
export function isOtherTabActive() {
  if (hasWebLocks()) return false;
  return isLeaseHeldByOther();
}

let renewTimer = null;
export function startLeaseHeartbeat() {
  if (hasWebLocks()) return () => {};
  writeLease();
  renewTimer = window.setInterval(() => {
    if (document.visibilityState === "visible" && !isLeaseHeldByOther()) {
      writeLease();
    }
  }, LEASE_RENEW_MS);
  return () => {
    if (renewTimer) window.clearInterval(renewTimer);
  };
}
