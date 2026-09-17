import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Multi-page build: the app (index.html), the public landing page (website/), and the
// design-reference pages under design/. The portal at the app's root links to website/.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        colors: resolve(__dirname, 'design/colors.html'),
        components: resolve(__dirname, 'design/components.html'),
        overview: resolve(__dirname, 'design/overview.html'),
        website: resolve(__dirname, 'website/index.html'),
      },
    },
  },
});
