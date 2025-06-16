import { defineConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import tailwind from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwind(), vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('animejs')) return 'animejs';
        },
      },
    },
  },
});
