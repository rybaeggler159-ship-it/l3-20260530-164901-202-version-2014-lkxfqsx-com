import { H as Hls } from "./hls-vendor.js";

document.addEventListener("DOMContentLoaded", function () {
  const players = Array.from(document.querySelectorAll(".js-hls-player"));

  players.forEach(function (video) {
    const source = video.dataset.hlsSrc;
    const shell = video.closest(".video-shell");
    const launchButton = shell ? shell.querySelector("[data-player-launch]") : null;

    if (!source) {
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          console.error("HLS fatal error", data);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    }

    if (launchButton) {
      launchButton.addEventListener("click", function () {
        video.play().then(function () {
          if (shell) {
            shell.classList.add("is-playing");
          }
        }).catch(function (error) {
          console.error("Video play failed", error);
          if (shell) {
            shell.classList.add("is-playing");
          }
          video.controls = true;
        });
      });
    }

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });
  });
});
