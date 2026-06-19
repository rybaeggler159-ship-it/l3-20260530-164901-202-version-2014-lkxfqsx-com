(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        reset();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        reset();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        reset();
      });
    });
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var textInput = scope.querySelector("[data-filter-text]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var categorySelect = scope.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .horizontal-card"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && textInput) {
        textInput.value = query;
      }

      function matchYear(card, value) {
        if (!value) {
          return true;
        }
        var year = Number(card.getAttribute("data-year") || "0");
        if (value === "older") {
          return year < 2020;
        }
        return String(year) === value;
      }

      function apply() {
        var term = textInput ? textInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var category = categorySelect ? categorySelect.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-category") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (term && haystack.indexOf(term) === -1) {
            ok = false;
          }
          if (!matchYear(card, year)) {
            ok = false;
          }
          if (region && haystack.indexOf(region.toLowerCase()) === -1) {
            ok = false;
          }
          if (category && (card.getAttribute("data-category") || "") !== category) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
        });
      }

      [textInput, yearSelect, regionSelect, categorySelect].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });

  window.initMoviePlayer = function (videoId, buttonId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var attached = false;

    function attach() {
      if (attached || !video) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var task = video.play();
      if (task && typeof task.catch === "function") {
        task.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }
  };
})();
