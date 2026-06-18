(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var input = document.getElementById("movieSearchInput");
    var type = document.getElementById("movieTypeFilter");
    var region = document.getElementById("movieRegionFilter");
    var year = document.getElementById("movieYearFilter");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-filter-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function valueOf(control) {
      return control ? control.value.trim().toLowerCase() : "";
    }

    function apply() {
      var q = valueOf(input);
      var t = valueOf(type);
      var r = valueOf(region);
      var y = valueOf(year);
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (t && (card.getAttribute("data-type") || "").toLowerCase() !== t) {
          ok = false;
        }
        if (r && (card.getAttribute("data-region") || "").toLowerCase() !== r) {
          ok = false;
        }
        if (y && (card.getAttribute("data-year") || "").toLowerCase() !== y) {
          ok = false;
        }
        card.classList.toggle("is-hidden", !ok);
      });
    }

    [input, type, region, year].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });

    apply();
  }

  window.initMoviePlayer = function (playerId, streamUrl) {
    var root = document.getElementById(playerId);
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var button = root.querySelector(".js-player-start");
    if (!video || !button) {
      return;
    }
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      root.classList.add("is-playing");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          root.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!attached) {
        start();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
