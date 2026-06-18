(function () {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-site-nav]");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let active = 0;
        let timer;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }

        restart();
    }

    const filterForms = Array.from(document.querySelectorAll("[data-filter-form]"));

    filterForms.forEach(function (form) {
        const keyword = form.querySelector("[data-filter-keyword]");
        const region = form.querySelector("[data-filter-region]");
        const year = form.querySelector("[data-filter-year]");
        const type = form.querySelector("[data-filter-type]");
        const selector = form.getAttribute("data-filter-target") || ".movie-card";
        const cards = Array.from(document.querySelectorAll(selector));
        const empty = document.querySelector("[data-no-results]");

        function normalized(value) {
            return String(value || "").toLowerCase().trim();
        }

        function update() {
            const q = normalized(keyword && keyword.value);
            const regionValue = normalized(region && region.value);
            const yearValue = normalized(year && year.value);
            const typeValue = normalized(type && type.value);
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalized([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                const okKeyword = !q || haystack.indexOf(q) !== -1;
                const okRegion = !regionValue || normalized(card.getAttribute("data-region")) === regionValue;
                const okYear = !yearValue || normalized(card.getAttribute("data-year")) === yearValue;
                const okType = !typeValue || normalized(card.getAttribute("data-type")) === typeValue;
                const shouldShow = okKeyword && okRegion && okYear && okType;
                card.classList.toggle("is-hidden", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [keyword, region, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });
    });
}());
