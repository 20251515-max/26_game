import { startGame } from '../main.js';

function applySafeArea(safeArea) {
  if (!safeArea) {
    return;
  }

  const root = document.documentElement.style;
  root.setProperty('--safe-top', `${safeArea.top}px`);
  root.setProperty('--safe-right', `${safeArea.right}px`);
  root.setProperty('--safe-bottom', `${safeArea.bottom}px`);
  root.setProperty('--safe-left', `${safeArea.left}px`);
}

export function bootGame(sdk) {
  let game = null;
  let paused = false;
  let ringerSilent = false;

  function start({ safeArea } = {}) {
    applySafeArea(safeArea);
    game = startGame({ ringerSilent });

    if (paused) {
      game.pause();
    }
  }

  // SDK events can arrive immediately after initialization, so register them first.
  sdk.on('pause', () => {
    paused = true;
    game?.pause();
  });
  sdk.on('resume', (event) => {
    if (typeof event.ringerSilent === 'boolean') {
      ringerSilent = event.ringerSilent;
    }

    paused = false;
    game?.resume({ ringerSilent });
  });
  sdk.on('exit', () => {
    // The current game has no persistent progress to save. Keep this synchronous.
  });
  sdk.onBackPressed(() => game?.onBackPressed() === true);

  sdk.initializeAsync()
    .then((info) => {
      if (info.err) {
        start();
        return;
      }

      ringerSilent = Boolean(info.ringerSilent);
      sdk.setLoadingProgress(0);
      // Phaser currently loads no external assets, so loading completes immediately.
      sdk.setLoadingProgress(100);
      return sdk.startGameAsync().then((startInfo) => {
        if (startInfo.err) {
          start();
          return;
        }

        start(info);
      });
    })
    .catch((error) => {
      console.error('ONE store SDK boot failed:', error.reason);
      start();
    });
}
