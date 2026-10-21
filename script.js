// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Mobile navigation ----------
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");

navToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- Dark / light theme toggle (remembered in localStorage) ----------
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const dark = theme === "dark";
  themeToggle.textContent = dark ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---------- Typing effect ----------
const roles = ["Web Developer", "Designer", "Problem Solver", "Lifelong Learner"];
const typedEl = document.getElementById("typed-text");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let roleIndex = 0, charIndex = 0, deleting = false;

function type() {
  const word = roles[roleIndex];
  charIndex += deleting ? -1 : 1;
  typedEl.textContent = word.slice(0, charIndex);

  let delay = deleting ? 50 : 100;
  if (!deleting && charIndex === word.length) { deleting = true; delay = 1400; }
  else if (deleting && charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; delay = 400; }
  setTimeout(type, delay);
}
if (reduceMotion) { typedEl.textContent = roles[0]; } else { type(); }

// ---------- Animate skill bars when visible ----------
const bars = document.querySelectorAll(".bar-fill");
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.level + "%";
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
bars.forEach((bar) => barObserver.observe(bar));

// ---------- Project filter ----------
const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".card");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");

    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      card.classList.toggle("hide", filter !== "all" && card.dataset.category !== filter);
    });
  });
});

// ---------- Highlight current nav link while scrolling ----------
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav a");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
sections.forEach((s) => sectionObserver.observe(s));

// ---------- Contact form validation ----------
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

function setError(input, message) {
  document.getElementById(input.id + "-error").textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  statusEl.textContent = "";

  const name = form.elements["name"];
  const email = form.elements["email"];
  const message = form.elements["message"];
  let valid = true;

  setError(name, "");
  setError(email, "");
  setError(message, "");

  if (name.value.trim().length < 2) { setError(name, "Please enter your name."); valid = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError(email, "Please enter a valid email address."); valid = false; }
  if (message.value.trim().length < 10) { setError(message, "Message should be at least 10 characters."); valid = false; }

  if (valid) {
    statusEl.textContent = "Thanks, " + name.value.trim() + "! Your message was sent (demo).";
    form.reset();
  }
});

// =====================================================
// Dynamic effects, hover effects and mouse trail
// =====================================================
(function () {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const animate = !reduceMotion;

  // ---------- Scroll progress bar + header shadow ----------
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);
  const header = document.querySelector(".site-header");

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    header.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Click ripple on buttons ----------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn, .filter-btn");
    if (!btn || !animate) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });

  // ---------- Scroll reveal (fade + slide up, staggered) ----------
  if (animate) {
    const groups = [
      ".hero-text > *", ".section h2", ".about-grid p", ".stats li", ".skills li",
      ".filters", ".card", ".contact-wrap > p", "#contact-form .field"
    ];
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("visible");
        revealObserver.unobserve(el);
        const delay = parseFloat(el.style.getPropertyValue("--d")) || 0;
        // hand the element back to its normal styles once the animation is done
        setTimeout(() => el.classList.remove("reveal", "visible"), (0.8 + delay) * 1000 + 100);
      });
    }, { threshold: 0.15 });

    groups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        el.classList.add("reveal");
        el.style.setProperty("--d", (Math.min(i, 5) * 0.1).toFixed(1) + "s");
        revealObserver.observe(el);
      });
    });
  }

  // ---------- Animated number counters ----------
  document.querySelectorAll(".stats strong").forEach((el) => {
    const m = el.textContent.trim().match(/^(\d+)(.*)$/);
    if (!m || !animate) return;
    const target = parseInt(m[1], 10);
    const suffix = m[2];
    el.textContent = "0" + suffix;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const duration = 1500;
      (function step(now) {
        const t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
        if (t < 1) requestAnimationFrame(step);
      })(start);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  // ---------- Hero: floating blobs + mouse parallax ----------
  const hero = document.querySelector(".hero");
  const heroFigure = document.querySelector(".hero-figure");
  const blobs = ["b1", "b2", "b3"].map((cls) => {
    const blob = document.createElement("div");
    blob.className = "blob " + cls;
    blob.setAttribute("aria-hidden", "true");
    hero.prepend(blob);
    return blob;
  });

  if (animate && fine) {
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      blobs.forEach((blob, i) => {
        const depth = (i + 1) * 30;
        blob.style.translate = x * depth + "px " + y * depth + "px";
      });
      heroFigure.style.translate = x * -16 + "px " + y * -16 + "px";
    });
    hero.addEventListener("mouseleave", () => {
      blobs.forEach((blob) => { blob.style.translate = ""; });
      heroFigure.style.translate = "";
    });

    // ---------- 3D tilt + glare on project cards ----------
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
        card.style.transform =
          "perspective(800px) rotateX(" + (0.5 - y) * 10 + "deg) rotateY(" + (x - 0.5) * 10 + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });

    // ---------- Mouse trail (particles) + custom cursor ----------
    const canvas = document.createElement("canvas");
    canvas.id = "trail-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const particles = [];
    let running = false;

    function spawn(x, y, burst) {
      const count = burst ? 14 : 2;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = burst ? Math.random() * 4 + 1.5 : Math.random() * 0.8;
        particles.push({
          x: x, y: y,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          r: Math.random() * 4 + 2,
          life: 1, decay: Math.random() * 0.02 + 0.02,
          hue: 200 + Math.random() * 100
        });
      }
      if (particles.length > 300) particles.splice(0, particles.length - 300);
      if (!running) { running = true; requestAnimationFrame(draw); }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + p.hue + ",85%,60%," + p.life * 0.8 + ")";
        ctx.fill();
      }
      if (particles.length) { requestAnimationFrame(draw); }
      else { running = false; ctx.clearRect(0, 0, W, H); }
    }

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    dot.setAttribute("aria-hidden", "true");
    ring.setAttribute("aria-hidden", "true");
    document.body.append(dot, ring);

    let mx = 0, my = 0, rx = 0, ry = 0, seen = false;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; rx = mx; ry = my; }
      dot.style.opacity = ring.style.opacity = 1;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      spawn(mx, my, false);
    });
    window.addEventListener("click", (e) => spawn(e.clientX, e.clientY, true));
    document.documentElement.addEventListener("mouseleave", () => {
      dot.style.opacity = ring.style.opacity = 0;
    });
    document.addEventListener("mouseover", (e) => {
      ring.classList.toggle("hover", Boolean(e.target.closest("a, button, input, textarea, .card, .stats li")));
    });

    (function follow() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(follow);
    })();
  }
})();
