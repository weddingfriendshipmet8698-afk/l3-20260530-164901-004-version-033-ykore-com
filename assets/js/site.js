import { H as Hls } from "./hls-vendor.js";

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function initMobileMenu() {
  const button = document.querySelector(".mobile-toggle");
  const panel = document.querySelector(".mobile-panel");

  if (!button || !panel) {
    return;
  }

  button.addEventListener("click", () => {
    const willOpen = panel.hasAttribute("hidden");
    panel.toggleAttribute("hidden", !willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
  });
}

function initHeroSlider() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll(".hero-dot"));
  let current = 0;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => show(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => show(current + 1), 5000);
  }
}

function initFilters() {
  const filterRoot = document.querySelector("[data-filter-root]");
  if (!filterRoot) {
    return;
  }

  const input = filterRoot.querySelector("[data-filter-input]");
  const yearSelect = filterRoot.querySelector("[data-filter-year]");
  const categorySelect = filterRoot.querySelector("[data-filter-category]");
  const cards = Array.from(filterRoot.querySelectorAll(".search-card, .rank-row"));
  const empty = filterRoot.querySelector(".no-results");

  function applyFilters() {
    const query = input ? input.value.trim().toLowerCase() : "";
    const year = yearSelect ? yearSelect.value : "";
    const category = categorySelect ? categorySelect.value : "";
    let visible = 0;

    cards.forEach((card) => {
      const haystack = (card.dataset.search || "").toLowerCase();
      const cardYear = card.dataset.year || "";
      const cardCategory = card.dataset.category || "";
      const matchesQuery = !query || haystack.includes(query);
      const matchesYear = !year || cardYear === year;
      const matchesCategory = !category || cardCategory === category;
      const shouldShow = matchesQuery && matchesYear && matchesCategory;

      card.style.display = shouldShow ? "" : "none";
      if (shouldShow) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible === 0 ? "block" : "none";
    }
  }

  [input, yearSelect, categorySelect].forEach((control) => {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  if (query && input) {
    input.value = query;
  }

  applyFilters();
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll(".static-player"));

  players.forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector(".play-trigger");
    const message = player.querySelector(".player-message");
    const source = player.dataset.src;

    if (!video || !button || !source) {
      return;
    }

    let hasLoaded = false;
    let hlsInstance = null;

    async function startPlayback() {
      try {
        if (!hasLoaded) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else {
            throw new Error("当前浏览器不支持 HLS 播放。");
          }

          hasLoaded = true;
        }

        video.controls = true;
        player.classList.add("is-playing");
        if (message) {
          message.textContent = "正在加载播放源…";
        }

        await video.play();

        if (message) {
          message.textContent = "";
        }
      } catch (error) {
        player.classList.remove("is-playing");
        if (message) {
          message.textContent = "播放源加载失败，请检查网络或播放源可访问性。";
        }
        console.error(error);
      }
    }

    button.addEventListener("click", startPlayback);

    video.addEventListener("playing", () => {
      player.classList.add("is-playing");
    });

    video.addEventListener("pause", () => {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove("is-playing");
      }
    });

    window.addEventListener("pagehide", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

ready(() => {
  initMobileMenu();
  initHeroSlider();
  initFilters();
  initPlayers();
});
