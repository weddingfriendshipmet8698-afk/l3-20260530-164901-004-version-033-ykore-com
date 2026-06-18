(function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero-slider]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function activate(index) {
            current = index;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                activate(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function() {
                activate((current + 1) % slides.length);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function filterCards(value) {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var keyword = normalize(value);
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
        cards.forEach(function(card) {
            var haystack = normalize(card.getAttribute("data-search"));
            card.classList.toggle("is-hidden-card", keyword && haystack.indexOf(keyword) === -1);
        });
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterForm = document.querySelector("[data-local-filter-form]");

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q") || "";
        if (queryValue) {
            filterInput.value = queryValue;
            filterCards(queryValue);
        }
        filterInput.addEventListener("input", function() {
            filterCards(filterInput.value);
        });
    }

    if (filterForm) {
        filterForm.addEventListener("submit", function(event) {
            event.preventDefault();
            if (filterInput) {
                filterCards(filterInput.value);
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-chip]")).forEach(function(chip) {
        chip.addEventListener("click", function() {
            if (filterInput) {
                filterInput.value = chip.getAttribute("data-chip") || chip.textContent;
                filterCards(filterInput.value);
                filterInput.focus();
            }
        });
    });
})();
