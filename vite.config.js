import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

function googleSiteVerification(code) {
  const value = String(code || '').trim().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 100)
  if (!value) return null
  return {
    name: 'google-site-verification',
    transformIndexHtml(html) {
      if (html.includes('name="google-site-verification"')) return html
      return html.replace(
        '<meta name="robots"',
        `    <meta name="google-site-verification" content="${value}" />\n    <meta name="robots"`,
      )
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), googleSiteVerification(env.VITE_GOOGLE_SITE_VERIFICATION)].filter(Boolean),
  }
})
