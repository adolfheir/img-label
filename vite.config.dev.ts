// import react from '@vitejs/plugin-react';
import react from '@vitejs/plugin-react-swc';
import { join } from 'node:path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 32301,
  },
  plugins: [react({ tsDecorators: true })],
});
