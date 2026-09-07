// ゲーム状態の中心ストア。読み込み・書き込み・複数タブ同期・表示用の1秒ティックを担当する。
// reducer本体(advanceGame/applyAction)はReactに依存しない純粋関数のまま(src/game/)。
import { useCallback, useEffect, useRef, useState } from "react";
import { loadGameState, saveGameState } from "../storage/persistence.js";
import { validateGameState } from "../game/validate.js";
import { advanceGame } from "../game/engine.js";
import { applyAction } from "../game/actions.js";
import { withGameLock, isOtherTabActive, startLeaseHeartbeat } from "../storage/gameLock.js";
import { LOCAL_STORAGE_KEY, DEBUG_LOCAL_STORAGE_KEY } from "../game/constants.js";

export function resolveReducedMotion(state) {
  if (state && typeof state.settings.reducedMotion === "boolean") {
    return state.settings.reducedMotion;
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}

// debug=true の場合、本番保存キーとは別のstorageKeyを使う(仕様9: 本番データを汚染しない)。
export function useGameStore({ debug = false } = {}) {
  const storageKey = debug ? DEBUG_LOCAL_STORAGE_KEY : LOCAL_STORAGE_KEY;
  const [status, setStatus] = useState("loading"); // loading | ready | corrupt
  const [state, setState] = useState(null);
  const [corruptInfo, setCorruptInfo] = useState(null);
  const [otherTabActive, setOtherTabActive] = useState(false);
  const stateRef = useRef(null);

  useEffect(() => {
    // localStorage(外部システム)からの初回読み込みであり、意図的にマウント時1回だけ実行する。
    const result = loadGameState(Date.now(), storageKey);
    if (result.status === "corrupt") {
      // 外部システム(localStorage)の読み込み結果をReact状態へ反映する初期化処理であり、
      // カスケード再レンダーの意図しない副作用ではない。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCorruptInfo(result);
      setStatus("corrupt");
      return;
    }
    const settled = advanceGame(result.data, Date.now());
    stateRef.current = settled;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(settled);
    setStatus("ready");
  }, [storageKey]);

  useEffect(() => {
    function onStorage(event) {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        const validated = validateGameState(parsed);
        if (validated && (!stateRef.current || validated.revision > stateRef.current.revision)) {
          const settled = advanceGame(validated, Date.now());
          stateRef.current = settled;
          setState(settled);
          setStatus("ready");
        }
      } catch {
        // 他タブが不正な値を書いてもこのタブの状態は壊さない。
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  useEffect(() => {
    function flush() {
      if (stateRef.current) {
        saveGameState(advanceGame(stateRef.current, Date.now()), storageKey);
      }
    }
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") flush();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flush);
    };
  }, [storageKey]);

  useEffect(() => {
    const stopHeartbeat = startLeaseHeartbeat();
    const interval = window.setInterval(() => setOtherTabActive(isOtherTabActive()), 1000);
    return () => {
      stopHeartbeat();
      window.clearInterval(interval);
    };
  }, []);

  // 表示専用の1秒ティック(残量ゲージ・残り時間ラベルの再計算のためだけに再レンダーする)。
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setTick((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const dispatch = useCallback(
    (action) => {
      return withGameLock(() => {
        const nowMs = Date.now();
        const latest = loadGameState(nowMs, storageKey);
        if (latest.status === "corrupt") return null; // 起こり得ないが安全側に倒す
        const next = applyAction(latest.data, action, nowMs);
        saveGameState(next, storageKey);
        stateRef.current = next;
        setState(next);
        return next;
      });
    },
    [storageKey],
  );

  // 表示のたびに現在時刻まで精算した値を都度算出する設計のため、意図的にDate.now()を使用する
  // (永続化される`state`自体は変更しない。App.jsx v1のderive呼び出しと同じ設計判断)。
  // eslint-disable-next-line react-hooks/purity -- 表示専用の都度計算のため意図的
  const displayState = state ? advanceGame(state, Date.now()) : null;

  const recoverFromBackup = useCallback(
    (restoredState) => {
      saveGameState(restoredState, storageKey);
      stateRef.current = restoredState;
      setState(restoredState);
      setStatus("ready");
      setCorruptInfo(null);
    },
    [storageKey],
  );

  const startFresh = useCallback(
    (freshState) => {
      saveGameState(freshState, storageKey);
      stateRef.current = freshState;
      setState(freshState);
      setStatus("ready");
      setCorruptInfo(null);
    },
    [storageKey],
  );

  // debugパネル専用: fixtureで即座に状態を差し替える(通常dispatchのlock経路は使わない)。
  const setDebugState = useCallback(
    (nextState) => {
      saveGameState(nextState, storageKey);
      stateRef.current = nextState;
      setState(nextState);
    },
    [storageKey],
  );

  return {
    status,
    state: displayState,
    corruptInfo,
    otherTabActive,
    dispatch,
    recoverFromBackup,
    startFresh,
    setDebugState,
  };
}
