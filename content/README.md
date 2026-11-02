# content

Everything the site publishes lives here as Markdown. No layout code to touch,
no component to edit. Add a file, push, and Cloudflare builds it.

Two folders:

- `work/` is case studies and projects
- `writing/` is blog posts and notes

Filenames become URLs. `work/northbound-launch.md` is served at
`/work/northbound-launch`. Use lowercase words joined by hyphens, no spaces, no
capitals, no dates in the filename.

## Publishing a project

1. Copy `work/example-seed-announcement.md` to a new file in `work/`
2. Rename it to the URL you want
3. Fill in the frontmatter, write the body in Markdown
4. Set `draft: false`
5. Commit and push to `main`

That is the whole flow. Cloudflare Pages rebuilds and the project is live in
about a minute.

## Frontmatter for `work/`

Frontmatter is the block at the top of the file between the two `---` lines. If
a required field is missing or has the wrong type, the build fails with a clear
message rather than publishing something broken.

| Field      | Type            | Required | What it does                                              |
| ---------- | --------------- | -------- | --------------------------------------------------------- |
| `title`    | text            | yes      | The case study headline. Specific beats clever.           |
| `client`   | text            | yes      | Company the work was for. Shown large on the index.       |
| `year`     | number          | yes      | Four digits. Sorts the index, newest first.               |
| `summary`  | text            | yes      | One or two sentences. Used on the index and link previews. |
| `services` | list of text    | no       | Scope tags. See the vocabulary below.                     |
| `cover`    | text            | no       | Path under `public/`, for example `/images/work/x.jpg`.   |
| `coverAlt` | text            | no       | Describes the image for anyone who cannot see it.          |
| `result`   | text            | no       | One number or outcome worth putting in a corner.          |
| `link`     | URL             | no       | Public link to the film or post.                          |
| `featured` | true or false   | no       | `true` pins it to the landing page. Defaults to false.    |
| `draft`    | true or false   | no       | `true` keeps it off the live site. Defaults to false.     |

Service vocabulary, so the studio stays consistent with itself: `video`,
`motion`, `design`, `social`, `writing`, `ghostwriting`. Any other string works
too, it just shows up exactly as typed.

## Frontmatter for `writing/`

| Field         | Type          | Required | What it does                                        |
| ------------- | ------------- | -------- | --------------------------------------------------- |
| `title`       | text          | yes      | The headline.                                       |
| `description` | text          | yes      | One or two sentences, shown under the title.        |
| `publishedAt` | date          | yes      | `YYYY-MM-DD`. Sorts the index, newest first.        |
| `author`      | text          | no       | Defaults to `karu studio`.                          |
| `tags`        | list of text  | no       | Free text. Shown at the bottom of the piece.        |
| `canonical`   | URL           | no       | Set it if the piece ran somewhere else first.       |
| `draft`       | true or false | no       | `true` keeps it off the live site.                  |

## Drafts

`draft: true` hides an entry from the built site but keeps it visible on the
local dev server. That means you can see exactly how a piece will look before
anyone else can read it.

## Images

Put image files in `public/images/work/` and reference them from the root, for
example `/images/work/northbound-cover.jpg`. Export at roughly 2000px on the
long edge and keep each file under about 400KB.

## Voice rules that apply to every file in here

- No em dashes. Use a comma, a full stop, or a pair of brackets.
- No semicolons. Two sentences are fine.
- No "elevate", no "seamless", no three adjectives in a row.
- When you refer to someone else's work, say it in your own words.
