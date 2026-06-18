(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMobileNav() {
    var button = document.querySelector('.mobile-menu-button');
    var nav = document.getElementById('mobileNav');
    if (!button || !nav) return;

    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
    });
  }

  function initHeroSlider() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) return;

    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    if (slides.length <= 1) return;

    var index = 0;
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var timer = null;

    function show(nextIndex) {
      slides[index].classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function initLocalSearch() {
    var input = document.querySelector('[data-local-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    if (!input || cards.length === 0) return;

    var resultCount = document.querySelector('[data-result-count]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery) {
      input.value = initialQuery;
    }

    function applyFilter() {
      var query = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags'));
        var matched = !query || haystack.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) visible += 1;
      });

      if (resultCount) {
        resultCount.textContent = visible;
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  }

  function initPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));
    buttons.forEach(function (button) {
      var card = button.closest('.player-card');
      var video = card ? card.querySelector('video[data-m3u8]') : null;
      if (!video) return;

      button.addEventListener('click', function () {
        var source = video.getAttribute('data-m3u8');
        if (!source) return;

        if (video.getAttribute('data-loaded') !== 'true') {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
          } else {
            video.src = source;
          }
          video.setAttribute('data-loaded', 'true');
        }

        button.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHeroSlider();
    initLocalSearch();
    initPlayers();
  });
})();
