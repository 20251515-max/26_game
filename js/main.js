import { PlayScene } from './scenes/PlayScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { StartScene } from './scenes/StartScene.js';
import { applyRingerState } from './audio/BackgroundMusic.js';
import { setRingerSilent } from './audio/RingerState.js';

export function startGame({ ringerSilent = false } = {}) {
  setRingerSilent(ringerSilent);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#fff5e8',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [StartScene, PlayScene, ResultScene],
  });

  let paused = false;

  return {
    pause() {
      if (paused) {
        return;
      }

      paused = true;
      game.loop.sleep();
      game.sound.context?.suspend();
    },
    resume({ ringerSilent: nextRingerSilent } = {}) {
      if (typeof nextRingerSilent === 'boolean') {
        setRingerSilent(nextRingerSilent);
        applyRingerState();
      }

      if (!paused) {
        return;
      }

      paused = false;
      game.loop.wake();
      game.sound.context?.resume();
    },
    onBackPressed() {
      return false;
    },
  };
}
