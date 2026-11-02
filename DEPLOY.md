# Deploying karu studio

Three things need Michela's own accounts and cannot be done from inside this
repo: pushing to GitHub, connecting that repository in Cloudflare, and pointing
karu-studio.com at it. Everything else is already configured.

Set aside about twenty minutes for part one and part two together. The DNS
change in part two can take a few hours to finish spreading, and that wait is
normal.

Cloudflare renames things in its dashboard every few months. If a label below
does not match exactly, look for the nearest equivalent. The order of the steps
does not change.

---

## What is already in the repo

Nothing in this list needs to be typed into Cloudflare, it is read from the
code.

| Thing            | Value           | Where it lives     |
| ---------------- | --------------- | ------------------ |
| Build command    | `npm run build` | `package.json`     |
| Output directory | `dist`          | Astro default      |
| Node version     | `22`            | `.nvmrc`           |
| Headers          | caching plus security | `public/_headers`  |
| Redirects        | old paths to new | `public/_redirects` |

Cloudflare reads `.nvmrc` on its own, so there is no need to set a
`NODE_VERSION` variable. If a build ever fails complaining about the Node
version, that is the fallback: add an environment variable named `NODE_VERSION`
with the value `22`.

---

## Part one, connect the repository

### Before you start

The repository is [github.com/michelakeller/karu-studio](https://github.com/michelakeller/karu-studio).
Cloudflare Pages builds from GitHub or GitLab, not from a Cursor repository, so
that is the one Cloudflare needs to see.

Check that `main` on GitHub actually has the site on it before you start. As of
writing, the repository exists and is empty. The agent that built the site could
not push to it, because there are no GitHub credentials on its machine, and
connecting GitHub to Cloudflare does not give the agent any either. Those are
two separate grants.

The site lives on the branch `cursor/karu-studio-site-1c60` in the Cursor
repository. From a working copy of that branch, on a machine already logged in
to your GitHub account, the push is two commands:

```bash
git remote add github https://github.com/michelakeller/karu-studio.git
git push github cursor/karu-studio-site-1c60:main
```

That puts the work on `main`, which is the branch Cloudflare Pages expects by
default. If `main` is still empty, Cloudflare will connect fine and then build
nothing.

### Steps

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and log in. If you
   do not have an account, make one, it is free for this.
2. In the left sidebar, click **Workers & Pages**. On some accounts this reads
   **Compute** and then **Workers & Pages**.
3. Click **Create**, then open the **Pages** tab, then click
   **Connect to Git**.
4. Click **Connect GitHub**. GitHub opens and asks you to install the Cloudflare
   Pages app.
5. Choose **Only select repositories**, pick `michelakeller/karu-studio`, and
   click **Install and Authorize**. Giving it access to one repository rather
   than all of them is the right call.
6. Back in Cloudflare, `michelakeller/karu-studio` now appears in the list.
   Select it and click **Begin setup**.
7. Fill in the build settings:
   - **Project name**: `karu-studio`. This also becomes the preview URL at
     `karu-studio.pages.dev`, so it is worth getting right.
   - **Production branch**: `main`
   - **Framework preset**: choose **Astro**. If it is not offered, leave it as
     None, the next two fields are what actually matter.
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: leave empty
   - **Environment variables**: none needed
8. Click **Save and Deploy**. The first build takes two or three minutes, mostly
   installing dependencies.
9. When it finishes, click the `karu-studio.pages.dev` link and check the site.
   This is the real site, just on a Cloudflare address.

If the build fails, open the failed deployment and read the log from the bottom.
The two usual causes are a missing `package-lock.json` in the repository and a
typo in the output directory.

### What you get from now on

- Every push to `main` builds and goes live, with no further clicks
- Every push to any other branch gets its own preview URL, which is a good way
  to look at a redesign before it is public
- Every deployment can be rolled back from the Deployments tab, so a bad push is
  a thirty second fix rather than a problem

---

## Part two, point karu-studio.com at it

There are two routes. Route A is better in every way that matters and is the one
to take unless there is a reason not to.

### Route A, move the domain's DNS to Cloudflare, recommended

This hands Cloudflare control of the domain's DNS records. The domain stays
registered where it is now, you are not transferring ownership. Cloudflare then
wires up the apex and the www records itself, which is the part that is
genuinely fiddly to do by hand.

#### Add the domain to Cloudflare

1. In the Cloudflare dashboard, click **Add a domain** at the top, or
   **Websites** then **Add a site**.
2. Type `karu-studio.com` and continue.
3. Pick the **Free** plan.
4. Cloudflare scans the existing DNS records and shows you what it found.
   Look down that list before continuing. If there are `MX` records, those are
   your email and they must survive the move. Cloudflare usually copies them
   across on its own, and it is still worth a screenshot of this screen before
   you click away.
5. Continue. Cloudflare shows you **two nameservers**, something like
   `aria.ns.cloudflare.com` and `rick.ns.cloudflare.com`. The exact pair is
   unique to your account. Copy both.

#### Change the nameservers at the registrar

This is the step that happens outside Cloudflare, wherever karu-studio.com was
bought.

6. Log in to the registrar.
7. Find the domain and open its DNS or nameserver settings. The link is usually
   called **Nameservers**, **DNS settings**, or **Manage DNS**.
8. Switch from the registrar's default or custom nameservers to **custom
   nameservers**.
9. Delete what is there and paste in the two Cloudflare nameservers, one per
   field. Save.

Registrar-specific names for the same screen:

| Registrar       | Where to look                                                        |
| --------------- | -------------------------------------------------------------------- |
| GoDaddy         | My Products, then DNS next to the domain, then Nameservers, then Change |
| Namecheap       | Domain List, Manage, then Nameservers, choose Custom DNS              |
| Google Domains  | Moved to Squarespace Domains, look under DNS, then Nameservers        |
| Squarespace     | Domains, the domain, then DNS, then Nameservers                       |
| Hover           | the domain, then Nameservers, then Edit                               |
| Infomaniak      | Domains, the domain, then DNS servers                                 |
| IONOS           | Domains and SSL, the domain, then Adjust nameservers                  |

10. Back in Cloudflare, click **Continue** or **Check nameservers now**. It
    usually confirms within an hour. It can take up to a day. Cloudflare emails
    you when the domain is active, so there is no need to sit and watch it.

#### Attach the domain to the Pages project

Do this once Cloudflare says the domain is active.

11. Go to **Workers & Pages**, open the `karu-studio` project, and click the
    **Custom domains** tab.
12. Click **Set up a custom domain**, type `karu-studio.com`, and continue.
    Cloudflare tells you it will add the record for you. Accept.
13. Repeat for `www.karu-studio.com`.
14. Wait for both to show **Active**. The certificate is issued automatically
    and takes a few minutes. A browser error about HTTPS during this window is
    expected and goes away on its own.

#### Send www to the apex

With both domains attached, the site answers on both names, which is untidy for
search engines. One redirect fixes it.

15. In the Cloudflare dashboard, open **karu-studio.com** under **Websites**.
16. Go to **Rules**, then **Redirect Rules**, then **Create rule**.
17. Name it `www to apex`.
18. Under **If incoming requests match**, choose **Custom filter expression**,
    then set field **Hostname**, operator **equals**, value
    `www.karu-studio.com`.
19. Under **Then**, choose **Dynamic** redirect, and set the expression to
    `concat("https://karu-studio.com", http.request.uri.path)`.
20. Set status code **301** and tick **Preserve query string**.
21. Deploy.

If the dynamic expression is awkward, a static redirect to
`https://karu-studio.com` also works. It just loses the path, so a visitor to
`www.karu-studio.com/work` lands on the homepage rather than the work page.

### Route B, leave DNS where it is

Only worth doing if the DNS has to stay at the current provider, for example
because someone else manages the email.

1. In the Pages project, **Custom domains**, **Set up a custom domain**, enter
   `karu-studio.com`. Cloudflare shows you the record it wants and verification
   stays pending until you add it.
2. At the DNS provider, add these records:

| Type  | Name  | Value                     | Notes                          |
| ----- | ----- | ------------------------- | ------------------------------ |
| CNAME | `www` | `karu-studio.pages.dev`   | Works everywhere               |
| CNAME | `@`   | `karu-studio.pages.dev`   | Needs CNAME flattening support |

3. The apex record is the catch. A plain `CNAME` on the root of a domain is not
   allowed by the DNS standard, so it only works if the provider offers
   flattening, often labelled `ALIAS`, `ANAME`, or `CNAME flattening`.
   Cloudflare, DNSimple, and Route 53 support it. Many registrars do not.
4. If the provider does not support it, the honest options are to put the site
   on `www.karu-studio.com` and redirect the apex using whatever forwarding the
   registrar offers, or to go back to Route A. Route A is less work than it
   looks.

---

## Checking it worked

Once both custom domains are active, open each of these in a browser:

- `https://karu-studio.com`
- `https://www.karu-studio.com`, which should land on the apex
- `http://karu-studio.com`, which should upgrade itself to HTTPS
- `https://karu-studio.com/work`
- `https://karu-studio.com/this-page-does-not-exist`, which should show the 404
  page and not a Cloudflare error
- `https://karu-studio.com/sitemap.xml`
- `https://karu-studio.com/rss.xml`

Then push a small change to `main` and watch the Deployments tab. If the build
runs and the change appears, the whole pipeline is working.

## When something goes wrong later

- **A push did not go live.** Deployments tab, open the newest build, read the
  log from the bottom.
- **The site is live but a new project is missing.** Check that the Markdown file
  has `draft: false` and that it was actually committed.
- **The whole site looks broken after a change.** Deployments tab, find the last
  good deployment, and use **Rollback**. Then fix it properly.
- **HTTPS warnings on a brand new domain.** Give it an hour. The certificate is
  still being issued.
