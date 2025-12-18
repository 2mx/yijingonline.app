import {
  defineConfig
} from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig( {
  esbuild: {
    target: 'esnext',
    format: 'esm',
    loader: 'js',
    include: /\.(js|jsx|ts|tsx)$/
  },
  build: {
    target: 'esnext',
    minify: 'esbuild'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  plugins: [tailwindcss()],
})