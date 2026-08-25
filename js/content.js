/* =============================================================
   content.js
   Reads blog posts + curated articles that Decap CMS writes to
   /content/blog/*.md and /content/articles/*.md, and renders them
   into cards across the site. No build step required.

   HOW THIS WORKS
   - Decap CMS (the /admin panel) commits markdown files with YAML
     front matter straight to this GitHub repo.
   - Because this is a plain static site (no framework, no build
     step), the browser fetches those markdown files directly from
     GitHub at page-load time using the public GitHub API, parses
     the front matter, and renders cards/pages from it.
   - Until the site is pushed to a real GitHub repo, CMS_CONFIG.useLiveData
     stays false and the site renders the sample posts/articles below
     so the layout looks right in local preview.

   TO GO LIVE
   1. Push this project to GitHub (see README.md).
   2. Update CMS_CONFIG.owner / CMS_CONFIG.repo below to match.
   3. Set CMS_CONFIG.useLiveData = true.
   That's it - new posts published through /admin will appear on the
   site automatically, no code changes needed.
   ============================================================= */

const CMS_CONFIG = {
  owner: "YOUR_GITHUB_USERNAME",
  repo: "marchetti-site-v1",
  branch: "main",
  useLiveData: false,
};

/* ---------- Sample / fallback content ----------
   Mirrors the markdown files in /content/blog and /content/articles
   so the site is fully populated in local preview and before the
   first live deploy. Once useLiveData is true, this is only used
   as a fallback if the GitHub API request fails. */
const SAMPLE_POSTS = [
  {
    slug: "why-ai-literacy-belongs-in-every-classroom",
    title: "Why AI Literacy Belongs in Every Classroom, Not Just the Computer Lab",
    date: "2026-08-18",
    tags: ["AI in Education", "Curriculum"],
    image: "img/blog-ai-literacy.jpg",
    excerpt:
      "AI literacy is quickly becoming as foundational as reading and math. Here is why every teacher, not just the tech department, needs to own it.",
    body:
      "AI literacy is quickly becoming as foundational as reading and math, yet most districts still treat it like an elective bolted onto the computer lab.\n\n## The problem with siloed AI instruction\n\nWhen only one teacher in a building understands generative AI, students get an inconsistent, disconnected picture of the tools that are already shaping their world outside of school.\n\n## What a literate classroom actually looks like\n\n- Teachers model responsible use openly, instead of banning tools and hoping students comply\n- Students learn to question AI output the same way they learn to question a source\n- Assessment design assumes AI exists, rather than pretending it does not\n\n> The goal is not to make every teacher a computer science teacher. The goal is to make every teacher comfortable enough to have an honest conversation about the tools students already carry in their pockets.\n\nThat shift starts with permission from leadership, and it starts with modeling from the front of the room.",
  },
  {
    slug: "keynote-recap-state-education-summit",
    title: "Keynote Recap: What 900 Educators Asked Me About AI This Month",
    date: "2026-08-05",
    tags: ["Speaking", "Reflections"],
    image: "img/blog-keynote-recap.jpg",
    excerpt:
      "A recap of the most common questions from a recent state education summit keynote, and the honest answers I gave.",
    body:
      "I spent three days last week talking with nearly 900 educators about AI in the classroom, and the same handful of questions kept surfacing.\n\n## \"Are we moving too fast?\"\n\nMy honest answer: the technology is moving fast. Our pedagogy does not have to sprint to keep up, it just has to stay in the conversation.\n\n## \"What about academic integrity?\"\n\nThis is less an AI problem and more a mirror held up to assessment design that was already fragile before generative tools existed.\n\n## \"Where do we even start?\"\n\nStart small. Pick one unit, one assignment, one honest conversation with students about expectations. Momentum builds from there.",
  },
  {
    slug: "building-a-district-ai-policy-that-doesnt-collect-dust",
    title: "Building a District AI Policy That Does Not Just Collect Dust",
    date: "2026-07-22",
    tags: ["Leadership", "Policy"],
    image: "img/blog-policy.jpg",
    excerpt:
      "Most AI policies are written once and never touched again. Here is a framework for one that actually evolves with the technology.",
    body:
      "Most district AI policies are written once, approved by the board, and never revisited, even as the underlying technology changes every few months.\n\n## Treat it like a living document\n\nBuild a quarterly review into the policy itself. Name who owns the review. Put it on the calendar before the ink is dry.\n\n## Involve the people who will actually use it\n\nTeachers and students should shape the policy, not just receive it. Their real classroom questions surface gaps that a committee alone will miss.\n\n## Keep it short enough to be read\n\nIf your AI policy is longer than your acceptable use policy, nobody is reading it. Clarity beats comprehensiveness.",
  },
];

const SAMPLE_ARTICLES = [
  {
    slug: "article-generative-ai-writing-instruction",
    title: "What Generative AI Means for the Future of Writing Instruction",
    source: "EdTech Quarterly",
    url: "#",
    date: "2026-08-15",
    commentary:
      "A clear-eyed look at how writing pedagogy needs to adapt, not disappear. Worth sharing with your ELA department.",
  },
  {
    slug: "article-ai-equity-gap",
    title: "The AI Equity Gap Nobody Is Talking About",
    source: "Digital Learning Review",
    url: "#",
    date: "2026-08-09",
    commentary:
      "An important reminder that access to AI tools is not evenly distributed across districts. This should inform every procurement conversation.",
  },
  {
    slug: "article-teacher-workload-ai-tools",
    title: "Can AI Actually Reduce Teacher Workload, or Does It Just Shift It?",
    source: "The Learning Curve",
    url: "#",
    date: "2026-07-30",
    commentary:
      "A more honest take than most of the hype pieces out there. I do not agree with every conclusion, but the framing is useful.",
  },
];

/* ---------- Tiny front-matter parser ---------- */
function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const [, fm, body] = match;
  const data = {};
  fm.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) return;
    let [, key, value] = m;
    value = value.trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      data[key] = value.replace(/^["']|["']$/g, "");
    }
  });
  return { data, body: body.trim() };
}

/* ---------- Minimal markdown -> HTML ---------- */
function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  let html = "";
  let inList = false;
  const inline = (t) =>
    t
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  lines.forEach((line) => {
    if (/^\s*$/.test(line)) {
      if (inList) { html += "</ul>"; inList = false; }
      return;
    }
    if (/^## /.test(line)) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2>${inline(line.replace(/^## /, ""))}</h2>`;
    } else if (/^### /.test(line)) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h3>${inline(line.replace(/^### /, ""))}</h3>`;
    } else if (/^> /.test(line)) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<blockquote>${inline(line.replace(/^> /, ""))}</blockquote>`;
    } else if (/^-\s+/.test(line)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inline(line.replace(/^-\s+/, ""))}</li>`;
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<p>${inline(line)}</p>`;
    }
  });
  if (inList) html += "</ul>";
  return html;
}

/* ---------- GitHub fetch helpers ---------- */
async function fetchGithubDirFiles(path) {
  const url = `https://api.github.com/repos/${CMS_CONFIG.owner}/${CMS_CONFIG.repo}/contents/${path}?ref=${CMS_CONFIG.branch}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub API error for ${path}`);
  const listing = await res.json();
  const files = listing.filter((f) => f.name.endsWith(".md"));
  return Promise.all(
    files.map(async (f) => {
      const raw = await (await fetch(f.download_url)).text();
      const { data, body } = parseFrontMatter(raw);
      return { ...data, slug: data.slug || f.name.replace(/\.md$/, ""), body };
    })
  );
}

async function loadCollection(path, sample, cacheKey) {
  if (!CMS_CONFIG.useLiveData) return sample;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    const items = await fetchGithubDirFiles(path);
    sessionStorage.setItem(cacheKey, JSON.stringify(items));
    return items;
  } catch (err) {
    console.warn(`Falling back to sample data for ${path}:`, err);
    return sample;
  }
}

async function getPosts() {
  const posts = await loadCollection("content/blog", SAMPLE_POSTS, "cms_posts");
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function getArticles() {
  const articles = await loadCollection("content/articles", SAMPLE_ARTICLES, "cms_articles");
  return [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* ---------- Rendering ---------- */
function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function postCardHTML(post) {
  const tags = Array.isArray(post.tags) ? post.tags : [post.tags].filter(Boolean);
  return `
    <article class="card reveal" data-tags="${tags.join("|")}">
      <div class="placeholder-box placeholder-box--card">
        Photo: ${escapeHtml(post.title)}
        <small>${escapeHtml(post.image || "img/blog-placeholder.jpg")}</small>
      </div>
      <div class="card-body">
        ${tags[0] ? `<span class="card-tag">${escapeHtml(tags[0])}</span>` : ""}
        <div class="card-date">${formatDate(post.date)}</div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt || "")}</p>
        <a class="card-link" href="blog/post.html?slug=${encodeURIComponent(post.slug)}">
          Read the post
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </article>`;
}

function articleRowHTML(article) {
  return `
    <a class="article-row reveal" href="${escapeAttr(article.url || "#")}" target="_blank" rel="noopener">
      <div class="article-row-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
      </div>
      <div>
        <div class="article-row-source">${escapeHtml(article.source || "")}</div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.commentary || "")}</p>
      </div>
      <div class="article-row-date">${formatDate(article.date)}</div>
    </a>`;
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

/* ---------- Page wiring ---------- */
async function renderLatestPosts() {
  const el = document.getElementById("latest-posts");
  if (!el) return;
  const posts = (await getPosts()).slice(0, 3);
  el.innerHTML = posts.map(postCardHTML).join("");
  observeReveals(el);
}

async function renderLatestArticles() {
  const el = document.getElementById("latest-articles");
  if (!el) return;
  const articles = (await getArticles()).slice(0, 3);
  el.innerHTML = articles.map((a) => `
    <div class="card reveal">
      <div class="card-body">
        <span class="card-tag">${escapeHtml(a.source || "")}</span>
        <div class="card-date">${formatDate(a.date)}</div>
        <h3>${escapeHtml(a.title)}</h3>
        <p>${escapeHtml(a.commentary || "")}</p>
        <a class="card-link" href="${escapeAttr(a.url || "#")}" target="_blank" rel="noopener">
          Read the source
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </div>`).join("");
  observeReveals(el);
}

async function renderBlogGrid() {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;
  const posts = await getPosts();
  const filterRow = document.getElementById("blog-filters");

  const renderCards = (list) => {
    grid.innerHTML = list.length
      ? list.map(postCardHTML).join("")
      : `<div class="empty-state">No posts match that tag yet.</div>`;
    observeReveals(grid);
  };

  if (filterRow) {
    const tags = Array.from(new Set(posts.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [p.tags])).filter(Boolean)));
    filterRow.innerHTML = [`<button class="filter-pill is-active" data-tag="all">All Posts</button>`]
      .concat(tags.map((t) => `<button class="filter-pill" data-tag="${escapeAttr(t)}">${escapeHtml(t)}</button>`))
      .join("");
    filterRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      filterRow.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const tag = btn.dataset.tag;
      renderCards(tag === "all" ? posts : posts.filter((p) => (Array.isArray(p.tags) ? p.tags : [p.tags]).includes(tag)));
    });
  }
  renderCards(posts);
}

async function renderArticlesList() {
  const el = document.getElementById("articles-list");
  if (!el) return;
  const articles = await getArticles();
  el.innerHTML = articles.length
    ? articles.map(articleRowHTML).join("")
    : `<div class="empty-state">No curated articles yet. Check back soon.</div>`;
  observeReveals(el);
}

async function renderSinglePost() {
  const el = document.getElementById("post-content");
  if (!el) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === slug) || posts[0];

  if (!post) {
    el.innerHTML = `<div class="empty-state">Post not found.</div>`;
    return;
  }

  document.title = `${post.title} - Steve Marchetti`;
  const tags = Array.isArray(post.tags) ? post.tags : [post.tags].filter(Boolean);

  el.innerHTML = `
    <div class="container post-hero reveal">
      <div class="breadcrumb"><a href="../blog.html">Blog</a> <span>/</span> <span>${escapeHtml(post.title)}</span></div>
      <div class="post-meta">
        ${tags.map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`).join("")}
        <span class="card-date">${formatDate(post.date)}</span>
      </div>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="placeholder-box placeholder-box--wide" style="margin-top:28px;">
        Photo: ${escapeHtml(post.title)}
        <small>${escapeHtml(post.image || "img/blog-placeholder.jpg")}</small>
      </div>
    </div>
    <div class="container">
      <div class="post-body">${mdToHtml(post.body || "")}</div>
      <div class="share-row">
        <span>Share this post</span>
        <a class="social-icon" href="https://www.linkedin.com/sharing/share-offsite/?url=" target="_blank" rel="noopener" aria-label="Share on LinkedIn">${iconLinkedIn()}</a>
        <a class="social-icon" href="#" aria-label="Share on Instagram">${iconInstagram()}</a>
      </div>
    </div>`;
  observeReveals(el);
}

function iconLinkedIn() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.15 1.46-2.15 2.96V21h-4V9z"/></svg>`;
}
function iconInstagram() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>`;
}

function observeReveals(scope) {
  const items = scope.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  renderLatestPosts();
  renderLatestArticles();
  renderBlogGrid();
  renderArticlesList();
  renderSinglePost();
});
