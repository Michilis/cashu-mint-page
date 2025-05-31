import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    port: parseInt(process.env.VITE_PORT || '5174'),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
