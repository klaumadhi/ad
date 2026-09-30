import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Listen on the local network too, so the site can be opened from a phone on the same Wi-Fi.
  server: { host: true },
  preview: { host: true },
})
