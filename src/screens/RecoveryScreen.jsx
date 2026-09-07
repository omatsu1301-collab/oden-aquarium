// 保存データが壊れている/未知の形式だった場合の復旧画面(仕様7.2)。
// 自動初期化はせず、バックアップからの復元か、明示的な確認を経た新規開始だけを提供する。
import { useState } from "react";
import { parseBackupFile } from "../storage/backup.js";
import { overwriteGameState } from "../storage/persistence.js";
import { createInitialGameState } from "../game/state.js";
import { createFreshSeed } from "../game/rng.js";
import "../ui/primitives.css";
import "./RecoveryScreen.css";

const REASON_LABEL = {
  "invalid-json": "保存データがJSONとして読み取れませんでした。",
  "invalid-v2-shape": "保存データの形式を確認できませんでした。",
  "unknown-version": "未知のバージョンの保存データです。",
  "v1-backup-failed": "旧データの退避に失敗したため、移行を中断しました。",
};

export function RecoveryScreen({ corruptInfo, onRecovered, onStartFresh }) {
  const [fileError, setFileError] = useState(null);
  const [confirmingFresh, setConfirmingFresh] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = parseBackupFile(text, Date.now());
    if (!result.valid) {
      setFileError("このファイルは復元に使えませんでした。別のバックアップファイルをお試しください。");
      return;
    }
    overwriteGameState(result.state);
    onRecovered(result.state);
  }

  function startFresh() {
    const fresh = createInitialGameState(Date.now(), createFreshSeed());
    onStartFresh(fresh);
  }

  return (
    <div className="recovery-screen">
      <div className="recovery-screen__card card">
        <h1>データを確認できませんでした</h1>
        <p>{REASON_LABEL[corruptInfo?.reason] ?? "保存データを確認できませんでした。"}</p>
        <p className="recovery-screen__note">
          元のデータはこの端末に残したままです。バックアップファイルがあれば復元できます。
        </p>

        <label className="btn btn--primary btn--block recovery-screen__file-btn">
          バックアップから復元する
          <input type="file" accept="application/json,.json" onChange={handleFile} hidden />
        </label>
        {fileError && <p className="recovery-screen__error">{fileError}</p>}

        <hr className="section-divider" />

        {!confirmingFresh ? (
          <button type="button" className="btn btn--outline btn--block" onClick={() => setConfirmingFresh(true)}>
            新しく始める
          </button>
        ) : (
          <div className="recovery-screen__confirm">
            <p>本当によろしいですか?元のデータには戻せません。</p>
            <div className="recovery-screen__confirm-actions">
              <button type="button" className="btn btn--outline" onClick={() => setConfirmingFresh(false)}>
                やめる
              </button>
              <button type="button" className="btn btn--danger" onClick={startFresh}>
                新しく始める
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
