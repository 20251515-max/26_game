// 소리 파일 없이 Web Audio로 효과음을 만든다.
const MASTER_VOLUME = 0.5;

let noiseBuffer = null;

function getContext(scene) {
  const context = scene.sound && scene.sound.context;

  if (!context) {
    return null;
  }

  if (context.state === 'suspended') {
    context.resume();
  }

  return context;
}

// 반복되는 소리가 똑같이 들리지 않게 높낮이를 조금 흔든다.
function vary(value, amount = 0.08) {
  return value * (1 + (Math.random() * 2 - 1) * amount);
}

function envelope(context, gain, start, duration, volume) {
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume * MASTER_VOLUME, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
}

function tone(context, { type = 'sine', from, to = from, delay = 0, duration, volume }) {
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, start);

  if (to !== from) {
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
  }

  envelope(context, gain, start, duration, volume);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noise(context, { frequency, delay = 0, duration, volume }) {
  if (!noiseBuffer) {
    noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);

    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  const start = context.currentTime + delay;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = noiseBuffer;
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  filter.Q.value = 1.5;
  envelope(context, gain, start, duration, volume);
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(start);
  source.stop(start + duration + 0.02);
}

function melody(context, notes, { type = 'triangle', step, duration, volume }) {
  notes.forEach((note, index) => {
    tone(context, { type, from: note, delay: index * step, duration, volume });
  });
}

const SOUNDS = {
  // 버튼: 말랑한 "뽁"
  button: (context) => tone(context, { from: 620, to: 320, duration: 0.09, volume: 0.3 }),
  // 연습 안내 다음: 가벼운 "톡"
  next: (context) => tone(context, { type: 'triangle', from: 900, duration: 0.06, volume: 0.25 }),
  // 순서가 틀린 클릭: 아주 작은 "톡"
  error: (context) => tone(context, { type: 'triangle', from: 300, duration: 0.05, volume: 0.15 }),
  // 반죽 놓기: 말랑하게 떨어지는 "퐁"
  doughPlace: (context) => tone(context, { from: 240, to: 480, duration: 0.14, volume: 0.35 }),
  // 반죽 밀기: 짧고 작은 "드륵"
  roll: (context) => noise(context, { frequency: vary(500, 0.15), duration: 0.12, volume: 0.25 }),
  // 다 밀었을 때: 올라가는 "띵"
  rollDone: (context) => {
    tone(context, { from: 880, delay: 0.1, duration: 0.25, volume: 0.2 });
    tone(context, { from: 1320, delay: 0.1, duration: 0.25, volume: 0.1 });
  },
  // 과일 올리기: 상큼한 "똑"
  fruit: (context) => tone(context, { from: 700, to: 1050, duration: 0.08, volume: 0.3 }),
  // 반죽 감싸기: 쫀득한 "꾹"
  wrap: (context) => tone(context, { from: vary(280), to: vary(180), duration: 0.1, volume: 0.25 }),
  // 모찌 완성: 통통 튀는 "뾰롱"
  complete: (context) => tone(context, { from: 500, to: 1200, duration: 0.16, volume: 0.3 }),
  // 판매 성공: 동전 "짤랑"
  sell: (context) => melody(context, [1318, 1760], { type: 'square', step: 0.07, duration: 0.18, volume: 0.12 }),
  // 새 손님: 문 종 "딸랑"
  customer: (context) => {
    tone(context, { from: 1568, duration: 0.35, volume: 0.15 });
    tone(context, { from: 2093, delay: 0.06, duration: 0.3, volume: 0.08 });
  },
  // 주문과 다른 모찌: 부드러운 "뿌잉"
  wrong: (context) => tone(context, { type: 'triangle', from: 500, to: 240, duration: 0.3, volume: 0.3 }),
  // 과일 씻기: 물방울 "보글"
  wash: (context) => {
    noise(context, { frequency: vary(1800, 0.15), duration: 0.15, volume: 0.18 });
    tone(context, { from: vary(900), to: vary(1400), delay: 0.03, duration: 0.07, volume: 0.15 });
  },
  // 과일 자르기: 짧은 "싹"
  cut: (context) => {
    noise(context, { frequency: vary(4000, 0.1), duration: 0.07, volume: 0.25 });
    tone(context, { type: 'triangle', from: 260, to: 160, delay: 0.05, duration: 0.06, volume: 0.25 });
  },
  // 손질 완료: 경쾌한 "띠링"
  prepDone: (context) => melody(context, [784, 1047], { type: 'sine', step: 0.08, duration: 0.22, volume: 0.25 }),
  // 남은 10초: 급한 "똑딱"
  tick: (context) => tone(context, { type: 'square', from: 1000, duration: 0.04, volume: 0.08 }),
  // 성공: 짧은 팡파르
  success: (context) => melody(context, [523, 659, 784, 1047], { step: 0.12, duration: 0.3, volume: 0.3 }),
  // 실패: 아쉽게 내려가는 멜로디
  fail: (context) => melody(context, [523, 440, 349], { step: 0.18, duration: 0.35, volume: 0.3 }),
};

export function playSound(scene, name) {
  const context = getContext(scene);

  if (context) {
    SOUNDS[name](context);
  }
}
