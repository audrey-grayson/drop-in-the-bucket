import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project is hosted at https://<user>.github.io/drop-in-the-bucket/
// so assets must resolve under that sub-path. Routing uses HashRouter,
// which keeps deep links working on GitHub Pages without server config.
// https://vite.dev/config/
export default defineConfig({
  base: '/drop-in-the-bucket/',
  plugins: [react()],
})
