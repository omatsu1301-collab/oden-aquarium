// 共通線画アイコン(仕様6章)。外部アイコンライブラリは追加せず、世界観に合う小さな線画SVGを自作する。
// 全アイコン共通の基準: viewBox 0 0 24 24 / currentColor / 線幅1.8〜2 / round cap・join。
// 装飾アイコンは呼び出し側でaria-hidden="true"を付け、ボタンのaria-labelと二重に読ませない。
const BASE_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Icon({ children, className, size = 20 }) {
  return (
    <svg {...BASE_PROPS} width={size} height={size} className={className} style={{ pointerEvents: "none" }}>
      {children}
    </svg>
  );
}

// 昆布・海藻: だし水槽ブランド
export function SeaweedIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 21c-.5-4 .5-7-1-10S3 6 4 3" />
      <path d="M12 21c-.5-5 1-8-.5-11.5S10 4 11.5 2" />
      <path d="M18 21c-.5-4 .8-6.5-.3-9.5S16 7 17.5 4" />
    </Icon>
  );
}

// 封筒: お願い・おたより
export function EnvelopeIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
      <path d="M3.8 6.5 12 13l8.2-6.5" />
    </Icon>
  );
}

// 歯車: 設定
export function GearIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.6 6.4l-1.55 1.55M7.95 16.05 6.4 17.6M17.6 17.6l-1.55-1.55M7.95 7.95 6.4 6.4" />
    </Icon>
  );
}

// きらめき: 水槽の状態
export function SparkleIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5c.6 3 1.9 4.3 4.9 4.9-3 .6-4.3 1.9-4.9 4.9-.6-3-1.9-4.3-4.9-4.9 3-.6 4.3-1.9 4.9-4.9Z" />
      <path d="M18.5 14.5c.3 1.4.9 2 2.3 2.3-1.4.3-2 .9-2.3 2.3-.3-1.4-.9-2-2.3-2.3 1.4-.3 2-.9 2.3-2.3Z" />
    </Icon>
  );
}

// おたま: お世話・出汁補充
export function LadleIcon(props) {
  return (
    <Icon {...props}>
      {/* 虫眼鏡と混同しないよう、楕円の受け皿(上から見た形)+柄+吊り下げ穴で構成する。 */}
      <ellipse cx="9" cy="13.2" rx="6" ry="4" />
      <path d="M14.4 11.6 19.6 8.2" />
      <circle cx="20.6" cy="7.5" r="1.3" />
    </Icon>
  );
}

// 開いた本: 図鑑
export function BookIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 6.2c-1.6-1.4-3.9-2-6.8-1.9v13.4c2.9-.1 5.2.5 6.8 1.9 1.6-1.4 3.9-2 6.8-1.9V4.3c-2.9-.1-5.2.5-6.8 1.9Z" />
      <path d="M12 6.2v13.4" />
    </Icon>
  );
}

// 丸い水の器: 水槽
export function TankJarIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 9.5c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5-2.7 9-6 9-6-6.5-6-9Z" />
      <path d="M8.3 8.5c1.2.8 2.4 1.1 3.7 1.1s2.5-.3 3.7-1.1" />
    </Icon>
  );
}

// 暖簾/店先: 商店
export function ShopIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 4.5h16" />
      <path d="M5.5 4.5v6.7c0 .9-.4 1.3-1 1.8 1.6.5 2.9-.2 3-1.5.1 1.3 1.4 2 3 1.5-1.6.5-1-.7-1-1.8V4.5" />
      <path d="M13.5 4.5v6.7c0 .9-.4 1.3-1 1.8 1.6.5 2.9-.2 3-1.5.1 1.3 1.4 2 3 1.5-1.6.5-1-.7-1-1.8V4.5" />
      <path d="M7 14.5h10v5H7z" />
    </Icon>
  );
}

// 時計: 効果の残り時間
export function ClockIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.3l3 2" />
    </Icon>
  );
}

// 閉じる: 共通Sheet
export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}
