import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configurable base path for proxy setups
  // Examples:
  // VITE_BASE_PATH=/21mint.me/ (for subpath)
  // VITE_BASE_PATH=/ (for root, default)
  // VITE_BASE_PATH=/cashu/ (for another subpath)
  base: process.env.VITE_BASE_PATH || '/',
  
  server: {
    // Allow any host for development behind proxies
    host: '0.0.0.0',
    port: parseInt(process.env.VITE_PORT || '5174'),
    
    // Allow requests from any host (important for proxy setups)
    allowedHosts: process.env.VITE_ALLOWED_HOSTS ? 
      process.env.VITE_ALLOWED_HOSTS.split(',') : 
      true, // true allows all hosts
    
    // Additional proxy-friendly headers
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    
    // Proxy configuration for development
    proxy: {
      // Proxy API requests if needed
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  // Build configuration for production
  build: {
    // Ensure assets use relative paths when behind a proxy
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Generate clean asset names
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    }
  },
  
  // Preview server configuration (for production builds)
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.VITE_PREVIEW_PORT || '4173'),
    // Also allow all hosts for preview server
    allowedHosts: process.env.VITE_ALLOWED_HOSTS ? 
      process.env.VITE_ALLOWED_HOSTS.split(',') : 
      true,
  },
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
