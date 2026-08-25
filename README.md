# Steve Marchetti - Personal Website

A static, vanilla HTML/CSS/JS site for Steve Marchetti (K-12 education leader, AI-in-education speaker and writer), with content management through [Decap CMS](https://decapcms.org/) (formerly Netlify CMS).

## File structure

```
/index.html            Home
/speaking.html          Speaking & Keynotes
/blog.html               Blog listing (auto-pulls posts)
/blog/post.html           Templated single-post page (reads ?slug=... from the URL)
/articles.html           Curated Articles / Resources
/books.html               Books & Publications
/contact.html             Contact / Booking form
/admin/index.html        Decap CMS admin panel
/admin/config.yml         Decap CMS configuration
/content/blog/*.md        Blog posts (managed via /admin, or edit by hand)
/content/articles/*.md    Curated articles (managed via /admin, or edit by hand)
/css/styles.css            All site styling
/js/main.js                 Nav, scroll reveal, carousel, form handling
/js/content.js               Reads /content markdown and renders cards/pages
/img/                          Empty (.gitkeep) - drop real photos and graphics in here
/favicon.svg                Lighthouse mark used as the site favicon
```

## Running it locally

This is a static site with no build step. The simplest way to preview it is a local server (opening `index.html` directly with `file://` will mostly work, but some browsers block `fetch` calls from `file://`, which the content-rendering script relies on):

```bash
cd marchetti-site-v1
python3 -m http.server 8000
# then open http://localhost:8000
```

## How content rendering works

`js/content.js` reads blog posts and curated articles and renders them into cards on the Home, Blog, Articles, and single-post pages.

- **Before you deploy to GitHub**, it renders from a small set of sample posts/articles built into `content.js` (`SAMPLE_POSTS` / `SAMPLE_ARTICLES`), matching what's in `/content`, so the site looks fully populated in local preview.
- **After you deploy**, flip it to live mode so real content published through `/admin` shows up automatically:
  1. Open `js/content.js`.
  2. Update the `CMS_CONFIG` object near the top:
     ```js
     const CMS_CONFIG = {
       owner: "your-github-username",
       repo: "marchetti-site-v1",
       branch: "main",
       useLiveData: true,
     };
     ```
  3. Save and redeploy. The browser will now fetch markdown files directly from `content/blog` and `content/articles` in your GitHub repo via the public GitHub API and render them - no code changes needed for future posts.

If the live fetch ever fails (rate limit, network issue, wrong repo name), the site quietly falls back to the sample content so it never shows a broken page.

## Adding content through /admin (no code required)

Once deployed and the CMS backend is configured (see below):

1. Go to `yoursite.com/admin`.
2. Log in with GitHub.
3. Choose **Blog Posts** or **Curated Articles**, click **New**, fill out the form, and click **Publish**.
4. Decap CMS commits a new markdown file to `content/blog/` or `content/articles/` in the repo. Once `useLiveData` is `true` (see above), it appears on the live site on next page load.

### Setting up the Decap CMS GitHub backend (required before /admin works)

The CMS is wired for backend type `github` (see `admin/config.yml`), but GitHub login will not work until you either:

- **Register a GitHub OAuth App** and run a small OAuth provider (Decap's own [`decap-cms-github-oauth-provider`](https://github.com/decaporg/decap-cms-github-oauth-provider) or a hosted equivalent), or
- **Use Decap's hosted auth** at `https://api.netlify.com` style login if deploying somewhere that supports it (e.g., Netlify's free auth even when the rest of the site is hosted on GitHub Pages).

Follow Decap's official guide for GitHub Pages + OAuth setup: https://decapcms.org/docs/github-backend/

Also update `admin/config.yml`:
```yaml
backend:
  name: github
  repo: your-github-username/marchetti-site-v1
  branch: main
```

## Swapping placeholder images

Every image slot on the site is a clearly labeled dashed placeholder box, e.g.:

```html
<div class="placeholder-box placeholder-box--portrait">
  Photo: Steve Marchetti - Headshot
  <small>img/headshot.jpg</small>
</div>
```

The `<small>` text is the filename the real image is expected to have. To swap in a real photo:

1. Drop the file into `/img/` using that exact filename (e.g. `img/headshot.jpg`).
2. Replace the `placeholder-box` `div` with an `<img>` tag pointing to it, e.g.:
   ```html
   <img src="img/headshot.jpg" alt="Steve Marchetti headshot" class="placeholder-box--portrait">
   ```
   (You can keep the same class name for sizing, or write your own.)

Blog post hero images and card images referenced in `/content/*.md` (`image:` front matter field) work the same way - set the field via `/admin` to a real path under `img/`.

## Forms (contact + newsletter)

Both forms currently point at placeholder endpoints:

- **Contact form** (`contact.html`): `action="https://formspree.io/f/YOUR_FORM_ID"`. Create a free form at [Formspree](https://formspree.io/) and swap in the real form ID.
- **Newsletter signup** (`index.html`): `action="https://YOUR-NEWSLETTER-PROVIDER.example/subscribe/YOUR_FORM_ID"`. Replace with your ConvertKit, Mailchimp, or other provider's form action URL.

`js/main.js` detects the placeholder URLs and shows a friendly "not connected yet" message instead of failing silently, so it's obvious in testing which forms still need real endpoints.

The Contact page also has a placeholder box for an embedded scheduling widget (e.g. Calendly) - replace it with the provider's embed snippet once you have one.

## Deployment via GitHub Pages

1. Create a new GitHub repository (e.g. `marchetti-site-v1`) and push this project to it:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/your-github-username/marchetti-site-v1.git
   git push -u origin main
   ```
2. In the repo, go to **Settings → Pages**, set the source to the `main` branch, root folder.
3. Update `admin/config.yml` and `js/content.js` (`CMS_CONFIG`) with your real `owner/repo` as described above.
4. Set up the Decap CMS GitHub OAuth backend so `/admin` can authenticate (see above) - this is a separate step from Pages hosting.
5. Push again. Your site will be live at `https://your-github-username.github.io/marchetti-site-v1/`.

## Branding notes

- **Logo**: inline SVG lighthouse mark, defined directly in each page's header/footer so it can be recolored via CSS without swapping image files.
- **Palette**: deep navy base (`#0a0e1a`) with an amber "lighthouse beam" accent (`#f2b544`) and a secondary violet accent (`#7c6cff`). Tokens are defined as CSS variables at the top of `css/styles.css` - change them there to retheme the whole site.
- **Fonts**: Space Grotesk (headings) + Inter (body), loaded from Google Fonts.
- **Social links**: Instagram and LinkedIn icons in the header/footer/contact page currently link to `#` - update with real profile URLs once available.
