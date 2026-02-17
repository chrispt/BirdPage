import { defineConfig } from 'vite';
import { resolve } from 'path';

const cspContent = [
  "default-src 'none'",
  "script-src 'self' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://app.birdweather.com https://media.birdweather.com data:",
  "connect-src 'self' https://app.birdweather.com https://api.pushover.net https://static.cloudflareinsights.com",
  "media-src 'self' https://media.birdweather.com",
  "font-src 'self'",
  "manifest-src 'self'"
].join('; ');

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      'lucide': resolve('node_modules/lucide/dist/esm/lucide/src/lucide.js')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    open: true,
    port: 3000
  },
  plugins: [
    {
      name: 'inject-csp',
      transformIndexHtml(html, ctx) {
        // Only inject CSP in production builds
        if (ctx.bundle) {
          return html.replace(
            '<meta charset="UTF-8">',
            `<meta charset="UTF-8">\n    <meta http-equiv="Content-Security-Policy" content="${cspContent}">`
          );
        }
        return html;
      }
    }
  ]
});
