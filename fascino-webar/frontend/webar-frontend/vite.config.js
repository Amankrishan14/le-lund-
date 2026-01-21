import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Check if certificate files exist, otherwise Vite will generate them
// Only use HTTPS in development (Vercel handles HTTPS in production)
// For local dev, allow HTTP fallback if HTTPS fails
let httpsConfig = false
if (process.env.NODE_ENV !== 'production') {
  // Try to use HTTPS if certificates exist, otherwise fall back to HTTP
  try {
    const keyPath = path.resolve(__dirname, 'key.pem')
    const certPath = path.resolve(__dirname, 'cert.pem')
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      httpsConfig = {
        key: fs.readFileSync(keyPath, 'utf8'),
        cert: fs.readFileSync(certPath, 'utf8')
      }
      console.log('✅ Using existing SSL certificates')
    } else {
      // Don't force HTTPS - let Vite auto-generate if needed, or use HTTP
      // Camera will work on localhost even with HTTP
      httpsConfig = false
      console.log('ℹ️  Running on HTTP for local development (HTTPS not required for localhost)')
    }
  } catch (error) {
    console.log('ℹ️  Using HTTP for local development:', error.message)
    httpsConfig = false
  }
}

export default defineConfig({
  base: '/',
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  server: {
    https: httpsConfig,
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  },
  appType: 'spa'
})

