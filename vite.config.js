import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Proxy API calls to backend during development
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  
  // Production build optimizations
  build: {
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-pixi': ['pixi.js', '@pixi/react'],
          'vendor-ui': ['framer-motion', 'zustand'],
        },
      },
    },
    // Asset size warnings
    chunkSizeWarningLimit: 600,
    // Enable source maps for debugging
    sourcemap: false,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
  },
})
