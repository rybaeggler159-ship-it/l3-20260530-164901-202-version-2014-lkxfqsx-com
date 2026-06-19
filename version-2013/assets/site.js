(function () {
    function initNav() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var active = 0;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(active + 1);
        }, 5200);
    }

    function getText(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var grid = scope.querySelector('[data-filter-grid]');
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
            var input = panel.querySelector('[data-filter-search]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var sortSelect = panel.querySelector('[data-filter-sort]');
            var count = panel.querySelector('[data-filter-count]');

            function matchesYear(card, value) {
                if (!value) {
                    return true;
                }
                var year = parseInt(card.getAttribute('data-year') || '0', 10);
                if (value === 'older') {
                    return year < 2020;
                }
                return String(year) === value;
            }

            function apply() {
                var query = getText(input && input.value);
                var yearValue = yearSelect ? yearSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var keywords = getText(card.getAttribute('data-keywords'));
                    var title = getText(card.getAttribute('data-title'));
                    var ok = (!query || keywords.indexOf(query) !== -1 || title.indexOf(query) !== -1) && matchesYear(card, yearValue);
                    card.classList.toggle('is-filter-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
            }

            function sortCards() {
                var value = sortSelect ? sortSelect.value : 'year-desc';
                var ordered = cards.slice().sort(function (a, b) {
                    var ay = parseInt(a.getAttribute('data-year') || '0', 10);
                    var by = parseInt(b.getAttribute('data-year') || '0', 10);
                    var at = getText(a.getAttribute('data-title'));
                    var bt = getText(b.getAttribute('data-title'));
                    if (value === 'year-asc') {
                        return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
                    }
                    if (value === 'title-asc') {
                        return at.localeCompare(bt, 'zh-Hans-CN') || by - ay;
                    }
                    return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
                });
                ordered.forEach(function (card) {
                    grid.appendChild(card);
                });
                cards = ordered;
                apply();
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }
            if (sortSelect) {
                sortSelect.addEventListener('change', sortCards);
            }
            sortCards();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNav();
        initHero();
        initFilters();
    });
})();
