import { H as Hls } from './hls-vendor-dru42stk.js';

function attachHls(video, source) {
    if (!video || !source) {
        return null;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return null;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return hls;
    }

    video.src = source;
    return null;
}

function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));
    players.forEach(function (video) {
        var source = video.getAttribute('data-src');
        var wrap = video.closest('.player-wrap');
        var start = wrap ? wrap.querySelector('[data-player-start]') : null;
        var attached = false;

        function startPlayback() {
            if (!attached) {
                attachHls(video, source);
                attached = true;
            }
            if (start) {
                start.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (start) {
                        start.classList.remove('is-hidden');
                    }
                });
            }
        }

        video.addEventListener('play', function () {
            if (!attached) {
                attachHls(video, source);
                attached = true;
            }
            if (start) {
                start.classList.add('is-hidden');
            }
        });

        if (start) {
            start.addEventListener('click', startPlayback);
        }
    });
}

document.addEventListener('DOMContentLoaded', initPlayers);
