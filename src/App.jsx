import { useMemo, useState } from "react";
import "./App.css";
import { AquariumScene } from "./components/AquariumScene.jsx";
import { DashiGauge } from "./components/DashiGauge.jsx";
import { DebugPanel } from "./components/DebugPanel.jsx";
import { DAIKON_CHARACTER_ID } from "./constants.js";
import { advanceCharacterTime, deriveDashiLevel } from "./logic/derive.js";
import { deriveSoakProgress } from "./presentation/soakVisual.js";
import { loadSaveData, saveSaveData } from "./storage/persistence.js";

function isDebugMode() {
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

export function App() {
  // 初回マウント時にのみ読み込みを行う(以降はデバッグ操作でのみ更新する)。
  const [saveData, setSaveData] = useState(() => loadSaveData(Date.now()));
  const debugMode = useMemo(() => isDebugMode(), []);

  // デバッグ用のsoakProgress強制表示値。表示にのみ作用し、
  // saveData(anchorValue/anchorTimeMs)には一切書き込まない一時的な値。
  const [soakOverride, setSoakOverride] = useState(null);

  // 表示用のdashiLevelはuseStateに保持せず、レンダー時に都度算出する(仕様上の意図的な設計)。
  // eslint-disable-next-line react-hooks/purity -- deriveを都度呼ぶ設計のため意図的にDate.now()を使用
  const dashiLevel = deriveDashiLevel(saveData.characters[DAIKON_CHARACTER_ID], Date.now());
  const soakProgress = soakOverride ?? deriveSoakProgress(dashiLevel);

  function handleAdvanceHours(deltaMs) {
    setSoakOverride(null);
    const next = advanceCharacterTime(saveData, DAIKON_CHARACTER_ID, deltaMs, Date.now());
    setSaveData(next);
    saveSaveData(next);
  }

  return (
    <div className="app">
      <main className="app__tank">
        <AquariumScene soakProgress={soakProgress} />
        {debugMode && (
          <div className="app__hud">
            <DashiGauge dashiLevel={soakProgress} />
          </div>
        )}
      </main>
      {debugMode && (
        <DebugPanel
          onAdvanceHours={handleAdvanceHours}
          soakOverride={soakOverride}
          onSetSoakOverride={setSoakOverride}
        />
      )}
    </div>
  );
}

export default App;
