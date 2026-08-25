/* =============================================================
   main.js - site-wide interactions
   Nav toggle, scroll reveal, testimonial carousel, form handling.
   ============================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReveal();
  initCarousel();
  initForms();
  initFooterYear();
  initActiveNavLink();
});

/* ---------- Mobile nav ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("is-open"))
  );
}

/* ---------- Highlight current page in nav ---------- */
function initActiveNavLink() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("is-active");
    }
  });
}

/* ---------- Scroll reveal for elements already in the DOM ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
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

/* ---------- Testimonial carousel (speaking page) ---------- */
function initCarousel() {
  const track = document.querySelector(".testimonial-track");
  const controls = document.querySelector(".carousel-controls");
  if (!track || !controls) return;

  const slides = track.querySelectorAll(".testimonial-slide");
  const dots = controls.querySelectorAll(".carousel-dot");
  let index = 0;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
  }

  let auto = setInterval(() => goTo(index + 1), 6000);
  function stopAuto() {
    clearInterval(auto);
  }

  dots.forEach((dot, i) => dot.addEventListener("click", () => { goTo(i); stopAuto(); }));

  controls.addEventListener("mouseenter", stopAuto);
  track.addEventListener("mouseenter", stopAuto);
  controls.addEventListener("touchstart", stopAuto, { passive: true });
  track.addEventListener("touchstart", stopAuto, { passive: true });
}

/* ---------- Forms: newsletter + contact ----------
   These post to placeholder endpoints. Swap the action URLs with
   real ones (Formspree, ConvertKit, Mailchimp, etc.) when ready -
   see README.md for exactly what to change. */
function initForms() {
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => handleFormSubmit(e, contactForm, "contact-status"));
  }

  const newsletterForms = document.querySelectorAll(".newsletter-form");
  newsletterForms.forEach((form) => {
    form.addEventListener("submit", (e) => handleFormSubmit(e, form, null));
  });
}

async function handleFormSubmit(e, form, statusId) {
  e.preventDefault();
  const action = form.getAttribute("action") || "";
  const statusEl = statusId ? document.getElementById(statusId) : null;
  const isPlaceholder = action.includes("YOUR_FORM_ID") || !action;

  if (isPlaceholder) {
    showStatus(statusEl, "This form is not connected yet. Add a Formspree (or similar) endpoint in the HTML to go live.", "error");
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.setAttribute("disabled", "true");

  try {
    const res = await fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      showStatus(statusEl, "Thanks - your message is on its way.", "success");
      form.reset();
    } else {
      showStatus(statusEl, "Something went wrong. Please try again or email directly.", "error");
    }
  } catch (err) {
    showStatus(statusEl, "Something went wrong. Please try again or email directly.", "error");
  } finally {
    if (submitBtn) submitBtn.removeAttribute("disabled");
  }
}

function showStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = `form-status ${type}`;
}

/* ---------- Footer year ---------- */
function initFooterYear() {
  const el = document.getElementById("footer-year");
  if (el) el.textContent = new Date().getFullYear();
}
