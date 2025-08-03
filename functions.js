document.addEventListener("DOMContentLoaded", () => {
  const DEBUG_CAROUSEL = false; // set false to disable

  function setupCarousel(carouselId, dotContainerId, cardSelector) {
    const carousel = document.getElementById(carouselId);
    const dotContainer = document.getElementById(dotContainerId);
    const cards = carousel.querySelectorAll(cardSelector);
    if (!carousel || !dotContainer || !cards.length) return;

    // ─── lightweight debug util ───
    const dbg = DEBUG_CAROUSEL
      ? (() => {
          const probes = [];
          let lastCard = null;

          function dot(x, y, color = "crimson") {
            const d = document.createElement("div");
            d.className = "debug-probe";
            d.style.left = `${x - 4}px`;
            d.style.top = `${y - 4}px`;
            d.style.background = color;
            document.body.appendChild(d);
            probes.push(d);
          }
          function clear() {
            for (const p of probes) p.remove();
            probes.length = 0;
            if (lastCard) {
              lastCard.classList.remove("debug-card");
              lastCard = null;
            }
          }
          function highlight(card) {
            if (lastCard) lastCard.classList.remove("debug-card");
            lastCard = card;
            card.classList.add("debug-card");
          }
          function log(label, extra = {}) {
            console.table({
              label,
              perPg,
              pages,
              pageW,
              scrollLeft: Math.round(carousel.scrollLeft),
              clientW: carousel.clientWidth,
              scrollW: carousel.scrollWidth,
              ...extra,
            });
          }
          return { dot, clear, highlight, log };
        })()
      : null;

    // Force predictable scroll math (even on RTL pages)
    carousel.style.direction = "ltr";
    dotContainer.style.direction = "ltr";

    // --- metrics ---
    const compute = () => {
      const cs = getComputedStyle(carousel);
      const gap = parseFloat(cs.columnGap || cs.gap) || 0;
      const cardW = cards[0].getBoundingClientRect().width || 1;
      const perPg = Math.max(
        1,
        Math.round((carousel.clientWidth + gap) / (cardW + gap))
      );

      const pages = Math.ceil(cards.length / perPg);
      return { gap, cardW, perPg, pageW, pages };
    };

    // NEW: keep latest layout numbers in locals
    let perPg, pageW, pages;
    const refresh = () => ({ perPg, pageW, pages } = compute());

    // --- dots ---
    function buildDots() {
      refresh();
      dotContainer.innerHTML = "";

      const arr = [];
      const max = Math.max(0, carousel.scrollWidth - carousel.clientWidth);

      for (let i = 0; i < pages; i++) {
        const d = document.createElement("span");
        d.className = "dot";
        d.addEventListener("click", () => {
          if (pages <= 1) return;
          const target = Math.round((i / (pages - 1)) * max);
          carousel.scrollTo({ left: target, behavior: "smooth" });
        });
        dotContainer.appendChild(d);
        arr.push(d);
      }
      return arr;
    }

    let dots = buildDots();

    let stopTimer;
    carousel.addEventListener(
      "scroll",
      () => {
        clearTimeout(stopTimer);
        stopTimer = setTimeout(() => {
          if (DEBUG_CAROUSEL)
            console.log("%c scroll end ", "background:#222;color:#0ff");
          setActive();
        }, 120);
      },
      { passive: true }
    );

    function setActive() {
      // keep pages in sync if layout changed
      refresh();

      const max = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
      const sl = Math.max(0, carousel.scrollLeft);
      const ratio = max > 0 ? sl / max : 0; // avoid divide-by-zero
      const idx = Math.min(
        pages - 1,
        Math.max(0, Math.round(ratio * (pages - 1)))
      );

      dots.forEach((d, i) => d.classList.toggle("active", i === idx));

      if (DEBUG_CAROUSEL) {
        console.log("dot update ", {
          idx,
          ratio: +ratio.toFixed(3),
          perPg,
          pages,
          scrollLeft: Math.round(sl),
          max,
        });
      }
    }

    // --- scroll listener (rAF) ---
    let ticking = false;
    carousel.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            setActive();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    // --- arrows (RTL-aware UI, but LTR math) ---
    const prev = carousel.parentElement.querySelector(".pictures-nav.prev");
    const next = carousel.parentElement.querySelector(".pictures-nav.next");
    const isRTL = document.documentElement.dir === "rtl";

    function pageDelta() {
      const max = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
      return pages > 1 ? Math.round(max / (pages - 1)) : 0;
    }

    prev?.addEventListener("click", () => {
      const dx = pageDelta();
      carousel.scrollBy({ left: isRTL ? dx : -dx, behavior: "smooth" });
    });
    next?.addEventListener("click", () => {
      const dx = pageDelta();
      carousel.scrollBy({ left: isRTL ? -dx : dx, behavior: "smooth" });
    });

    // --- keep in sync on layout/image changes ---
    const ro = new ResizeObserver(() => {
      dots = buildDots();
      setActive();
    });
    ro.observe(carousel);
    window.addEventListener("load", () => {
      dots = buildDots();
      setActive();
    });
    window.addEventListener("resize", () => {
      dots = buildDots();
      setActive();
    });

    setActive();
  }

  // LightBoxconfiguration
  function attachLightbox(containerSelector, imgSelector, groupName) {
    const root = document.querySelector(containerSelector);
    if (!root) return;

    root.querySelectorAll(imgSelector).forEach((img) => {
      if (img.closest("a.glightbox")) return; // already wrapped
      const a = document.createElement("a");
      a.className = "glightbox";
      a.dataset.gallery = groupName; // group per carousel
      a.href = img.dataset.full || img.src; // use data-full if you have larger files
      img.parentNode.insertBefore(a, img);
      a.appendChild(img);
    });
  }

  // Attach lightbox to each carousel
  if (typeof GLightbox === "undefined") {
    console.error("GLightbox is not loaded. Ensure the script is included.");
  } else {
    attachLightbox(
      "#carousel-1",
      ".pictures-of-something__image img",
      "gallery-1"
    );
    attachLightbox(
      "#carousel-2",
      ".pictures-of-center__image img",
      "gallery-2"
    );
    attachLightbox("#carousel-3", ".Yaakovs-section__image img", "gallery-3");

    GLightbox({
      selector: ".glightbox",
      touchNavigation: true,
      loop: true,
    });
  }

  // Navigation toggle
  // This function toggles the side navigation menu

  function toggleNav() {
    const nav = document.getElementById("sideNav");
    nav.classList.add("open");
  }

  function closeNav() {
    const nav = document.getElementById("sideNav");
    nav.classList.remove("open");
  }

  // Language switch
  function switchLang() {
    showLoaderAndRedirect();
  }

  function showLoaderAndRedirect() {
    const loader = document.querySelector(".loader");
    const text = document.querySelector(".loading-text");
    const bg = document.querySelector(".bg");

    let load = 0;
    loader.style.display = "block";
    bg.style.display = "block";

    let int = setInterval(() => {
      load++;

      if (load > 99) {
        clearInterval(int);
        const current = window.location.pathname;
        window.location.href = current.includes("index-en")
          ? "index.html"
          : "index-en.html";
      }

      text.innerText = `${load}%`;
      text.style.opacity = scale(load, 0, 100, 1, 0);
      bg.style.filter = `blur(${scale(load, 0, 100, 30, 0)}px)`;
    }, 30);
  }

  const scale = (num, in_min, in_max, out_min, out_max) => {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  };

  // Smooth scroll for anchors, buttons with href, or anything with data-target
  document.addEventListener("click", (e) => {
    const el = e.target.closest(
      'a[href^="#"], button[href^="#"], [data-target^="#"]'
    );
    if (!el) return;

    const selector = el.getAttribute("data-target") || el.getAttribute("href");
    if (!selector || selector === "#") return;

    const target = document.querySelector(selector);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    // Optional: if a side nav is open, close it after navigating
    const sideNav = document.getElementById("sideNav");
    if (sideNav && sideNav.classList.contains("open")) {
      sideNav.classList.remove("open");
    }
  });

  // Initialize both carousels
  setupCarousel("carousel-1", "dotContainer-1", ".pictures-of-something__card");
  // setupCarousel("carousel-2", "dotContainer-2", ".pictures-of-center__card");
  setupCarousel("carousel-3", "dotContainer-3", ".Yaakovs-section__card");
  document.getElementById("hamburger").addEventListener("click", toggleNav);
  document.getElementById("closeNav").addEventListener("click", closeNav);
  document.getElementById("switchLang").addEventListener("click", switchLang);
});
