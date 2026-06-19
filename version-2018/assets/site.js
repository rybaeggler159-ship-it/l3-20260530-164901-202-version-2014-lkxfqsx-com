(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;

    const show = (index) => {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    };

    if (prev) {
      prev.addEventListener('click', () => show(current - 1));
    }
    if (next) {
      next.addEventListener('click', () => show(current + 1));
    }
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => show(index));
    });
    window.setInterval(() => show(current + 1), 6000);
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  const filterInput = document.querySelector('[data-filter-input]');
  const searchInputs = document.querySelectorAll('[data-search-input]');

  searchInputs.forEach((input) => {
    input.value = query;
  });

  if (filterInput) {
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const emptyState = document.querySelector('[data-empty-state]');
    const applyFilter = (value) => {
      const keyword = value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const text = `${card.dataset.title || ''} ${card.dataset.tags || ''} ${card.dataset.year || ''}`.toLowerCase();
        const matched = !keyword || text.includes(keyword);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('visible', visible === 0);
      }
    };

    if (query) {
      filterInput.value = query;
    }
    applyFilter(filterInput.value || query);
    filterInput.addEventListener('input', () => applyFilter(filterInput.value));
  }

  document.querySelectorAll('[data-video-url]').forEach((panel) => {
    const video = panel.querySelector('video');
    const button = panel.querySelector('[data-play]');
    const videoUrl = panel.getAttribute('data-video-url');
    let prepared = false;
    let hlsPlayer = null;

    const prepare = () => {
      if (prepared || !video || !videoUrl) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({ enableWorker: true });
        hlsPlayer.loadSource(videoUrl);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
      prepared = true;
    };

    const play = () => {
      prepare();
      panel.classList.add('is-playing');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', () => panel.classList.add('is-playing'));
      video.addEventListener('ended', () => panel.classList.remove('is-playing'));
    }

    window.addEventListener('pagehide', () => {
      if (hlsPlayer) {
        hlsPlayer.destroy();
      }
    });
  });
})();
