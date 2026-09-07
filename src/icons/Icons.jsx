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

// aria-hidden等、呼び出し側からのpropsを実際のsvg要素へ引き継ぐ。
// styleは呼び出し側の指定とマージしつつ、pointerEvents:noneは必ず維持する。
function Icon({ children, className, size = 20, style, ...svgProps }) {
  return (
    <svg
      {...BASE_PROPS}
      width={size}
      height={size}
      className={className}
      style={{ ...style, pointerEvents: "none" }}
      {...svgProps}
    >
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
      {/* 太陽(光条)と混同しないよう、歯が輪に接する短い凹凸+中心穴の歯車にする。 */}
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3.8v2.2M12 18v2.2M20.2 12h-2.2M6 12H3.8M17.8 6.2l-1.56 1.56M7.76 16.24l-1.56 1.56M17.8 17.8l-1.56-1.56M7.76 7.76 6.2 6.2" />
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
      {/* 鍵・虫眼鏡・スプーンと混同しないよう、浅いD字の受け皿(直線の縁+丸い底)+
          斜めに長く伸びる柄で構成する。柄先に独立した丸(穴)は付けない。 */}
      <path d="M3.6 11.6c0 3 2.9 4.3 6.4 4.3s6.4-1.3 6.4-4.3" />
      <path d="M3.6 11.6h12.8" />
      <path d="M14.3 10.4 20.8 4" />
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
