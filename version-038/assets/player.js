(function () {
    var video = document.querySelector('.detail-video');
    var button = document.querySelector('.play-overlay');
    var message = document.querySelector('[data-player-message]');

    if (!video || !button) {
        return;
    }

    var playUrl = video.getAttribute('data-play-url');
    var isReady = false;
    var hlsInstance = null;

    function showMessage(text) {
        if (!message) {
            return;
        }

        message.textContent = text;
        message.classList.add('show');
    }

    function prepareVideo() {
        if (isReady) {
            return true;
        }

        if (!playUrl) {
            showMessage('影片暂时无法播放');
            return false;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(playUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showMessage('视频加载失败，请稍后重试');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playUrl;
        } else {
            showMessage('当前设备暂时无法播放该影片');
            return false;
        }

        isReady = true;
        return true;
    }

    function playVideo() {
        if (!prepareVideo()) {
            return;
        }

        button.classList.add('is-hidden');
        video.controls = true;

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
            button.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
