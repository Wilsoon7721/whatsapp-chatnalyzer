import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    minify: 'terser',
    outDir: 'dist',
    sourcemap: false,
  },
  base: mode === 'production' ? '/apps/whatsapp-chatnalyzer/' : '/',
}));
