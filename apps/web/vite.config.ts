import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const framework = /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/;

export default defineConfig({
  plugins: [react()],
  build: {
    // No production source maps: smaller deploys and no shipped source.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep the stable framework code in its own chunk so app edits do not bust its cache.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          return framework.test(id) ? 'react' : 'vendor';
        }
      }
    }
  },
  server: { port: 5173, host: '0.0.0.0' }
});
