import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({

  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'mentions-legales': resolve(__dirname, 'mentions-legales.html'),
      },
    },
  },
})