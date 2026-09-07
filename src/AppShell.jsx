// アプリの外殻: 主画面(水槽/図鑑/商店)のhashルーティングと、Sheet(お世話/お願い・おたより/設定/
// 具材詳細/商品詳細)のbrowser back連携を担当する。ロジック自体はuseGameStoreへ委譲する。
import { useEffect, useRef, useState } from "react";
import { useGameStore, resolveReducedMotion } from "./store/useGameStore.js";
import { BottomNav } from "./ui/BottomNav.jsx";
import { TankScreen } from "./screens/TankScreen.jsx";
import { CatalogScreen } from "./screens/CatalogScreen.jsx";
import { ShopScreen } from "./screens/ShopScreen.jsx";
import { CareSheet } from "./screens/CareSheet.jsx";
import { LettersSheet } from "./screens/LettersSheet.jsx";
import { SettingsSheet } from "./screens/SettingsSheet.jsx";
import { SpeciesDetailSheet } from "./screens/SpeciesDetailSheet.jsx";
import { ShopItemDetailSheet } from "./screens/ShopItemDetailSheet.jsx";
import { RecoveryScreen } from "./screens/RecoveryScreen.jsx";
import { DebugPanel } from "./components/DebugPanel.jsx";
import { initAudioOnFirstInteraction, applyAudioSettings } from "./audio/audioEngine.js";
import "./styles/tokens.css";
import "./AppShell.css";

const TABS = ["tank", "catalog", "shop"];

function readTabFromHash() {
  const hash = window.location.hash.replace("#", "");
  return TABS.includes(hash) ? hash : "tank";
}

function isDebugMode() {
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

export function AppShell() {
  const debugMode = isDebugMode();
  const store = useGameStore({ debug: debugMode });
  const [tab, setTab] = useState(readTabFromHash);
  const [panel, setPanel] = useState(null); // { kind, payload } | null
  const contentRef = useRef(null);

  useEffect(() => {
    window.history.replaceState({ odenPanel: false }, "", `#${tab}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onPopState() {
      setPanel((current) => (current ? null : current));
      setTab(readTabFromHash());
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    initAudioOnFirstInteraction();
  }, []);

  useEffect(() => {
    if (store.state) {
      applyAudioSettings(store.state.settings);
      document.documentElement.dataset.motion = resolveReducedMotion(store.state)
        ? "reduced"
        : "full";
    }
  }, [store.state?.settings]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = panel ? "hidden" : "";
    if (contentRef.current) {
      if (panel) contentRef.current.setAttribute("inert", "");
      else contentRef.current.removeAttribute("inert");
    }
  }, [panel]);

  function changeTab(nextTab) {
    setTab(nextTab);
    window.history.replaceState({ odenPanel: false }, "", `#${nextTab}`);
  }

  function openPanel(kind, payload) {
    window.history.pushState({ odenPanel: true }, "");
    setPanel({ kind, payload });
  }

  function closePanel() {
    window.history.back();
  }

  if (store.status === "corrupt") {
    return (
      <RecoveryScreen
        corruptInfo={store.corruptInfo}
        onRecovered={store.recoverFromBackup}
        onStartFresh={store.startFresh}
      />
    );
  }

  if (store.status === "loading" || !store.state) {
    return <div className="app-shell__loading" aria-hidden="true" />;
  }

  const state = store.state;

  return (
    <div className="app-shell">
      <div className="app-shell__content" ref={contentRef}>
        {store.otherTabActive && (
          <div className="app-shell__other-tab-banner" role="status">
            他のタブで操作中です。しばらくすると反映されます。
          </div>
        )}
        {tab === "tank" && (
          <TankScreen
            state={state}
            dispatch={store.dispatch}
            onOpenCare={() => openPanel("care")}
            onOpenLetters={() => openPanel("letters")}
            onOpenSettings={() => openPanel("settings")}
          />
        )}
        {tab === "catalog" && (
          <CatalogScreen
            state={state}
            onOpenSpeciesDetail={(speciesId) => openPanel("species", speciesId)}
          />
        )}
        {tab === "shop" && (
          <ShopScreen state={state} onOpenItemDetail={(itemId) => openPanel("shopItem", itemId)} />
        )}
        <BottomNav current={tab} onChange={changeTab} />
      </div>

      <CareSheet
        open={panel?.kind === "care"}
        onClose={closePanel}
        state={state}
        dispatch={store.dispatch}
        onOpenShop={() => {
          closePanel();
          window.setTimeout(() => changeTab("shop"), 0);
        }}
      />
      <LettersSheet
        open={panel?.kind === "letters"}
        onClose={closePanel}
        state={state}
        dispatch={store.dispatch}
        onGoToShop={() => {
          closePanel();
          window.setTimeout(() => changeTab("shop"), 0);
        }}
      />
      <SettingsSheet
        open={panel?.kind === "settings"}
        onClose={closePanel}
        state={state}
        dispatch={store.dispatch}
        onRestore={store.recoverFromBackup}
      />
      <SpeciesDetailSheet
        open={panel?.kind === "species"}
        onClose={closePanel}
        speciesId={panel?.payload}
        state={state}
        dispatch={store.dispatch}
        onGoToShop={() => {
          closePanel();
          window.setTimeout(() => changeTab("shop"), 0);
        }}
      />
      <ShopItemDetailSheet
        open={panel?.kind === "shopItem"}
        onClose={closePanel}
        itemId={panel?.payload}
        state={state}
        dispatch={store.dispatch}
      />

      {debugMode && <DebugPanel state={state} setDebugState={store.setDebugState} />}
    </div>
  );
}
