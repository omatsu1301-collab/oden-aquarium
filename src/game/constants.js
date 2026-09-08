// v2ゲームの固定値。Reactに依存しない。
export const GAME_SCHEMA_VERSION = 2;

export const MS_PER_MINUTE = 60 * 1000;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;

// 補充待ち時間は一様分布[MIN, MAX]で抽選する(期待値60秒、コアループの手触り改善パス1)。
// 同時に複数体を収穫しても次の個体が同時刻に揃わないよう分散させるための範囲。
export const SPAWN_WAIT_MIN_MS = 25 * 1000;
export const SPAWN_WAIT_MAX_MS = 95 * 1000;
export const LAMP_PITY_STREAK = 4;
export const REMAINING_LOW_THRESHOLD = 0.25;

export const NEW_GAME_WALLET = 300;
export const NEW_GAME_BROTH_ID = "kombu";
export const NEW_GAME_POT_ID = "clay";

export const MAX_TAP_BUBBLES = 24;

export const LOCAL_STORAGE_KEY = "oden-aquarium/save";
export const LOCAL_STORAGE_V1_BACKUP_KEY = "oden-aquarium/save-v1-backup";
export const LOCAL_STORAGE_LEASE_KEY = "oden-aquarium/tab-lease";
// ?debug=1 のfixture操作専用の保存キー。本番保存(LOCAL_STORAGE_KEY)とは完全に分離する。
export const DEBUG_LOCAL_STORAGE_KEY = "oden-aquarium/debug-save";

export const BACKUP_APP_ID = "oden-aquarium";
export const BACKUP_FORMAT_VERSION = 2;
export const BACKUP_MAX_BYTES = 1024 * 1024;
