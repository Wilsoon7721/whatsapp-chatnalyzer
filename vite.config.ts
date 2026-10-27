import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { graph, PERSON_ID, ref, serialize, website } from '@wilsoon/site-meta';

const APP_URL = 'https://wilsoon.dev/apps/whatsapp-chatnalyzer';

// Describes the app rather than a page: every route shares this index.html.
const jsonLd = graph(
  website({ origin: 'https://wilsoon.dev', name: 'Wilson Oon', description: 'Full-Stack Developer based in Singapore specializing in Node.js, React, and Python.' }),
  {
    '@type': 'WebApplication',
    '@id': `${APP_URL}#webapp`,
    name: 'WhatsApp Chat Analyzer',
    url: APP_URL,
    description: 'Analyze and visualize your WhatsApp chat data using statistics and trends.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    image: `${APP_URL}/assets/og-image.png`,
    isPartOf: ref('https://wilsoon.dev/#website'),
    author: ref(PERSON_ID),
    publisher: ref(PERSON_ID),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
);

const injectJsonLd: Plugin = {
  name: 'inject-json-ld',
  transformIndexHtml: () => [{ tag: 'script', attrs: { type: 'application/ld+json' }, children: serialize(jsonLd), injectTo: 'head' }],
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), injectJsonLd],
  server: {
    port: 3000,
  },
  build: {
    minify: 'terser',
    outDir: 'dist',
    sourcemap: false,
  },
  base: mode === 'production' ? '/apps/whatsapp-chatnalyzer/' : '/',
}));
