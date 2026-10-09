import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/proxy/archidekt': {
        target: 'https://archidekt.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/archidekt/, ''),
      },
      '/proxy/moxfield': {
        target: 'https://api2.moxfield.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/moxfield/, ''),
      },
    },
  },
});