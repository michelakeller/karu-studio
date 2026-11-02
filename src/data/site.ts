/**
 * Site-wide facts and copy that appear in more than one place.
 * Change them here rather than hunting through templates.
 */

export const site = {
  name: 'karu studio',
  domain: 'karu-studio.com',
  url: 'https://karu-studio.com',
  /** One line, used for the meta description and the browser tab. */
  description:
    'karu studio is a two-person content studio for startups, VC, and tech. Film, design, social, and writing that sounds like a person made it.',
  /** TODO Michela: confirm the inbox you want on the site. */
  email: 'hello@karu-studio.com',
  /** Leave a value empty and the link disappears from the footer. */
  social: {
    linkedin: '',
    instagram: '',
  },
  nav: [
    { label: 'Work', href: '/work' },
    { label: 'Services', href: '/#services' },
    { label: 'Writing', href: '/writing' },
    { label: 'Contact', href: '/#contact' },
  ],
} as const;

/**
 * The service vocabulary used in `services:` frontmatter on work entries.
 * Markdown is free to use any string, this list only exists so the studio
 * stays consistent with itself.
 */
export const serviceVocabulary = [
  'video',
  'motion',
  'design',
  'social',
  'writing',
  'ghostwriting',
] as const;
