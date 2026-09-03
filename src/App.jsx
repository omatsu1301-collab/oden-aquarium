import { useMemo, useState } from "react";
import "./App.css";
import { DaikonCharacter } from "./components/DaikonCharacter.jsx";
import { DashiGauge } from "./components/DashiGauge.jsx";
import { DebugPanel } from "./components/DebugPanel.jsx";
import { DAIKON_CHARACTER_ID } from "./constants.js";
import { advanceCharacterTime, deriveDashiLevel } from "./logic/derive.js";
import { loadSaveData, saveSaveData } from "./storage/persistence.js";

function isDebugMode() {
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

export function App() {
  // 初回マウント時にのみ読み込みを行う(以降はデバッグ操作でのみ更新する)。
  const [saveData, setSaveData] = useState(() => loadSaveData(Date.now()));
  const debugMode = useMemo(() => isDebugMode(), []);

  // 表示用のdashiLevelはuseStateに保持せず、レンダー時に都度算出する(仕様上の意図的な設計)。
  // eslint-disable-next-line react-hooks/purity -- deriveを都度呼ぶ設計のため意図的にDate.now()を使用
  const dashiLevel = deriveDashiLevel(saveData.characters[DAIKON_CHARACTER_ID], Date.now());

  function handleAdvanceHours(deltaMs) {
    const next = advanceCharacterTime(saveData, DAIKON_CHARACTER_ID, deltaMs, Date.now());
    setSaveData(next);
    saveSaveData(next);
  }

  return (
    <div className="app">
      <main className="app__tank">
        <DaikonCharacter />
        <DashiGauge dashiLevel={dashiLevel} />
      </main>
      {debugMode && <DebugPanel onAdvanceHours={handleAdvanceHours} />}
    </div>
  );
}

export default App;
