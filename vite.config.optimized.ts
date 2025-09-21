import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    
    // Environment variables
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
      'process.env.UNSPLASH_ACCESS_KEY': JSON.stringify(process.env.UNSPLASH_ACCESS_KEY)
    },
    
    // Path resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@components': path.resolve(__dirname, './components'),
        '@services': path.resolve(__dirname, './services'),
        '@lib': path.resolve(__dirname, './lib'),
        '@assets': path.resolve(__dirname, './assets')
      }
    },
    
    // Build optimization
    build: {
      sourcemap: mode === 'development',
      minify: 'esbuild',
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            gemini: ['@google/genai']
          }
        }
      }
    },
    
    // Server optimization
    server: {
      port: 3000,
      host: true
    },
    
    // Preview server
    preview: {
      port: 3000,
      host: true
    }
  };
});