// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs, the sitemap, and social preview tags.
  site: 'https://karu-studio.com',
  markdown: {
    shikiConfig: {
      theme: 'vitesse-light',
      wrap: true,
    },
  },
});
