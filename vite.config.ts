import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Two pages: the cinematic homepage and the Projects archive.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        projects: resolve(import.meta.dirname, 'projects.html'),
      },
    },
  },
});
