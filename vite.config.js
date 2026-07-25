import { defineConfig } from 'vite';

export default defineConfig({

  base: process.env.NODE_ENV === 'production' ? '/GridVille/' : '/',

  root: './src',

  publicDir: './public',
  
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});