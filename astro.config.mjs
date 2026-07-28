// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://shaunclaw07.github.io',
  base: '/anime-tracker',
  output: 'static',
  build: {
    assets: 'assets'
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
