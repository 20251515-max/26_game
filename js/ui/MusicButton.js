import { isMusicMuted, toggleMusic } from '../audio/BackgroundMusic.js';
import { createButton } from './Widgets.js';

function label() {
  return isMusicMuted() ? '음악 켜기' : '음악 끄기';
}

// 모든 화면 오른쪽 아래의 음악 끄기/켜기 버튼
export function createMusicButton(scene) {
  const button = createButton(scene, 1115, 662, 150, 46, 0xffa9c0, label(), () => {
    toggleMusic();
    button.setLabel(label());
  });

  return button;
}
