// 商品画像表示コンポーネント。商品名がテキストとして併記される前提のため、
// 既定で装飾扱い(空alt + aria-hidden)にし、スクリーンリーダーへ二重に読ませない。
// サイズは呼び出し元がラップするコンテナ(className)で制御する。
import "./ItemImage.css";

export function ItemImage({ src, className = "" }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`item-image ${className}`}
    />
  );
}
