// 소리 파일 없이 Web Audio로 직접 작곡한 밝은 배경 음악을 반복 재생한다.
// 장면이 바뀌어도 음악과 끄기 설정이 이어지도록 모듈 하나가 상태를 가진다.

const STEP_SECONDS = 60 / 132 / 2; // 132 BPM, 8분음표 한 칸
const LOOKAHEAD_SECONDS = 0.15;
const LEVELS = { menu: 0.2, game: 0.08 };

// 8분음표 8칸 = 1마디. null은 쉼표. (MIDI 음 번호: 72 = 도5)
const MELODY = [
  76, 79, 84, 79, 81, 79, 76, null,
  74, 79, 83, 79, 81, 79, 74, null,
  72, 76, 81, 76, 79, 76, 72, 76,
  77, 81, 84, 81, 79, 77, 76, 74,
  76, null, 76, 79, 84, null, 83, 81,
  79, null, 74, 79, 83, null, 81, 79,
  81, null, 77, 81, 84, 83, 81, 79,
  77, 76, 74, 71, 72, null, null, null,
];
// 마디마다 베이스 근음: 도 솔 라 파 / 도 솔 파 솔
const BASS_ROOTS = [48, 43, 45, 41, 48, 43, 41, 43];
// 마디 안 베이스 리듬: [칸, 근음에서 올릴 반음 수]
const BASS_PATTERN = [[0, 0], [2, 12], [4, 7], [6, 12]];

let context = null;
let musicGain = null;
let timer = null;
let step = 0;
let nextTime = 0;
let level = 'menu';
let muted = false;

function frequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function playNote(note, time, { type, duration, volume }) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency(note), time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(gain).connect(musicGain);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.02);
}

function scheduleStep(index, time) {
  const note = MELODY[index];
  const bar = Math.floor(index / 8);
  const beat = index % 8;

  if (note !== null) {
    playNote(note, time, { type: 'triangle', duration: STEP_SECONDS * 0.9, volume: 0.5 });
  }

  BASS_PATTERN.forEach(([patternBeat, offset]) => {
    if (patternBeat === beat) {
      playNote(BASS_ROOTS[bar] + offset, time, { type: 'sine', duration: STEP_SECONDS * 1.6, volume: 0.45 });
    }
  });
}

// 조금 앞의 음까지 미리 예약해, 타이머가 늦어도 박자가 흔들리지 않게 한다.
function schedule() {
  if (context.state !== 'running' || muted) {
    return;
  }

  nextTime = Math.max(nextTime, context.currentTime + 0.05);

  while (nextTime < context.currentTime + LOOKAHEAD_SECONDS) {
    scheduleStep(step, nextTime);
    step = (step + 1) % MELODY.length;
    nextTime += STEP_SECONDS;
  }
}

function applyVolume() {
  const target = muted ? 0.0001 : LEVELS[level];

  musicGain.gain.cancelScheduledValues(context.currentTime);
  musicGain.gain.setTargetAtTime(target, context.currentTime, 0.1);
}

// 장면마다 부른다. level: 'menu'(첫 화면·결과 화면) 또는 'game'(플레이 중, 작게)
export function playMusic(scene, newLevel) {
  const sceneContext = scene.sound && scene.sound.context;

  if (!sceneContext) {
    return;
  }

  if (!context) {
    context = sceneContext;
    musicGain = context.createGain();
    musicGain.gain.value = 0.0001;
    musicGain.connect(context.destination);
    timer = setInterval(schedule, 25);
  }

  level = newLevel;
  applyVolume();

  // 브라우저는 사용자가 처음 클릭하기 전까지 소리를 막는다.
  if (context.state === 'suspended') {
    scene.input.once('pointerdown', () => context.resume());
    scene.input.keyboard?.once('keydown', () => context.resume());
  }
}

export function isMusicMuted() {
  return muted;
}

export function toggleMusic() {
  muted = !muted;

  if (context) {
    applyVolume();
  }

  return muted;
}
