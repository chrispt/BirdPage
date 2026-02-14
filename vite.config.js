import { defineConfig } from 'vite';

const cspContent = [
  "default-src 'none'",
  "script-src 'self' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://app.birdweather.com https://media.birdweather.com https://via.placeholder.com data:",
  "connect-src 'self' https://app.birdweather.com https://api.pushover.net https://static.cloudflareinsights.com",
  "media-src 'self' https://media.birdweather.com",
  "font-src 'self'",
  "manifest-src 'self'"
].join('; ');

export default defineConfig({
  root: '.',
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
