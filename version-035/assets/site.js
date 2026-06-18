(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('img[data-cover]').forEach(function (image) {
      image.addEventListener('error', function () {
        var poster = image.closest('.poster');
        if (poster) {
          poster.classList.add('poster-missing');
        }
        image.style.display = 'none';
      });
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var results = document.querySelector('[data-filter-results]');
    if (!panel || !results) {
      return;
    }

    var searchInput = panel.querySelector('[data-filter-search]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var countLabel = panel.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(results.querySelectorAll('.js-filter-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-category'),
        card.getAttribute('data-genre')
      ].join(' '));
    }

    function filter() {
      var query = normalize(searchInput ? searchInput.value : '');
      var category = normalize(categorySelect ? categorySelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
        var matchesCategory = !category || normalize(card.getAttribute('data-category')) === category;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        var show = matchesQuery && matchesCategory && matchesYear && matchesType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (countLabel) {
        countLabel.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
      }
    }

    [searchInput, categorySelect, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });

    filter();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var status = player.querySelector('[data-player-status]');
      var source = player.getAttribute('data-source');
      var hlsInstance = null;

      if (!video || !button || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function playVideo() {
        player.classList.add('is-playing');
        setStatus('正在载入播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().then(function () {
            setStatus('');
          }).catch(function () {
            setStatus('浏览器已阻止自动播放，请再次点击视频播放。');
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              setStatus('');
            }).catch(function () {
              setStatus('播放已准备好，请点击视频控制栏继续。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
            if (data && data.fatal) {
              setStatus('播放源载入失败，请稍后重试。');
            }
          });
          return;
        }

        setStatus('当前浏览器暂不支持此播放格式。');
      }

      button.addEventListener('click', playVideo);
    });
  }

  ready(function () {
    setupMobileMenu();
    setupImageFallbacks();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
  });
})();
