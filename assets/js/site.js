document.addEventListener("DOMContentLoaded", function () {
  initializeHeader();
  initializeMobileMenu();
  initializeHeroSlider();
  initializeFilterBoxes();
  initializeBackToTop();
});

function initializeHeader() {
  const header = document.querySelector("[data-site-header]");
  if (!header) {
    return;
  }

  const updateHeader = function () {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initializeMobileMenu() {
  const header = document.querySelector("[data-site-header]");
  const button = document.querySelector("[data-mobile-menu-button]");
  const nav = document.querySelector("[data-mobile-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("is-open");
    if (header) {
      header.classList.toggle("is-open", isOpen);
    }
    button.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
  });
}

function initializeHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  const prev = slider.querySelector("[data-hero-prev]");
  const next = slider.querySelector("[data-hero-next]");
  let index = 0;
  let timer = null;

  const show = function (nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  const restart = function () {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  };

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      restart();
    });
  }

  if (slides.length > 1) {
    restart();
  }
}

function initializeFilterBoxes() {
  const boxes = Array.from(document.querySelectorAll("[data-filter-box]"));

  boxes.forEach(function (box) {
    const section = box.closest("section") || document;
    const input = box.querySelector("[data-filter-input]");
    const regionSelect = box.querySelector("[data-filter-region]");
    const typeSelect = box.querySelector("[data-filter-type]");
    const sortSelect = box.querySelector("[data-filter-sort]");
    const count = box.querySelector("[data-filter-count]");
    const grid = section.querySelector("[data-card-grid]") || document.querySelector("[data-card-grid]");

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll("[data-card]"));
    populateSelect(regionSelect, uniqueValues(cards, "region"), "全部地区");
    populateSelect(typeSelect, uniqueValues(cards, "type"), "全部类型");

    const apply = function () {
      const keyword = normalize(input ? input.value : "");
      const region = regionSelect ? regionSelect.value : "";
      const type = typeSelect ? typeSelect.value : "";
      let visibleCards = [];

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesRegion = !region || card.dataset.region === region;
        const matchesType = !type || card.dataset.type === type;
        const visible = matchesKeyword && matchesRegion && matchesType;

        card.classList.toggle("is-hidden-by-filter", !visible);
        if (visible) {
          visibleCards.push(card);
        }
      });

      sortCards(grid, visibleCards, sortSelect ? sortSelect.value : "default");

      if (count) {
        count.textContent = "当前显示 " + visibleCards.length + " 部，共 " + cards.length + " 部。";
      }
    };

    [input, regionSelect, typeSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
}

function uniqueValues(cards, key) {
  const values = cards.map(function (card) {
    return card.dataset[key] || "";
  }).filter(Boolean);

  return Array.from(new Set(values)).sort(function (a, b) {
    return a.localeCompare(b, "zh-CN");
  });
}

function populateSelect(select, values, label) {
  if (!select || select.dataset.ready === "true") {
    return;
  }

  select.innerHTML = "";
  const first = document.createElement("option");
  first.value = "";
  first.textContent = label;
  select.appendChild(first);

  values.forEach(function (value) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  select.dataset.ready = "true";
}

function sortCards(grid, cards, sortMode) {
  if (!sortMode || sortMode === "default") {
    return;
  }

  const sortedCards = cards.slice().sort(function (a, b) {
    if (sortMode === "year-desc") {
      return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
    }

    if (sortMode === "year-asc") {
      return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
    }

    if (sortMode === "title") {
      return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-CN");
    }

    return 0;
  });

  sortedCards.forEach(function (card) {
    grid.appendChild(card);
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function initializeBackToTop() {
  const button = document.querySelector("[data-back-to-top]");
  if (!button) {
    return;
  }

  const update = function () {
    button.classList.toggle("is-visible", window.scrollY > 420);
  };

  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  update();
  window.addEventListener("scroll", update, { passive: true });
}
