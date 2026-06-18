(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = $('.mobile-toggle');
    var menu = $('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('.hero-slide', hero);
    var dots = $all('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(next, 5000);
    }

    var prevButton = $('[data-hero-prev]', hero);
    var nextButton = $('[data-hero-next]', hero);
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    if (slides.length > 1) {
      restart();
    }
  }

  function initHorizontalRows() {
    $all('[data-horizontal-row]').forEach(function (row) {
      var section = row.closest('section') || document;
      var left = $('[data-scroll-left]', section);
      var right = $('[data-scroll-right]', section);
      function move(direction) {
        row.scrollBy({
          left: direction * Math.min(520, row.clientWidth * 0.82),
          behavior: 'smooth'
        });
      }
      if (left) {
        left.addEventListener('click', function () {
          move(-1);
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          move(1);
        });
      }
    });
  }

  function renderSearch(panel, items) {
    if (!panel) {
      return;
    }
    if (!items.length) {
      panel.innerHTML = '<div class="search-empty">未找到相关内容</div>';
      panel.classList.add('is-open');
      return;
    }
    panel.innerHTML = items.slice(0, 10).map(function (item) {
      return '<a class="search-result" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong>' +
        '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span></span>' +
        '</a>';
    }).join('');
    panel.classList.add('is-open');
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
    var data = window.SEARCH_DATA || [];
    $all('.site-search-input').forEach(function (input) {
      var wrapper = input.closest('.search-wrapper') || input.closest('.mobile-search');
      var panel = $('.search-panel', wrapper);
      input.addEventListener('input', function () {
        var query = normalize(input.value);
        if (!query) {
          if (panel) {
            panel.classList.remove('is-open');
            panel.innerHTML = '';
          }
          return;
        }
        var words = query.split(/\s+/).filter(Boolean);
        var matches = data.filter(function (item) {
          var haystack = normalize([item.title, item.region, item.genre, item.tags, item.type, item.year].join(' '));
          return words.every(function (word) {
            return haystack.indexOf(word) !== -1;
          });
        });
        renderSearch(panel, matches);
      });
    });
    document.addEventListener('click', function (event) {
      if (!event.target.closest('.search-wrapper') && !event.target.closest('.mobile-search')) {
        $all('.search-panel').forEach(function (panel) {
          panel.classList.remove('is-open');
        });
      }
    });
  }

  function initLocalFilters() {
    $all('.local-filter-input').forEach(function (input) {
      var selector = input.getAttribute('data-filter-target') || '.movie-card';
      var cards = $all(selector);
      input.addEventListener('input', function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent);
          card.classList.toggle('is-filter-hidden', query && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  window.initPlayer = function (videoId, source) {
    var video = document.getElementById(videoId);
    if (!video || !source) {
      return;
    }
    var overlay = document.querySelector('[data-player-target="' + videoId + '"]');
    var loaded = false;
    var hls = null;

    function startPlayback() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    function loadAndPlay() {
      if (loaded) {
        startPlayback();
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        startPlayback();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          startPlayback();
        });
        return;
      }
      video.src = source;
      startPlayback();
    }

    if (overlay) {
      overlay.addEventListener('click', loadAndPlay);
    }
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        loadAndPlay();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initHorizontalRows();
    initGlobalSearch();
    initLocalFilters();
  });
})();
