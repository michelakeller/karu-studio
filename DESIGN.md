# karu studio / design brief

## How to read this

Colour and typography are settled. Michela chose both, and sections 3 and 4
record what she chose and what follows from it. The rest of the document is a
mix of decisions already in the code and a short list of things still open.

Every item is tagged:

- **DECIDED** means Michela chose it, and the rest of the site has to agree
- **IN CODE** means it exists in the repo and is open to argument
- **PROPOSAL** means an opinion with reasoning attached, to accept or reject
- **OPEN** means nobody has decided yet

One note on the reference links in the project context. They are not targets.
This site is not a reinterpretation of any of them, and nothing below is an
attempt to produce a sibling of a site Michela liked. Where a reference appears
it is doing one job only, which is marking a level of craft to clear.

---

## 1. What the design has to do

The positioning makes one claim: everything in this market sounds and looks the
same, and karu does not. That claim has to be true of the website before a
visitor reads a word of it, because the site is the first sample of work.

Three consequences follow, and they constrain everything below.

**The site cannot look like it was assembled.** No hero image with a gradient
over it. No three equal cards with icons. No section that exists because sites
have that section. A visitor who has looked at forty agency sites this month
should be able to tell within one screen that a person laid this one out.

**The craft has to be visible at rest.** A static screenshot of this site has to
already be the argument. Motion is a second layer on a page that works without
it, never the thing holding it up.

**It has to stay editable by two people.** A look that depends on twelve bespoke
components will rot the first time someone is busy. Whatever we decide has to
survive Michela adding a project at eleven at night.

---

## 2. The page opens with type

**DECIDED.** No video on the landing page. Film may come later, and when it
does it will arrive as work inside a case study rather than as wallpaper behind
the first screen.

This is worth stating as a decision rather than a default, because the obvious
move for a studio that makes film is to open with a muted autoplay loop. Three
reasons not to. It costs the first two seconds of load on the one screen where
attention is cheapest to lose. It commits the top of the page to a slot that
has to be filled forever, and a studio this young does not have a reel that
wants to carry the whole brand yet. And the positioning is an argument made in
words, so the fastest way to make it is to say it.

So the hero is one sentence at the largest size the page uses, and nothing else
competes with it. There is deliberately no empty video frame waiting in the
layout, because a placeholder for film is worse than no film.

---

## 3. Typography

**DECIDED by Michela.** Main titles in Satoshi. Secondary titles, labels, and
display accents in Clash Display. Satoshi Italic where emphasis is needed in
running copy. Both families are self-hosted from `public/fonts/`, subset to
Latin plus the punctuation the site uses, and both are variable on the weight
axis. All three files together come to about 93KB. Nothing is loaded from a
third party, so the first paint does not wait on someone else's CDN.

### What each face does

The division is a single rule, and it is strict so that the hierarchy never
needs a weight chart to explain it. It is the inverse of the usual
display-serif hero pattern, and that inversion is intentional.

**Satoshi carries main titles and everything at reading size.** The hero
headline, h1 through h3, body copy, navigation, buttons, metadata, dates, and
tags. Section headings use weight 700 so they read clearly at large sizes.

**Clash Display carries secondary titles and display accents, never the main
headline.** The wordmark, section labels, section openers, hero lede, pull
quotes, blockquotes, and the one large number in a case study. It is set at
weight 500, with 400 reserved for long display lines such as the hero lede
where 500 would read as shouting.

**Satoshi Italic is for emphasis inside running copy, and nothing else.** It is
not preloaded, because it only ever appears below the first screen.

**There is no third family.** The first draft of this site used a monospace for
labels and metadata, which is the default move for editorial layouts and is now
common enough to read as a style rather than a decision. Satoshi in uppercase
at 11 to 12px with 0.14em of tracking does the same job, and it means the site
loads two families instead of three. The monospace token that remains in
`tokens.css` is for code blocks in a blog post, which is the only place a
monospace earns its keep.

### Two decisions that came out of setting it

**No full stop on the hero line.** Clash Display draws a square period. At
display sizes that square reads as a black block, not as punctuation. The hero
line is set in Satoshi and ends with no full stop. Clash Display still appears
in the hero lede below, where a square period at h1 size and below is charming
and stays.

**The scale is deliberately wide.** From body to the hero line is a factor of
about ten. A wide gap between the smallest and largest type is what makes a
page feel composed, and uniform sizing is the most common way a hand-built site
ends up looking generic. Only one element per page gets the largest step.

---

## 4. Colour

**DECIDED by Michela.** Four brand colours plus lily pad green.

| Hex      | Name            |
| -------- | --------------- |
| `901300` | deep oxblood    |
| `96B1CF` | dusty blue      |
| `EBE7E4` | warm off-white  |
| `FFFFFF` | white           |
| `4A8562` | lily pad green  |

`4A8562` is the fifth decided colour. Solid lily pad green, never transparent.
It has to read on oxblood, on dusty blue, and on off-white, because the pads
now sit on top of every kind of section.

Four colours is not a licence to use four colours everywhere. A palette becomes
a system only when each colour has a job it does. Here is that system. It is
enforced by the token names in `src/styles/tokens.css`, which are named by role
and never by hue, so nobody ends up with a variable called `--warm-grey` holding
a blue.

### First view is oxblood, with dusty blue type

**DECIDED by Michela.** The first screen of the landing page, header included,
is oxblood (`901300`) with every character in dusty blue (`96B1CF`). That is
the pairing she likes, used at the scale of a whole view rather than as a
highlight on a phrase.

The hero headline, lede, eyebrow, and both buttons are dusty blue. The primary
button is a dusty blue fill with oxblood type so it still reads as a button
against the oxblood ground. There is no separate oxblood pill behind the words
"content layer". The whole screen is that pairing now.

### The rest of the site mixes grounds

**DECIDED by Michela.** Below the first view the page is not one colour. Sections
take turns between:

- warm off-white (`EBE7E4`, the default `--paper`)
- white (`FFFFFF`, `.section--lift`)
- dusty blue (`96B1CF`, `.section--water`)
- oxblood (`901300`, `.section--deep` and the contact block)

On the landing page that mix currently runs oxblood, off-white, white, dusty
blue, off-white, dusty blue, white, oxblood. If a new section is added, pick
the next colour in that rotation rather than matching its neighbour.

### One addition I had to make, flagged for approval

**The four contain no body-copy colour for the paper sections.** Oxblood against
the warm off-white clears 7.6 to 1, so it is legible, but a whole site of dark
red body copy is tiring to read.

So `--ink` is derived: the oxblood hue pushed almost to black and nearly
desaturated, `#17100E`. It reads as a warm near-black that clearly belongs to
the same family as the oxblood rather than as a fifth brand colour. Two softer
steps come off it for secondary copy and for metadata. This is the type colour
on off-white and on white only. On oxblood, type is dusty blue.

### White is a ground now, as well as a lift

`FFFFFF` covers whole sections marked `.section--lift`. It still also appears
on surfaces meant to sit slightly above the paper: a hovered index row, the
inside of a code block, the mat behind an image. Using it as a section colour
is what stops the page from reading as one long sheet of off-white.

### Oxblood is a ground, not only an accent

`901300` fills the first view and the contact block, and it is available as a
section ground anywhere below. It is still the hover colour for links on paper,
and the result figure in a case study if there is one.

### Dusty blue is water, and first-view type

`96B1CF` does two jobs that used to be kept apart:

- it is the type colour on oxblood, including the entire first screen
- it is a section ground marked `.section--water`

Against off-white it still sits at about 1.6 to 1, which means it must not carry
information there. Service numerals on off-white stay in ink. Hairline rules,
list markers, blockquote bars, underlines, and the text selection highlight
remain dusty blue.

---

## 5. The moodboard, and the way it pulls in two directions

The board is torn on purpose. One side is reductive: a solid black frog mark
with the eyes and mouth cut out of it, a pixel outline frog, a flat green frog
on a blue pad, all under the note "minimal frog logo". The other side is
whimsical: a fairy frog holding a star wand, a winged frog, both under "cutesy"
and "frog with wings". Between them sits an antique engraving of a fly marked
"more edgy?", pulling toward precision and strangeness rather than either.

**The resolution: the mark is reductive, the whimsy lives in motion and in the
joke.** I am agreeing with Michela's read, and the board itself supplies the
argument. The cleanest thing on it is the card she marked "this style", a white
winged silhouette on black. It is whimsical in subject and completely flat in
execution. That is the whole answer in one image. The whimsy belongs in what
the thing is, never in how it is drawn. The two cutesy frogs are illustrations,
and an illustration used as a logo locks a brand into one rendering style and
one moment in taste, which is precisely how a site selling professional craft
starts to look dated. A flat silhouette ages the way a letterform does, which
is to say barely.

So the frog is one shape with no shading, no outline weight variation, and no
expression beyond what the negative space gives it. The playfulness arrives
somewhere a static logo cannot follow it: pads that move when you move, and one
joke that happens once.

The engraved fly is the useful corrective in the middle. When the fly appears,
it should be drawn with that kind of dry precision rather than as a cartoon
with a smile, which keeps the joke on the right side of charming.

The poster marked "lily pads instead of bubbles" is the layout reference, and it
is worth being exact about what to take from it. Orange organic blobs carry the
composition, and the page is better for them. Michela has now asked for the
pads to float on top of the copy rather than behind it, which is the opposite
of the earlier reading of that poster. The pads carry the layout by sitting
on it. Section 7 is the rule.

---

## 6. The frog

**IN CODE, and honestly a working mark rather than a finished logo.**

There is a frog in `src/components/FrogMark.astro`. I drew it. It is a frog head
reduced to a single silhouette with two round eyes and a mouth cut out of it as
negative space, so it inverts on the oxblood ground without a second file, and
it still reads at 16px, which is the real test for a favicon.

I am telling you plainly which it is: it is competent and it is not a designed
logo. It is clean, it reads, it works small, and it is close in device to the
black mark on Michela's own board, which is a derivative risk rather than an
original idea. A real mark is worth either her own drawing time or a designer's
fee.

Because of that it is used **small only**, beside the wordmark in the header and
footer, and as the favicon. It is deliberately not used at display size
anywhere, and the site does not depend on it. Replacing it means editing one
component and one SVG file.

I tried five other directions before settling, including fusing the frog with a
lily pad so the eyes break the top edge of a pad. That one was the most
distinctly karu idea on paper and it read as an amoeba at every size, so it
went.

---

## 7. The lily pads

**IN CODE.** The pads are the thing that makes this karu's site rather than a
nice document. They drift, they have weight, and the cursor pushes them out of
the way.

**DECIDED by Michela.** The pads float above the text, on top of the content,
not behind it. This reverses the earlier never-over-text rule. They are solid
lily pad green (`4A8562`), not transparent. Because they sit on top they can
appear on oxblood, white, off-white, and dusty blue, not only on the blue band.

Keep them tasteful. Four to six pads, modest size, never a crowd.

### The hard rule

**The pads sit on top of the copy.** They pass over words on purpose. The layer
is drawn above `.site-main` and `.site-footer`. The sticky header stays above
the pads so the wordmark and the nav remain clear.

They must not block clicks. The canvas and the still SVG layer both use
`pointer-events: none`. Cursor-push is read from a window listener, so the
canvas never captures the pointer that belongs to a link or a button.

### How they behave

Each pad is pulled along a slow loop of its own rather than orbiting a fixed
point, which is what makes it read as wandering rather than as bobbing. The pull
is soft, so a shove from the cursor overrides it completely and the pad springs
back afterwards. Pads bounce off each other with a loss of energy, and off the
viewport edges, so nothing ends up in a pile in one corner. They are not clamped
to a colour band. The whole viewport is the pond.

One loop takes between twelve and thirty seconds. That range is narrower than it
looks, and the first build sat well outside it: a loop of over a minute, which
is genuinely drifting and completely imperceptible. Watching a ten second
recording of it, the pads looked frozen. Anything much faster than twelve
seconds and the page is busy, which on a site whose argument is craft is worse
than no motion at all.

Pads are small, and there are four to six of them rather than nine. The
temptation is to fill the page. Resist it. Several small pads moving in their
own time read as water. Two large ones read as a graphic.

The shape matters more than the physics. A circle with a narrow deep slice taken
out of it reads as a pie chart. A circle with a wide shallow nick at the rim and
a few veins running from the base of that nick reads as a leaf. Those numbers
are tuned together at the top of `lilypads.ts` and are commented as such,
because they are the difference between a lily pad and a blob.

Two details in the shape are worth keeping. The outline wobbles, but only by a
couple of percent, because a strong wobble turns a lily pad into a potato. And
the veins bow outwards rather than running straight, because an even fan of
straight lines is a pie chart again no matter what the outline does.

### What it does not do

- **Performance.** One canvas, six pads at most, device pixel ratio capped at
  two, and the loop idles when the tab is hidden.
- **Clicking and screen readers.** The canvas is inert and hidden from the
  accessibility tree. It cannot swallow a click.
- **prefers-reduced-motion.** Nothing moves. No loop and no listeners.
- **No cursor, no animation.** On a touch device there is nothing to push the
  pads with, so animating them would be decoration with no function. Phones get
  a still arrangement instead.

### The still version is a different implementation, on purpose

The moving version is a canvas fixed to the viewport, redrawn every frame, so
the pads keep floating over whatever the visitor has scrolled to. The still
version is positioned SVG in **document** coordinates, placed once, scrolling
with the content. It also sits on top of the copy. Both versions build their
outline from the same geometry function, so there is only ever one definition of
the shape. Both are solid green. Both are `pointer-events: none`.

---

## 8. The frog catching a fly

**PROPOSAL, and I have not built it.**

### Where it belongs

One moment, not a motif sprinkled through the page. The joke is a client
catching someone's attention, so it belongs where the site asks the visitor to
become that client, which is the contact block at the bottom of the landing
page. Nowhere else on the page is asking for anything.

The mechanics I would build:

- The fly enters the oxblood block from the right, drawn with the dry precision
  of the engraving on the board rather than as a cartoon. Small, maybe 10px, a
  dark body and two fine wing strokes.
- It wanders on a path that is two sines at different frequencies, which gives
  the erratic, slightly annoying motion a real fly has.
- The frog mark sits at the left of the block. When the fly drifts within range,
  the tongue flicks out along a curve, takes it, and retracts. Roughly 400ms
  out, 90ms held, 220ms back.
- It fires **once**, the first time the block scrolls into view, and never
  again on that page load. A gag that repeats is a gag that becomes furniture.
- Nothing at all under prefers-reduced-motion, and nothing on a touch device.

### Why I held off

The joke only works if the frog is **the** frog. Animating a tongue out of the
mark described in section 6 would bake a placeholder into the single piece of
comedy the brand gets, and it would have to be rebuilt the moment a real logo
exists. Building it now buys one good afternoon and costs the same afternoon
again later.

So this is sequenced behind the logo rather than behind my own appetite for it.
When there is a final frog, this is about half a day of work and the placement
above is the part worth arguing about now.

---

## 9. Grid and page frame

**IN CODE, open to argument.**

A twelve column grid with a fluid gutter, inside a maximum width wide enough
that a laptop does not feel like it is reading a column. Sections are divided by
both hairline rules and changes of background, because Michela asked for a mix
of oxblood, dusty blue, white, and off-white rather than one long sheet.

Most sections are a two column split: a small uppercase label on the left, the
content on the right. That pattern earns its place twice over. It gives the page
a left margin that behaves like a printed index. It keeps section names out of
the heading hierarchy. The pads no longer need that empty column as a hiding
place, because they sit on top of the copy.

**Project and writing entries are index rows, not cards.** Rows look like a
catalogue. Cards look like a template, and three cards in a row is the single
most recognisable tell of an assembled site. Rows also scale honestly. Four look
deliberate and twenty still look fine.

**OPEN** Whether the work index eventually breaks its own rhythm, for example
with one full width image every few rows. Easier to judge once there are real
projects in the folder.

---

## 10. Motion

**IN CODE.** Two durations and one easing curve for the interface. Links and
hover states move fast. Image treatments move slowly. **Nothing animates on
scroll.**

Scroll-triggered fade-ups are now so common that they read as a template rather
than as craft, and they make a site feel slower than it is, because the content
arrives after the scroll instead of with it. The pads are the only thing on the
site that moves on its own, which is what makes them register at all. If three
other things moved, the pads would be noise.

The one interface flourish worth keeping or killing on purpose: project
thumbnails sit in greyscale and come to colour on hover. It gives the work index
a reason to be touched, and it keeps a wall of mismatched client palettes calm
until someone is actually looking at one entry.

`prefers-reduced-motion` is respected globally.

---

## 11. Image and video treatment

**OPEN, and the most underspecified part of this brief.** It cannot be settled
without real material to look at.

Questions for Michela:

1. Do case studies get an embedded player, a link out to the original post, or
   a self-hosted file? Hosting video on Cloudflare Pages is a bad idea at any
   real volume, so this means Vimeo, Mux, or Cloudflare Stream, and it is a cost
   decision as much as a design one.
2. Are stills treated, as in a consistent grade or crop, or shown as delivered?
3. Does the work index want one image per row, or none until you open an entry?

**PROPOSAL** until she decides: stills keep a consistent aspect ratio on the
index so the rows stay level, and run full bleed inside a case study so the work
gets the room. Captions are set small, uppercase, and tracked, which separates
the studio's voice from the client's material.

---

## 12. The rules that keep it from looking templated

These are the ones worth defending in review, because each is a place where the
easy choice produces a site that looks like every other site.

1. **No three-across card grid.** Anywhere. Rows and lists instead.
2. **No icons next to the services.** Five numbered lines with a sentence each
   say more than five pictograms.
3. **No stock photography and no abstract gradients.** If there is no real image
   yet, the space stays empty and says so.
4. **Section labels stay small.** They are navigation, not headlines, which is
   why they sit in the margin.
5. **Rules instead of boxes.** A hairline between sections, not a card with a
   shadow.
6. **Empty states are written, not hidden.** A missing case study is an honest
   sentence and an email link, never a row that says "coming soon".
7. **One idea per screen.** If two sections compete on a laptop screen, one of
   them is in the wrong place.
8. **Copy sets the layout, not the reverse.** Every measure is set in characters
   rather than pixels, so line length stays readable instead of stretching to
   fill a container.
9. **First view is oxblood with dusty blue type.** Section 4.
10. **Below the first view, mix the grounds.** Not all one colour. Section 4.
11. **Dusty blue never carries information on off-white.** Section 4.
12. **Pads float above the copy, solid green, and they do not steal clicks.**
    Section 7.

---

## 13. Open questions, collected

Design questions, in rough order of how much they block the rest.

1. The real logo. Section 6 explains why the current frog is used small only,
   and the fly joke in section 8 is waiting on it.
2. Where the fly gag goes, if not the contact block. Section 8.
3. Video hosting and who pays for it. Section 11.
4. Image treatment on the work index. Section 11.
5. Whether body copy should be oxblood rather than the derived near-black.
   Section 4. My recommendation is to keep the near-black.
6. Dark mode. My recommendation is to skip it. A studio site is a controlled
   surface and two palettes is twice the work for no benefit here.

And three that are not design questions but are blocking real copy. None of
these are invented in the repo, they are marked as placeholders in the code.

7. The partner's name, and how the two of them are described before December.
   The sentence is marked `data-placeholder="partner-description"` in
   `src/pages/index.astro`.
8. The inbox for the site. `hello@karu-studio.com` is a placeholder in
   `src/data/site.ts`.
9. The three process steps on the landing page are a reading of how the studio
   works, not a confirmed process. Marked as a proposal in
   `src/data/services.ts`.
