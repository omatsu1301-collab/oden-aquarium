import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages のプロジェクトページ(https://<owner>.github.io/oden-aquarium/)で
// アセットの参照パスが解決できるよう、base をリポジトリ名に合わせる。
export default defineConfig({
  base: "/oden-aquarium/",
  plugins: [react()],
})
