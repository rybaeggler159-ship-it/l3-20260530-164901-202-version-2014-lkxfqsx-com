(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initNav() {
        var toggle = qs('[data-nav-toggle]');
        var nav = qs('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
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
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
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
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function resultTemplate(item) {
        return [
            '<a class="search-result" href="' + item.url + '">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span><strong>' + escapeHtml(item.title) + '</strong>',
            '<span>' + escapeHtml(item.meta) + '</span></span>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function initGlobalSearch() {
        var inputs = qsa('[data-global-search]');
        var data = window.SITE_MOVIES || [];
        if (!inputs.length || !data.length) {
            return;
        }

        inputs.forEach(function (input) {
            var panel = input.parentElement ? qs('[data-search-panel]', input.parentElement) : null;
            if (!panel) {
                return;
            }

            input.addEventListener('input', function () {
                var keyword = input.value.trim().toLowerCase();
                if (!keyword) {
                    panel.classList.remove('is-open');
                    panel.innerHTML = '';
                    return;
                }
                var matches = data.filter(function (item) {
                    return item.search.indexOf(keyword) !== -1;
                }).slice(0, 12);

                if (!matches.length) {
                    panel.innerHTML = '<p class="search-empty">没有找到相关影片</p>';
                } else {
                    panel.innerHTML = matches.map(resultTemplate).join('');
                }
                panel.classList.add('is-open');
            });

            document.addEventListener('click', function (event) {
                if (!input.parentElement.contains(event.target)) {
                    panel.classList.remove('is-open');
                }
            });
        });
    }

    function initCardFilter() {
        var input = qs('[data-card-filter]');
        var list = qs('[data-card-list]');
        if (!input || !list) {
            initListFilter();
            return;
        }
        var count = qs('[data-filter-count]');
        var cards = qsa('[data-title]', list);

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
                var ok = text.indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + ' 部';
            }
        });
    }

    function initListFilter() {
        var input = qs('[data-list-filter]');
        var list = qs('[data-card-list]');
        if (!input || !list) {
            return;
        }
        var count = qs('[data-filter-count]');
        var items = qsa('li', list);
        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            items.forEach(function (item) {
                var text = item.textContent.toLowerCase();
                var ok = text.indexOf(keyword) !== -1;
                item.classList.toggle('is-hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + ' 部';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNav();
        initHero();
        initGlobalSearch();
        initCardFilter();
    });
})();
