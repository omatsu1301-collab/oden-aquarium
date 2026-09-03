// セーブデータのスキーマバージョン。形式が変わったら上げる(マイグレーションは今回スコープ外)。
export const SCHEMA_VERSION = 1;

// dashiLevelの取りうる範囲。
export const DASHI_LEVEL_MIN = 0;
export const DASHI_LEVEL_MAX = 100;

// 出汁の染み込み速度(1時間あたりにdashiLevelが増加する量)。
// 「6時間で染み込み具合をひと目で確認できる」体験を狙った仮の値。
export const DASHI_SOAK_RATE_PER_HOUR = 2;

export const MS_PER_HOUR = 60 * 60 * 1000;

export const LOCAL_STORAGE_KEY = "oden-aquarium/save";

export const DAIKON_CHARACTER_ID = "daikon";
