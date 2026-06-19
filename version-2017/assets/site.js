(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var input = form.querySelector("input[name='q'], [data-search-input]");
        var query = input ? input.value.trim() : "";
        var action = form.getAttribute("action") || "search.html";
        var target = action + (query ? "?q=" + encodeURIComponent(query) : "");

        window.location.href = target;
      });
    });
  }

  function initHeroSlider() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-hero-dot") || 0);
        show(next);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function initStaticFilter() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");

    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();

        card.style.display = text.indexOf(query) === -1 ? "none" : "";
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var input = document.querySelector("[data-search-input]");

    if (!results || !status || !window.MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function render(query) {
      var normalized = query.trim().toLowerCase();

      if (!normalized) {
        status.textContent = "请输入关键词开始搜索。";
        results.innerHTML = "";
        return;
      }

      var matched = window.MOVIES.filter(function (movie) {
        var text = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();

        return text.indexOf(normalized) !== -1;
      });

      status.textContent = matched.length ? "搜索结果已更新。" : "没有找到匹配影片。";

      results.innerHTML = matched.slice(0, 240).map(function (movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
          "<article class=\"movie-card\" data-card>",
          "  <a class=\"movie-cover\" href=\"" + escapeAttribute(movie.url) + "\">",
          "    <img src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\">",
          "    <span class=\"badge\">" + escapeHtml(movie.type) + "</span>",
          "  </a>",
          "  <div class=\"movie-body\">",
          "    <a class=\"movie-title\" href=\"" + escapeAttribute(movie.url) + "\">" + escapeHtml(movie.title) + "</a>",
          "    <p>" + escapeHtml(movie.oneLine || "") + "</p>",
          "    <div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><a href=\"category/" + escapeAttribute(movie.categorySlug) + ".html\">" + escapeHtml(movie.category) + "</a></div>",
          "    <div class=\"tag-row\">" + tags + "</div>",
          "  </div>",
          "</article>"
        ].join("");
      }).join("");
    }

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }

    render(initialQuery);
  }

  function initPlayer() {
    var video = document.querySelector("[data-video-player]");
    var button = document.querySelector("[data-play-button]");

    if (!video || !button) {
      return;
    }

    var hlsInstance = null;
    var source = video.getAttribute("data-src") || "";

    function attachSource() {
      if (!source) {
        return Promise.resolve();
      }

      if (video.getAttribute("src")) {
        return Promise.resolve();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.setAttribute("src", source);
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
        });
      }

      video.setAttribute("src", source);
      return Promise.resolve();
    }

    function playVideo() {
      button.classList.add("is-hidden");
      video.setAttribute("controls", "controls");

      attachSource().then(function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      });
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", playVideo);

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  ready(function () {
    initMobileMenu();
    initSearchForms();
    initHeroSlider();
    initStaticFilter();
    initSearchPage();
    initPlayer();
  });
})();
