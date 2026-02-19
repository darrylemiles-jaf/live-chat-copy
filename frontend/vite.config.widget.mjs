import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget.jsx'),
      name: 'LiveChatWidget',
      fileName: 'live-chat-widget',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        entryFileNames: 'live-chat-widget.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'live-chat-widget.css';
          }
          return assetInfo.name;
        },
        inlineDynamicImports: true
      }
    },
    outDir: 'dist-widget',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
