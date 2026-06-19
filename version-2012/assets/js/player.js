(function () {
    var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    var hlsLoading = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoading) {
            return hlsLoading;
        }
        hlsLoading = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = HLS_CDN;
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error('HLS 脚本加载失败'));
            };
            document.head.appendChild(script);
        });
        return hlsLoading;
    }

    function setMessage(box, text) {
        var message = box.querySelector('[data-player-message]');
        if (message) {
            message.textContent = text || '';
        }
    }

    function playWithNative(video, source, box) {
        video.src = source;
        video.play().catch(function () {
            setMessage(box, '请再次点击播放器开始播放');
        });
    }

    function playWithHls(video, source, box) {
        loadHls().then(function (Hls) {
            if (!Hls || !Hls.isSupported()) {
                playWithNative(video, source, box);
                return;
            }
            if (video._hlsInstance) {
                video._hlsInstance.destroy();
            }
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            video._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setMessage(box, '');
                video.play().catch(function () {
                    setMessage(box, '请再次点击播放器开始播放');
                });
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage(box, '当前播放源暂时无法载入，可刷新后重试');
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
        }).catch(function () {
            playWithNative(video, source, box);
        });
    }

    document.addEventListener('click', function (event) {
        var button = event.target.closest('[data-player-start]');
        if (!button) {
            return;
        }
        var box = button.closest('[data-player]');
        var video = box ? box.querySelector('video[data-src]') : null;
        if (!box || !video) {
            return;
        }
        var source = video.getAttribute('data-src');
        if (!source) {
            setMessage(box, '当前影片播放源暂时不可用');
            return;
        }
        button.classList.add('is-hidden');
        video.controls = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            playWithNative(video, source, box);
        } else {
            playWithHls(video, source, box);
        }
    });
})();
