import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 8080,
    allowedHosts: [
      '.cloud9.us-east-1.amazonaws.com',
      '.amazonaws.com'
    ]
  }
});
