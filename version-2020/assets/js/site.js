const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", function() {
    siteNav.classList.toggle("is-open");
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      showSlide(Number(dot.dataset.heroDot || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }
}

const searchInput = document.getElementById("site-search");
const yearFilter = document.getElementById("year-filter");
const cards = Array.from(document.querySelectorAll(".movie-card"));

function applyFilters() {
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const year = yearFilter ? yearFilter.value : "";

  cards.forEach(function(card) {
    const text = (card.dataset.search || "").toLowerCase();
    const cardYear = card.dataset.year || "";
    const keywordMatched = !keyword || text.includes(keyword);
    const yearMatched = !year || cardYear.startsWith(year);
    card.classList.toggle("is-filtered-out", !(keywordMatched && yearMatched));
  });
}

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

if (yearFilter) {
  yearFilter.addEventListener("change", applyFilters);
}
