import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  assetsInclude: ['**/*.bin'],
  build: {
    target: 'es2020'
  }
});
