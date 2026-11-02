# karu studio / design brief

## How to read this

This is a skeleton, not a finished brief. Michela owns the colour and the
typography. Those two sections are written as questions and options rather than
answers, so there is something concrete to argue with when her references
arrive.

Every item is tagged:

- **OPEN** means nobody has decided and the decision is Michela's
- **PROPOSAL** means an opinion with reasoning attached, to accept or reject
- **IN CODE** means it already exists in the repo and can still be changed

Nothing in the colour or type sections is IN CODE in any meaningful sense. The
current values are placeholders sitting in `src/styles/tokens.css` purely so the
page is legible while the real direction gets settled. Swapping them is a
one-file change by design.

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

**The craft has to be visible at rest, not on hover.** Most sites that want to
signal craft do it with motion, which means the craft only exists while you are
moving the mouse. If the typography and the spacing are right, a static
screenshot of this site is already the argument.

**It has to stay editable by two people.** A look that depends on twelve bespoke
components will rot the first time someone is busy. Whatever we decide has to
survive Michela adding a project at eleven at night.

---

## 2. What each reference actually gives us

The inspiration list is doing several different jobs, and it is worth separating
them before using any of it.

**[stovi.in/works](https://stovi.in/works)** is the one to beat, and reading it
closely is useful because its weakness is specific. Its case studies lead with
percentages (`+9,980% vs Average reach`, `~19,000% Above Baseline`) and leave
the actual work in second place. That reads as performance marketing, and it
invites the reader to audit the number instead of looking at the film. It also
publishes placeholder states in public, with entries marked "Coming soon" and
"In Progress" sitting in the case study list. Two decisions fall out of that.
First, a karu case study leads with what was made and keeps the number as a
small aside, which is why `result` is a secondary field in the work schema
rather than the headline. Second, the site never ships a placeholder. An empty
work index says it is empty and offers the reel, which is the decision already
built into the empty state.

**[rocchiettistudio.com](https://rocchiettistudio.com)** is the closest model
for tone and for how much warmth a studio site can carry while still being
sharp. It is first person, it is funny in one or two places, and it answers the
awkward questions out loud rather than hiding them behind a contact form. The
page is a sequence of plainly named moves: what you get, how it works step by
step, who you are working with, then the questions everyone asks. That sequence
is close to what the karu landing page does now. The thing worth stealing is not
the layout but the willingness to put a real sentence where most sites put a
value proposition.

**[Hey Clicky](https://www.heyclicky.com/mac)** is the register, and it is the
most directly usable reference on the list. Their pages are lowercase, small,
and written like a message rather than a page. The download page says "thanks
for downloading! just a few steps left" and then numbers the steps. There is no
brand voice in it, which is why it reads as a voice. The karu wordmark is
already lowercase for the same reason. Where the two brands differ is weight:
Hey Clicky can be that light because it sells a consumer app, while karu is
asking a founder to hand over a budget, so the type can be quieter but the
layout has to be more composed.

**[Tenfold Films](https://www.tenfoldfilms.com/about)** is the production
benchmark and the clearest counter-example for voice. Their about page runs
"visually impactful, short form stories that lift your message from bland to
extraordinary" and splits the work into Concept and Pre-Production, Production,
and Post-Production and Delivery. The process breakdown is genuinely useful and
worth matching in substance. The sentence is exactly what the voice rules exist
to prevent. Useful as a reminder that a site can have real production credibility
and still say nothing.

**[YC on launch videos](https://www.ycombinator.com/library/fY-this-is-how-you-should-actually-make-launch-videos)**
argues that a demo should be treated as a launch and that a video which sounds
unscripted outperforms one that looks expensive. Applied to the website, the
equivalent claim is that a rough cut shown honestly beats a polished showreel
that shows nothing. It is the reason the work schema has `link` and optional
video rather than assuming every project arrives with a finished brand film.

**[Joan Westenberg](https://www.joanwestenberg.com/p/why-im-building-a-one-person-billion)
and [Studio Self](https://www.thisisstudioself.com/)** are the argument for
being two people on purpose. The studio section says that out loud rather than
pretending to be bigger, which is both true and the actual differentiator.

**[story.inc/lie](https://story.inc/lie/)** and the
[designer film](https://www.instagram.com/reel/DeqoFdpOTsD/) are referenced for
site craft and personality. I have not been able to study either one properly,
since the first did not return usable content and the second needs an Instagram
session. Michela should describe what she takes from them, because they look
like the two references most likely to push the look away from the restrained
default proposed below.

---

## 3. Typography

**OPEN. Michela decides.** The repo currently runs on system stacks and loads no
webfont at all, which is a placeholder state and not a proposal.

### What needs answering

1. One typeface for everything, or a pair?
2. If a pair, where does the split fall: display against text, or serif against
   a sans used only for labels and navigation?
3. Serif, sans, or something with real personality in the display face?
4. Are we willing to pay for a licence, or does it need to be open source?
5. Is there a face Michela already associates with karu, from a deck or a
   previous project, that the site should match?

### Three directions, with the argument for each

**Option A, one serif doing everything.** A single text serif with a real italic,
set large for headlines and at reading size for body, with metadata in a
monospace. This is the restrained option. It reads as editorial rather than
agency, it never looks assembled, and it is almost impossible to make ugly. The
risk is that it is a well-trodden look. Every thoughtful studio site of the last
three years is some version of it, which cuts directly against the claim that
karu does not look like everything else.

**Option B, a display face with opinions plus a neutral text face.** One
distinctive face used only at the top of pages and for the wordmark, and
something plain underneath it. This is how most studios buy personality without
risking legibility. It gives the site one memorable screen, and it puts the whole
weight of the brand on a single choice. If the display face is good, the site is
good. If it is fashionable, the site dates in eighteen months.

**Option C, a sans for everything, set tight and large.** Closer to Hey Clicky
and to how the startup audience reads. It would make karu look native to the
tech space rather than imported from the design world, which is arguably the
right signal for a studio whose clients are founders. The risk is obvious: it is
one step away from looking like the product sites it sits next to.

My honest read, offered as a proposal and not a decision: Option B, with the
display face chosen to be strange rather than elegant. Option A is safer and
will produce a site Michela is happy with, but it concedes the differentiation
argument. The strangeness should be in exactly one place so the rest can stay
readable.

### Things worth deciding at the same time

- **PROPOSAL** Self-host the files from `public/fonts/` rather than linking
  Google Fonts, so the first paint has no third-party request and nothing
  changes underneath us later.
- **PROPOSAL** Set the wordmark in the display face at a size noticeably smaller
  than the first headline. The site should not open by shouting its own name.
- **OPEN** Does the wordmark stay as two parts, "karu" in the display face with
  "studio" as a small label beside it, or does it become one locked piece of
  lettering? That is really a logo decision rather than a web one.

---

## 4. Colour

**OPEN. Michela decides.** The current palette is a warm off-white with a soft
black and a single rust accent. It was chosen to be inoffensive while the real
palette is pending, and it should not be read as an argument.

### What needs answering

1. Light site, dark site, or light with dark sections, which is what the page
   does now?
2. One accent or two?
3. Does the accent carry meaning, as in links and results and calls to action
   only, or is it decorative?
4. Is the paper neutral or warm? Warm whites read as print and as craft, cool
   greys read as software.
5. Is there a colour already attached to karu that the site has to honour?

### Two directions, with the argument for each

**Option A, near monochrome with one accent used sparingly.** Paper, ink, and a
single colour that appears maybe four times on the landing page. This puts all
the expressive load on type and image, which is correct for a studio whose work
is the colourful part. It also means client work never fights the site around
it, which matters a lot once there are twelve case studies with twelve different
brand palettes on one index.

**Option B, a committed non-neutral ground.** The whole site on an unexpected
colour, with the work sitting on top of it. More memorable and more of a risk.
It works when the studio's own identity is meant to be the loudest thing in the
room, and it works against showing client work honestly.

My proposal is Option A, specifically because of the second argument. A work
index is a wall of other people's colour, and a loud site turns it into noise.
If Michela wants the site itself to be the statement, Option B is defensible, but
then the case study pages probably need their own quieter treatment.

### Either way

- **PROPOSAL** Tokens stay named by role, never by hue. `--ink`, `--paper`,
  `--accent`, `--rule`. A token called `--warm-grey` is a trap the first time
  the palette changes.
- **PROPOSAL** One accent carries links, hover states, and the single number in a
  case study. Nothing else.
- **OPEN** Dark mode. My view is to skip it. A studio site is a controlled
  surface and two palettes is twice the work for no benefit here.

---

## 5. Grid and page frame

**IN CODE, open to argument.**

The page is a twelve column grid with a fluid gutter, inside a maximum width
wide enough that a laptop does not feel like it is reading a column. Sections
are separated by hairline rules rather than by background colour changes, which
is the single cheapest way to make a page read as a document rather than as a
stack of blocks.

Most sections are built as a two column split: a small label in a monospace on
the left, the content on the right. That pattern is doing real work. It gives the
page a left margin that behaves like a printed index, it keeps section names out
of the headline hierarchy, and it collapses cleanly to one column on a phone.
Both the work index and the writing index use the same structure, so the whole
site reads as one continuous document.

**PROPOSAL** Project and writing entries are index rows, not cards. Rows look
like a catalogue. Cards look like a template, and three cards in a row is the
single most recognisable tell of an assembled site. Rows also scale honestly:
four of them look deliberate and twenty still look fine.

**OPEN** Whether the work index eventually breaks its own rhythm, for example
with one full width image every few rows. That decision is easier once there are
real projects in the folder.

---

## 6. Scale and hierarchy

**IN CODE, open to argument.**

One fluid scale for the whole site, with steps named by role rather than by
size, so retuning the scale does not mean renaming anything. The jump from body
to the largest headline is deliberately big. A wide gap between the smallest and
largest type is what makes a page feel composed rather than uniformly sized, and
uniform sizing is the most common way a hand-built site ends up looking generic.

**PROPOSAL** Only one element per page gets the largest size. On the landing page
that is the opening line. Everything else steps down.

**OPEN** How large the hero line actually goes. It is currently set to fill most
of the width on a desktop, which is a real position rather than a default, and it
is the first thing worth arguing about once the display face exists, since the
right size depends entirely on the face.

---

## 7. Motion

**PROPOSAL.** Two durations and one easing curve, and that is the whole motion
system. Links and hover states move fast enough to feel responsive. Image
treatments move slowly. Nothing animates on scroll.

The reasoning is the second constraint in section 1. Scroll-triggered fade-ups
are now so common that they read as a template rather than as craft, and they
make a site feel slower than it is because content arrives after the scroll
rather than with it. A studio that makes film does not need the website to move.
The films move.

The one exception already in the code is worth keeping or killing on purpose:
project thumbnails sit in greyscale and come to colour on hover. It gives the
work index a reason to be touched and it keeps a wall of mismatched client
palettes calm until someone is actually looking at one entry.

`prefers-reduced-motion` is respected globally, which is not a design decision so
much as table stakes.

---

## 8. Image and video treatment

**OPEN, and the most underspecified part of this brief.** This is a studio that
makes film, so the way moving image sits on the page matters more than anything
in section 5, and it cannot be settled without real material to look at.

Questions for Michela:

1. Does the landing page open with moving image, or with type?
2. Autoplay silent loops, or a poster frame that waits to be clicked? Autoplay
   makes a stronger first impression and costs real load time, and on a slow
   connection it is the difference between a fast site and an average one.
3. Do case studies get an embedded player, a link out to the original post, or
   a self-hosted file? Hosting video on Cloudflare Pages is not a good idea at
   any real volume, so this probably means Vimeo, Mux, or Cloudflare Stream, and
   that is a cost decision as much as a design one.
4. Are stills treated, as in a consistent grade or crop, or shown as delivered?

**PROPOSAL** until she decides: stills keep a consistent aspect ratio on the
index so the rows stay level, and run full bleed inside a case study so the work
gets the room. Captions are set in the small monospace, which separates the
studio's voice from the client's material.

---

## 9. The rules that keep it from looking templated

These are the ones worth defending in review, because each one is a place where
the easy choice produces a site that looks like every other site.

1. **No three-across card grid.** Anywhere. Rows and lists instead.
2. **No icons next to the services.** Five numbered lines with a sentence each
   says more than five pictograms.
3. **No stock photography and no abstract gradients.** If there is no real image
   yet, the space stays empty and says so.
4. **Section labels stay small.** They are navigation, not headlines, which is
   why they sit in the margin in a monospace.
5. **Rules instead of boxes.** A hairline between sections, not a card with a
   shadow.
6. **Empty states are written, not hidden.** A missing case study is an honest
   sentence and an email link. See stovi publishing "Coming soon" rows for the
   version of this that does not work.
7. **One idea per screen.** If two sections are competing on a laptop screen,
   one of them is in the wrong place.
8. **Copy sets the layout, not the reverse.** Every measure on the site is set in
   characters rather than pixels, so line length stays readable instead of
   stretching to fill a container.

---

## 10. Open questions, collected

For Michela, in rough order of how much they block the rest.

1. Typefaces. One or two, and which. Section 3.
2. Palette. Light or mixed, warm or cool, one accent or two. Section 4.
3. Does the landing page open with film or with type? Section 8.
4. Where does video get hosted, and who pays for it? Section 8.
5. The wordmark: two parts as it stands, or custom lettering? Section 3.
6. Dark mode, yes or no. My proposal is no. Section 4.
7. What exactly to take from story.inc and the designer film, which are the two
   references I could not study. Section 2.

And three that are not design questions but are blocking real copy:

8. The partner's name, and how she wants to be described before December.
9. The inbox for the site. `hello@karu-studio.com` is a placeholder in
   `src/data/site.ts`.
10. The three process steps on the landing page are my reading of how the studio
    works, not hers. They are marked as a proposal in `src/data/services.ts` and
    should be replaced with the real thing.
