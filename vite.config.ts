import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/whatsapp-chatnalyzer/',
  server: {
    port: 3000,
  },
  build: {
    minify: 'terser',
    outDir: 'dist',
    sourcemap: false
  }
});