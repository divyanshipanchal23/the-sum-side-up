import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // Generate source maps for production builds
    sourcemap: false,
    
    // Basic build configuration
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    
    // Disable minification for troubleshooting
    minify: false
  }
}) 