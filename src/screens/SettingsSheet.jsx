// 設定パネル(仕様6.8)。音/振動/動き低減、JSONバックアップ/復元、遊び方、クレジット。
import { useRef, useState } from "react";
import { Sheet } from "../ui/Sheet.jsx";
import { Toggle } from "../ui/Toggle.jsx";
import { Slider } from "../ui/Slider.jsx";
import { resolveReducedMotion } from "../store/useGameStore.js";
import { buildBackupPayload, buildBackupFileName, parseBackupFile } from "../storage/backup.js";
import { backupCurrentStateBeforeRestore, overwriteGameState } from "../storage/persistence.js";
import "../ui/primitives.css";
import "./SettingsSheet.css";

const HAS_VIBRATION = typeof navigator !== "undefined" && "vibrate" in navigator;

export function SettingsSheet({ open, onClose, state, dispatch, onRestore }) {
  const [detail, setDetail] = useState(null); // null | 'backup' | 'restore' | 'how-to-play' | 'credits'
  const [pendingRestore, setPendingRestore] = useState(null);
  const [restoreError, setRestoreError] = useState(null);
  const fileInputRef = useRef(null);

  if (!state) return null;

  function handleClose() {
    setDetail(null);
    setPendingRestore(null);
    setRestoreError(null);
    onClose();
  }

  function setSetting(patch) {
    dispatch({ type: "SET_SETTINGS", settings: patch });
  }

  function downloadBackup() {
    const payload = buildBackupPayload(state, Date.now());
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildBackupFileName(Date.now());
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleFilePicked(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setRestoreError("ファイルが大きすぎます(1MBまで)。");
      setPendingRestore(null);
      return;
    }
    const text = await file.text();
    const result = parseBackupFile(text, Date.now());
    if (!result.valid) {
      setRestoreError("このファイルは復元に使えませんでした。");
      setPendingRestore(null);
      return;
    }
    setRestoreError(null);
    setPendingRestore(result);
  }

  function confirmRestore() {
    if (!pendingRestore) return;
    const backedUp = backupCurrentStateBeforeRestore(state);
    if (!backedUp) {
      setRestoreError("この端末に保存できません。復元を中止しました。");
      return;
    }
    overwriteGameState(pendingRestore.state);
    onRestore(pendingRestore.state);
    setPendingRestore(null);
    setDetail(null);
  }

  const reducedMotion = resolveReducedMotion(state);

  return (
    <Sheet open={open} onClose={handleClose} title="設定" icon="⚙️">
      {!detail && (
        <div className="settings-sheet__list">
          <h3 className="settings-sheet__section">音と動き</h3>
          <Slider label="BGM" value={state.settings.bgmVolume} onChange={(v) => setSetting({ bgmVolume: v })} />
          <Slider label="効果音" value={state.settings.seVolume} onChange={(v) => setSetting({ seVolume: v })} />
          <Toggle
            label="振動"
            checked={state.settings.vibration}
            onChange={(v) => setSetting({ vibration: v })}
            disabled={!HAS_VIBRATION}
            disabledNote={!HAS_VIBRATION ? "この端末では利用できません" : undefined}
          />
          <Toggle
            label="動きを控えめに"
            checked={reducedMotion}
            onChange={(v) => setSetting({ reducedMotion: v })}
            disabledNote="浮遊や演出を穏やかにします"
          />

          <hr className="section-divider" />
          <h3 className="settings-sheet__section">記録</h3>
          <button type="button" className="settings-sheet__row" onClick={() => setDetail("backup")}>
            バックアップ <span aria-hidden="true">›</span>
          </button>
          <button type="button" className="settings-sheet__row" onClick={() => setDetail("restore")}>
            復元 <span aria-hidden="true">›</span>
          </button>

          <hr className="section-divider" />
          <h3 className="settings-sheet__section">ご案内</h3>
          <button type="button" className="settings-sheet__row" onClick={() => setDetail("how-to-play")}>
            遊び方 <span aria-hidden="true">›</span>
          </button>
          <button type="button" className="settings-sheet__row" onClick={() => setDetail("credits")}>
            クレジット <span aria-hidden="true">›</span>
          </button>
        </div>
      )}

      {detail && (
        <div className="settings-sheet__detail">
          <button type="button" className="btn btn--outline settings-sheet__back" onClick={() => setDetail(null)}>
            ← 設定へ戻る
          </button>

          {detail === "backup" && (
            <div>
              <h3>バックアップ</h3>
              <p>現在の記録をJSONファイルとしてこの端末にダウンロードします。</p>
              <button type="button" className="btn btn--primary btn--block" onClick={downloadBackup}>
                ダウンロードする
              </button>
            </div>
          )}

          {detail === "restore" && (
            <div>
              <h3>復元</h3>
              <p>バックアップファイルを選んで、記録を復元します。現在の記録は上書きされます。</p>
              <button type="button" className="btn btn--outline btn--block" onClick={() => fileInputRef.current?.click()}>
                ファイルを選ぶ
              </button>
              <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleFilePicked} />
              {restoreError && <p className="settings-sheet__error">{restoreError}</p>}
              {pendingRestore && (
                <div className="settings-sheet__restore-summary card">
                  <p>このファイルの内容:</p>
                  <ul>
                    <li>所持ポイント: {pendingRestore.summary.wallet}pt</li>
                    <li>発見した具材: {pendingRestore.summary.discoveredSpeciesCount}/5</li>
                    <li>すくった数: {pendingRestore.summary.harvestTotal}</li>
                  </ul>
                  <button type="button" className="btn btn--danger btn--block" onClick={confirmRestore}>
                    現在の記録を置き換える
                  </button>
                </div>
              )}
            </div>
          )}

          {detail === "how-to-play" && (
            <div className="settings-sheet__prose">
              <h3>遊び方</h3>
              <p>水槽の具材をタップすると、育ち具合や名前が少しだけ見えます。染み染みになったらタップですくいましょう。</p>
              <p>出汁がなくなっても具材は半分の速さで育ち続けます。焦らずお世話してください。</p>
              <p>すくうとポイントがもらえます。商店で出汁や鍋、道具、飾りと交換できます。</p>
              <p>記録はこの端末のブラウザに保存されます。別の端末やブラウザには引き継がれないため、設定のバックアップから記録を書き出しておくと安心です。</p>
            </div>
          )}

          {detail === "credits" && (
            <div className="settings-sheet__prose">
              <h3>クレジット</h3>
              <p>制作: おでんアクアリウム プロジェクト</p>
              <p>使用技術: React / Vite / Web Audio API</p>
              <p>素材方針: 具材イラストは本アプリのために制作。棚・器・夜景等の装飾はSVG/CSSで制作。</p>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
