/**
 * The five things karu sells, and the three steps of working together.
 * Edit the copy here and both the landing page and any future page that
 * lists services stay in sync.
 */

export const services = [
  {
    id: 'video',
    name: 'Video and motion graphics',
    blurb:
      'Launch films, founder stories, product walkthroughs, and the motion work that holds a cut together.',
  },
  {
    id: 'design',
    name: 'Graphic design',
    blurb:
      'Your brand assets actually put to use. Decks, stills, covers, and the small pieces that make a feed look deliberate.',
  },
  {
    id: 'social',
    name: 'Short-form social',
    blurb:
      'Vertical cuts and native posts made for the platform they land on, not resized on the way out the door.',
  },
  {
    id: 'writing',
    name: 'Long-form writing',
    blurb:
      'Blogs and newsletters that carry one argument through to the end instead of restating the category.',
  },
  {
    id: 'ghostwriting',
    name: 'Ghostwriting',
    blurb:
      'Your LinkedIn in your voice, on a cadence you do not have to think about every Monday.',
  },
] as const;

/**
 * PROPOSAL, not yet confirmed by the founders. These three steps are a
 * reasonable read of how the studio works, written so a prospect knows
 * what the first two weeks feel like. Replace with the real process.
 */
export const process = [
  {
    step: '01',
    name: 'You send the folder',
    blurb:
      'The deck, the brand kit, the call recordings, whatever already exists. We read all of it before we make anything.',
  },
  {
    step: '02',
    name: 'We come back with work, not a proposal',
    blurb:
      'A short direction and a first batch, so you are reacting to real cuts and real copy rather than a slide about them.',
  },
  {
    step: '03',
    name: 'Then it runs',
    blurb:
      'A steady cadence of film, design, and writing. You approve, we publish, and social stops being the thing that slipped again.',
  },
] as const;
