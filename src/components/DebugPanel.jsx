// ?debug=1専用のデバッグパネル。本番保存とは別キー(useGameStore({debug:true}))で動作し、
// 通常URLには出さない(仕様9)。時間送り・fixtureで検証を高速化する。
import { advanceGame } from "../game/engine.js";
import { SPECIES_ORDER } from "../data/species.js";
import "./DebugPanel.css";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

export function DebugPanel({ state, setDebugState }) {
  function advanceBy(ms) {
    setDebugState(advanceGame(state, state.lastSimulatedAt + ms));
  }

  function addWallet(amount) {
    setDebugState({ ...state, wallet: state.wallet + amount });
  }

  function emptyBroth() {
    setDebugState({ ...state, tank: { ...state.tank, remainingRatio: 0 } });
  }

  function discoverAll() {
    const nowMs = Date.now();
    const catalog = { ...state.catalog };
    for (const speciesId of SPECIES_ORDER) {
      catalog[speciesId] = catalog[speciesId] ?? {
        firstSeenAt: nowMs,
        harvestCount: 1,
        favorite: false,
        bowlId: "bowl-white",
        brothCounts: { [state.tank.brothId]: 1 },
      };
    }
    setDebugState({ ...state, catalog, stats: { ...state.stats, harvestTotal: Math.max(state.stats.harvestTotal, 5) } });
  }

  function matureAll() {
    setDebugState({ ...state, slots: state.slots.map((s) => (s.status === "growing" ? { ...s, progress: 100 } : s)) });
  }

  return (
    <div className="debug-panel" data-testid="debug-panel">
      <p className="debug-panel__title">DEBUG(専用保存・本番データ非汚染)</p>
      <div className="debug-panel__row">
        <button type="button" onClick={() => advanceBy(10 * MS_PER_MINUTE)}>+10分</button>
        <button type="button" onClick={() => advanceBy(1 * MS_PER_HOUR)}>+1時間</button>
        <button type="button" onClick={() => advanceBy(8 * MS_PER_HOUR)}>+8時間</button>
        <button type="button" onClick={() => advanceBy(24 * MS_PER_HOUR)}>+24時間</button>
      </div>
      <div className="debug-panel__row">
        <button type="button" onClick={() => addWallet(1000)}>+1000pt</button>
        <button type="button" onClick={emptyBroth}>出汁を空に</button>
        <button type="button" onClick={discoverAll}>全種類発見済みに</button>
        <button type="button" onClick={matureAll}>全スロット成熟</button>
      </div>
      <pre className="debug-panel__state">
        {JSON.stringify(
          {
            wallet: state.wallet,
            remainingRatio: Number(state.tank.remainingRatio.toFixed(3)),
            brothId: state.tank.brothId,
            potId: state.tank.potId,
            slots: state.slots.map((s) =>
              s.status === "growing"
                ? { speciesId: s.speciesId, progress: Math.round(s.progress) }
                : { status: "empty-waiting" },
            ),
          },
          null,
          0,
        )}
      </pre>
    </div>
  );
}
