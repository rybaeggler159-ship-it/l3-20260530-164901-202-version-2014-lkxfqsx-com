document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("[data-search-form]");
  const input = document.querySelector("[data-search-input]");
  const summary = document.querySelector("[data-search-summary]");
  const results = document.querySelector("[data-search-results]");
  const movies = Array.isArray(window.MOVIE_SEARCH_DATA) ? window.MOVIE_SEARCH_DATA : [];

  if (!form || !input || !summary || !results) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  input.value = initialQuery;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const query = input.value.trim();
    const url = new URL(window.location.href);

    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }

    window.history.pushState({}, "", url.toString());
    render(query);
  });

  input.addEventListener("input", function () {
    render(input.value.trim());
  });

  render(initialQuery);

  function render(query) {
    const keyword = normalize(query);
    results.innerHTML = "";

    if (!keyword) {
      summary.textContent = "请输入关键词开始搜索。";
      return;
    }

    const matched = movies.filter(function (movie) {
      const haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags.join(" "),
        movie.oneLine,
        movie.summary
      ].join(" "));

      return haystack.includes(keyword);
    });

    summary.textContent = "搜索“" + query + "”找到 " + matched.length + " 部影片。";

    matched.slice(0, 240).forEach(function (movie) {
      results.insertAdjacentHTML("beforeend", createCard(movie));
    });

    if (matched.length > 240) {
      const notice = document.createElement("p");
      notice.className = "search-summary";
      notice.textContent = "结果较多，已显示前 240 条，可继续输入更精确的关键词。";
      results.insertAdjacentElement("afterend", notice);
    }
  }

  function createCard(movie) {
    return [
      '<article class="movie-card compact">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <span class="poster-shell">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="poster-overlay"><span class="play-badge">▶</span></span>',
      '      <span class="poster-region">' + escapeHtml(movie.region) + '</span>',
      '      <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '    </span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <div class="card-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genreHead) + '</span></div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
