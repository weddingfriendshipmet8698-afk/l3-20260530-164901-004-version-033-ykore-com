(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
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
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    selectAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var typeSelect = scope.querySelector('[data-filter-type]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var items = selectAll('[data-search-item]', scope);

        if (scope.hasAttribute('data-url-query') && input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query) {
                input.value = query;
            }
        }

        function applyFilter() {
            var queryText = input ? input.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var yearValue = yearSelect ? yearSelect.value : '';

            items.forEach(function (item) {
                var searchable = item.textContent.toLowerCase() + ' ' + (item.getAttribute('data-title') || '').toLowerCase() + ' ' + (item.getAttribute('data-genre') || '').toLowerCase();
                var itemType = item.getAttribute('data-type') || '';
                var itemYear = item.getAttribute('data-year') || '';
                var matched = true;

                if (queryText && searchable.indexOf(queryText) === -1) {
                    matched = false;
                }

                if (typeValue && itemType !== typeValue) {
                    matched = false;
                }

                if (yearValue && itemYear !== yearValue) {
                    matched = false;
                }

                item.classList.toggle('is-hidden', !matched);
            });
        }

        [input, typeSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });
})();
