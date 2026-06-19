(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = $('.menu-toggle');
    var panel = $('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = $('.hero-slider');
    if (!hero) {
      return;
    }
    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dots button', hero);
    var prev = $('.hero-prev', hero);
    var next = $('.hero-next', hero);
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCardFilter() {
    var input = $('[data-filter-input]');
    if (!input) {
      return;
    }
    var cards = $all('.movie-card');
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.year, card.dataset.region].join(' ').toLowerCase();
        card.style.display = !value || text.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  }

  function pad(value) {
    value = Math.floor(value || 0);
    var minutes = Math.floor(value / 60);
    var seconds = String(value % 60).padStart(2, '0');
    return minutes + ':' + seconds;
  }

  function initMoviePlayer(options) {
    var root = $('.video-player');
    if (!root || !options || !options.source) {
      return;
    }
    var video = $('video', root);
    var overlay = $('.player-overlay', root);
    var playButton = $('[data-player-play]', root);
    var muteButton = $('[data-player-mute]', root);
    var fullButton = $('[data-player-full]', root);
    var progress = $('.progress', root);
    var time = $('.player-time', root);
    var ready = false;
    var hls = null;

    function attach() {
      if (ready || !video) {
        return;
      }
      if (options.poster) {
        video.poster = options.poster;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(options.source);
        hls.attachMedia(video);
      } else {
        video.src = options.source;
      }
      ready = true;
    }

    function refresh() {
      if (!video) {
        return;
      }
      var duration = video.duration || 0;
      if (progress) {
        progress.max = duration;
        progress.value = video.currentTime || 0;
      }
      if (time) {
        time.textContent = pad(video.currentTime) + ' / ' + pad(duration);
      }
      root.classList.toggle('is-paused', video.paused);
      if (overlay) {
        overlay.classList.toggle('is-hidden', !video.paused);
      }
      if (playButton) {
        playButton.textContent = video.paused ? '▶' : 'Ⅱ';
      }
      if (muteButton) {
        muteButton.textContent = video.muted ? '🔇' : '🔊';
      }
    }

    function playToggle() {
      attach();
      if (!video) {
        return;
      }
      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
      refresh();
    }

    if (overlay) {
      overlay.addEventListener('click', playToggle);
    }
    if (playButton) {
      playButton.addEventListener('click', playToggle);
    }
    if (video) {
      video.addEventListener('click', playToggle);
      video.addEventListener('play', refresh);
      video.addEventListener('pause', refresh);
      video.addEventListener('timeupdate', refresh);
      video.addEventListener('durationchange', refresh);
    }
    if (muteButton) {
      muteButton.addEventListener('click', function () {
        attach();
        video.muted = !video.muted;
        refresh();
      });
    }
    if (fullButton) {
      fullButton.addEventListener('click', function () {
        if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      });
    }
    if (progress) {
      progress.addEventListener('input', function () {
        attach();
        video.currentTime = Number(progress.value) || 0;
        refresh();
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
    refresh();
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="movie-poster" href="' + movie.detail + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="score-badge">' + movie.score + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(movie.year || '经典') + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '<h2><a href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var mount = $('#search-results');
    var input = $('#search-input');
    if (!mount || !window.MovieIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(query);

    function render(value) {
      var key = String(value || '').trim().toLowerCase();
      var results = window.MovieIndex.filter(function (movie) {
        var text = [movie.title, movie.year, movie.region, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return !key || text.indexOf(key) !== -1;
      }).slice(0, 96);
      if (!results.length) {
        mount.innerHTML = '<div class="result-empty">暂未找到匹配影片</div>';
        return;
      }
      mount.innerHTML = results.map(movieCard).join('');
    }
  }

  function initPage() {
    initMenu();
    initHero();
    initCardFilter();
  }

  window.Site = {
    initPage: initPage,
    initMoviePlayer: initMoviePlayer,
    initSearchPage: initSearchPage
  };

  document.addEventListener('DOMContentLoaded', initPage);
})();
