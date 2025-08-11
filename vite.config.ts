import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// cambia 'repo-name' por el nombre EXACTO del repo
export default defineConfig({
  plugins: [react()],
  base: '/repo-name/',
  build: { outDir: 'docs' }
})
