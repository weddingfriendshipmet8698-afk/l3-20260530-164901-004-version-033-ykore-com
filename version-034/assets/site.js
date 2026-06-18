(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var siteNav = document.querySelector(".site-nav");

    if (menuButton && siteNav) {
      menuButton.addEventListener("click", function () {
        siteNav.classList.toggle("open");
      });
    }

    var forms = document.querySelectorAll(".global-search-form");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;

      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
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
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide")) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var filterInput = document.getElementById("pageSearch");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var currentFilter = "all";

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var query = filterInput ? normalize(filterInput.value.trim()) : "";

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var type = normalize(card.getAttribute("data-type"));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = currentFilter === "all" || haystack.indexOf(normalize(currentFilter)) !== -1 || type.indexOf(normalize(currentFilter)) !== -1;
        card.style.display = matchesQuery && matchesFilter ? "" : "none";
      });
    }

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        filterInput.value = q;
      }
      filterInput.addEventListener("input", applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        currentFilter = chip.getAttribute("data-filter") || "all";
        applyFilters();
      });
    });

    applyFilters();
  });
})();
