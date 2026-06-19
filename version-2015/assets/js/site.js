(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector("[data-hero-nav]");
    if (header) {
      var updateHeader = function () {
        if (window.scrollY > 24) {
          header.classList.add("is-scrolled");
        } else {
          header.classList.remove("is-scrolled");
        }
      };
      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });
    }

    var menuButton = document.querySelector("[data-menu-button]");
    var menuPanel = document.querySelector("[data-menu-panel]");
    if (menuButton && menuPanel) {
      menuButton.addEventListener("click", function () {
        menuPanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-hero-card]"));
    if (slides.length > 1) {
      var active = 0;
      window.setInterval(function () {
        slides[active].classList.remove("is-active");
        if (cards[active]) {
          cards[active].classList.remove("is-active");
        }
        active = (active + 1) % slides.length;
        slides[active].classList.add("is-active");
        if (cards[active]) {
          cards[active].classList.add("is-active");
        }
      }, 5200);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var searchRegion = document.querySelector("[data-search-region]");
    var searchCategory = document.querySelector("[data-search-category]");
    var searchCards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var emptyMessage = document.querySelector("[data-empty-message]");

    function applySearch() {
      if (!searchCards.length) {
        return;
      }
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var region = searchRegion ? searchRegion.value : "";
      var category = searchCategory ? searchCategory.value : "";
      var visible = 0;

      searchCards.forEach(function (card) {
        var haystack = (card.getAttribute("data-title") || "").toLowerCase();
        var cardRegion = card.getAttribute("data-region") || "";
        var cardCategory = card.getAttribute("data-category") || "";
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (region && cardRegion !== region) {
          ok = false;
        }
        if (category && cardCategory !== category) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (emptyMessage) {
        emptyMessage.classList.toggle("is-visible", visible === 0);
      }
    }

    if (searchInput || searchRegion || searchCategory) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
      }
      [searchInput, searchRegion, searchCategory].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applySearch);
          control.addEventListener("change", applySearch);
        }
      });
      applySearch();
    }

    var filterInput = document.querySelector("[data-category-filter]");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-category-card]"));
    if (filterInput && filterCards.length) {
      filterInput.addEventListener("input", function () {
        var query = filterInput.value.trim().toLowerCase();
        filterCards.forEach(function (card) {
          var haystack = (card.getAttribute("data-filter-text") || "").toLowerCase();
          card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
        });
      });
    }
  });
})();
