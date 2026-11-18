import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
          const env = loadEnv(mode, process.cwd(), '')
          const backendTarget = env.VITE_BACKEND_URL || 'https://backend-five-beta-26.vercel.app'

          return {
            plugins: [react()],
            server: {
              proxy: {
                '/uploads': {
                  target: backendTarget,
                  changeOrigin: true,
                  secure: false
                },
                '/api': {
                  target: backendTarget,
                  changeOrigin: true,
                  secure: false
                }
              }
            }
          }
        })
