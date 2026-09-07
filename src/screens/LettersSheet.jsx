// お願い/おたよりパネル(仕様6.7)。2タブ、入れ子の本文表示は内部state(history非連動)で行う。
import { useState } from "react";
import { Sheet } from "../ui/Sheet.jsx";
import { listQuestViews } from "../game/quests.js";
import { listLetterViews } from "../game/letters.js";
import { getAssist } from "../data/assists.js";
import "../ui/primitives.css";
import "./LettersSheet.css";

const QUEST_ICON = {
  "first-harvest": "🥄",
  catalog: "📖",
  broth: "🍶",
  familiar: "👋",
  bowl: "🍜",
  dyes: "🎨",
};

function rewardLabel(reward) {
  if (reward.type === "points") return `${reward.amount} pt`;
  const item = getAssist(reward.itemId);
  return `${item.name}×${reward.quantity}`;
}

export function LettersSheet({ open, onClose, state, dispatch, onGoToShop }) {
  const [tab, setTab] = useState("quests");
  const [openLetterId, setOpenLetterId] = useState(null);

  if (!state) return null;

  function handleClose() {
    setOpenLetterId(null);
    setTab("quests");
    onClose();
  }

  const quests = listQuestViews(state);
  const active = quests.filter((q) => !q.claimed);
  const claimed = quests.filter((q) => q.claimed);
  const letters = listLetterViews(state);
  const openLetter = letters.find((l) => l.id === openLetterId);

  function openLetterBody(id) {
    setOpenLetterId(id);
    dispatch({ type: "MARK_LETTER_READ", letterId: id });
  }

  return (
    <Sheet open={open} onClose={handleClose} title="おたより" icon="✉️">
      <div className="letters-sheet__tabs">
        <button
          type="button"
          className={`letters-sheet__tab${tab === "quests" ? " is-active" : ""}`}
          onClick={() => setTab("quests")}
        >
          お願い
        </button>
        <button
          type="button"
          className={`letters-sheet__tab${tab === "letters" ? " is-active" : ""}`}
          onClick={() => setTab("letters")}
        >
          おたより
        </button>
      </div>

      {tab === "quests" && (
        <div className="letters-sheet__panel">
          <p className="letters-sheet__lead">できそうなことから、ゆっくりと。</p>
          {active.map((quest) => (
            <div key={quest.id} className={`card letters-sheet__quest${quest.complete ? " is-complete" : ""}`}>
              <span className="letters-sheet__quest-icon" aria-hidden="true">{QUEST_ICON[quest.id]}</span>
              <div className="letters-sheet__quest-info">
                <p className="letters-sheet__quest-title">{quest.title}</p>
                <p className="letters-sheet__quest-desc">{quest.description}</p>
                <div className="letters-sheet__quest-progress">
                  {quest.complete ? (
                    <span className="letters-sheet__quest-done">✓ 達成 {quest.progress}/{quest.target}</span>
                  ) : (
                    <span>{quest.progress}/{quest.target}</span>
                  )}
                </div>
              </div>
              <div className="letters-sheet__quest-reward">
                <span className="letters-sheet__reward-chip">ごほうび {rewardLabel(quest.reward)}</span>
                {quest.complete ? (
                  <button type="button" className="btn btn--primary" onClick={() => dispatch({ type: "CLAIM_QUEST", questId: quest.id })}>
                    受け取る
                  </button>
                ) : quest.id === "broth" ? (
                  <button type="button" className="btn btn--outline" onClick={onGoToShop}>
                    商店へ
                  </button>
                ) : null}
              </div>
            </div>
          ))}

          {claimed.length > 0 && (
            <details className="letters-sheet__claimed">
              <summary>受取済み({claimed.length})</summary>
              {claimed.map((quest) => (
                <div key={quest.id} className="letters-sheet__claimed-item">
                  <span aria-hidden="true">{QUEST_ICON[quest.id]}</span> {quest.title}
                </div>
              ))}
            </details>
          )}
        </div>
      )}

      {tab === "letters" && !openLetter && (
        <ul className="letters-sheet__letter-list">
          {letters.map((letter) => (
            <li key={letter.id}>
              <button type="button" className="card letters-sheet__letter-row" onClick={() => openLetterBody(letter.id)}>
                {!letter.isRead && <span className="letters-sheet__unread-dot" aria-hidden="true" />}
                <span className="letters-sheet__letter-title">{letter.title}</span>
                <span aria-hidden="true">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {tab === "letters" && openLetter && (
        <div className="letters-sheet__letter-body">
          <button type="button" className="btn btn--outline letters-sheet__back" onClick={() => setOpenLetterId(null)}>
            ← 一覧へ戻る
          </button>
          <h3>{openLetter.title}</h3>
          <p className="letters-sheet__letter-text">{openLetter.body}</p>
        </div>
      )}
    </Sheet>
  );
}
