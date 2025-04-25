import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // Generate source maps for production builds
    sourcemap: false,
    
    // Basic build configuration
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    
    // Disable minification for troubleshooting
    minify: false
  },
  optimizeDeps: {
    include: ['lodash']
  }
}) 