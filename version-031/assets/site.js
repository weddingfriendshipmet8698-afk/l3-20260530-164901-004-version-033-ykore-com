(function () {
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let index = 0;

        const showSlide = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }
    }

    const searchIndex = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
    const searchInput = document.querySelector("[data-search-input]");
    const searchPanel = document.querySelector("[data-search-panel]");

    const renderSearch = function (query) {
        if (!searchPanel) {
            return;
        }

        const keyword = query.trim().toLowerCase();
        if (!keyword) {
            searchPanel.classList.remove("open");
            searchPanel.innerHTML = "";
            return;
        }

        const results = searchIndex.filter(function (item) {
            const text = [item.title, item.meta, item.summary, item.tags].join(" ").toLowerCase();
            return text.indexOf(keyword) !== -1;
        }).slice(0, 8);

        if (!results.length) {
            searchPanel.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
            searchPanel.classList.add("open");
            return;
        }

        searchPanel.innerHTML = results.map(function (item) {
            return [
                '<a class="search-item" href="' + item.url + '">',
                '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">',
                '<span>',
                '<strong>' + escapeHtml(item.title) + '</strong>',
                '<span>' + escapeHtml(item.meta) + '</span>',
                '</span>',
                '</a>'
            ].join("");
        }).join("");
        searchPanel.classList.add("open");
    };

    if (searchInput && searchPanel) {
        searchInput.addEventListener("input", function () {
            renderSearch(searchInput.value);
        });

        searchInput.addEventListener("focus", function () {
            renderSearch(searchInput.value);
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest(".search-box")) {
                searchPanel.classList.remove("open");
            }
        });
    }

    const localInput = document.querySelector("[data-local-search]");
    const filterButtons = Array.from(document.querySelectorAll("[data-filter-chip]"));
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const noResults = document.querySelector("[data-no-results]");
    let currentFilter = "all";

    const applyLocalFilter = function () {
        const query = localInput ? localInput.value.trim().toLowerCase() : "";
        let visible = 0;

        cards.forEach(function (card) {
            const text = (card.getAttribute("data-search-text") || "").toLowerCase();
            const matchesQuery = !query || text.indexOf(query) !== -1;
            const matchesFilter = currentFilter === "all" || text.indexOf(currentFilter.toLowerCase()) !== -1;
            const shouldShow = matchesQuery && matchesFilter;
            card.style.display = shouldShow ? "" : "none";
            if (shouldShow) {
                visible += 1;
            }
        });

        if (noResults) {
            noResults.style.display = visible ? "none" : "block";
        }
    };

    if (localInput) {
        localInput.addEventListener("input", applyLocalFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (item) {
                item.classList.remove("active");
            });
            button.classList.add("active");
            currentFilter = button.getAttribute("data-filter-chip") || "all";
            applyLocalFilter();
        });
    });

    const players = Array.from(document.querySelectorAll("[data-player]"));
    window.__movieHlsPlayers = window.__movieHlsPlayers || [];

    players.forEach(function (player) {
        const video = player.querySelector("video");
        const playButton = player.querySelector("[data-play]");
        const source = player.getAttribute("data-src");

        if (!video || !source) {
            return;
        }

        const attachSource = function () {
            if (player.getAttribute("data-ready") === "1") {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                window.__movieHlsPlayers.push(hls);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }

            player.setAttribute("data-ready", "1");
        };

        const startPlay = function () {
            attachSource();
            player.classList.add("is-playing");
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        };

        if (playButton) {
            playButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlay();
            });
        }

        player.addEventListener("click", function (event) {
            if (event.target === video || event.target.closest("video")) {
                return;
            }
            startPlay();
        });
    });

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];
        });
    }
})();
