(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playerOverlay");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function playVideo() {
      loadSource();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", playVideo);

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
