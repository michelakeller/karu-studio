// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs, the sitemap, and social preview tags.
  site: 'https://karu-studio.com',
  // The floating toolbar on the dev server covers the bottom of the page.
  // Turn it back on if you ever want the audit and island panels.
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: {
      theme: 'vitesse-light',
      wrap: true,
    },
  },
});
