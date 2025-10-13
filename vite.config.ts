import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

declare const process: {
  env: {
    PORT?: string
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    allowedHosts: [
      'aiovideodownloaderfront.onrender.com',
      'localhost',
      '127.0.0.1',
    ],
  },
})
