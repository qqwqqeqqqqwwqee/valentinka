"use strict";

// ВСЁ ЛИЧНОЕ МЕНЯЕТСЯ ЗДЕСЬ. Имя можно оставить пустым.
const SETTINGS = {
  name: "", // Например: "Алина".
  signature: "твоя Ксюня", // Например: "твой Саша".
  interval: 2500, // Новое приятное слово каждые 2,5 секунды.
  // Замени текст на свои слова, если хочешь. Каждый элемент — новый абзац.
  letter: [
    "Из всех случайностей моя любимая — встретить тебя.",
    "Мне нравится твой смех. Твой взгляд. То, как ты рассказываешь о том, что любишь. И даже те мелочи, которых ты сама, наверное, не замечаешь.",
    "Рядом с тобой не нужно придумывать ничего особенного. Даже самый обычный день уже становится лучше.",
    "Пусть эта маленькая валентинка напоминает тебе: ты невероятный. И я очень рад, что ты есть."
  ],
  compliments: [
    "Твоя улыбка — отдельный вид магии",
    "Ты красивее всех моих планов",
    "С тобой хочется быть собой",
    "Моя любимая случайность",
    "У тебя самые тёплые объятия",
    "Ты — тот самый человек",
    "В твоих глазах уютно",
    "Ты делаешь мой мир добрее",
    "Твой смех — мой любимый звук",
    "Ты невероятно красивый",
    "С тобой даже тишина особенная",
    "Ты — моя хорошая мысль",
    "У тебя огромное сердце",
    "Хочу собирать с тобой моменты",
    "Ты прекрасен. Даже сонный",
    "Ты — причина улыбнуться",
    "Обожаю твои маленькие странности",
    "Ты светишься изнутри",
    "С тобой жизнь чуть волшебнее",
    "Ты лучше любого совпадения",
    "Мне нравится всё твоё настоящее",
    "Хочется держать тебя за руку",
    "Рядом с тобой — моё любимое место",
    "Ты заслуживаешь всей нежности"
  ]
};

const $ = (id) => document.getElementById(id);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const intro = $("intro");
const reveal = $("reveal");
const field = $("compliment-field");
const dialog = $("letter-dialog");
let opened = false;
let complimentTimer = null;
let lastSlot = -1;
let wordQueue = [];

$("signature").textContent = SETTINGS.signature;
if (SETTINGS.name.trim()) {
  $("favorite-name").textContent = `${SETTINGS.name.trim()}.`;
  document.title = `${SETTINGS.name.trim()}, это тебе ♡`;
}
$("letter-content").replaceChildren(...SETTINGS.letter.map((text) => {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  return paragraph;
}));

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function nextWord() {
  if (!wordQueue.length) wordQueue = shuffle(SETTINGS.compliments);
  return wordQueue.pop();
}

function getSlots() {
  if (window.innerWidth <= 600) {
    return [
      { x: 48, y: 5, tilt: -4 },
      { x: 52, y: 13, tilt: 3 },
      { x: 47, y: 79, tilt: -3 },
      { x: 54, y: 87, tilt: 4 }
    ];
  }
  if (window.innerWidth <= 1200) {
    return [
      { x: 28, y: 6, tilt: -5 },
      { x: 74, y: 13, tilt: 5 },
      { x: 23, y: 80, tilt: -4 },
      { x: 73, y: 87, tilt: 4 }
    ];
  }
  return [
    { x: 17, y: 18, tilt: -7 },
    { x: 82, y: 24, tilt: 6 },
    { x: 15, y: 46, tilt: -4 },
    { x: 84, y: 54, tilt: 5 },
    { x: 22, y: 76, tilt: -5 },
    { x: 78, y: 82, tilt: 4 }
  ];
}

function addCompliment(manual = false) {
  const slots = getSlots();
  const occupied = new Set([...field.children].map((node) => Number(node.dataset.slot)));
  const freeSlots = slots.map((_, index) => index).filter((index) => !occupied.has(index) && index !== lastSlot);
  if (!freeSlots.length) {
    if (!manual) return;
    const oldest = field.firstElementChild;
    if (oldest) oldest.remove();
    return addCompliment(false);
  }
  const index = freeSlots[Math.floor(Math.random() * freeSlots.length)];
  const slot = slots[index];
  lastSlot = index;
  const card = document.createElement("div");
  card.className = "compliment";
  card.dataset.slot = String(index);
  card.style.setProperty("--x", `${slot.x}%`);
  card.style.setProperty("--y", `${slot.y}%`);
  card.style.setProperty("--tilt", `${slot.tilt}deg`);
  const heart = document.createElement("span");
  heart.textContent = ["♡", "✦", "♥"][Math.floor(Math.random() * 3)];
  const text = nextWord();
  card.append(heart, document.createTextNode(text));
  field.append(card);
  // Длинные фразы не должны вылезать за края телефона.
  const width = field.clientWidth;
  const halfCard = card.offsetWidth / 2 + 12;
  const x = Math.max(halfCard, Math.min(width - halfCard, width * slot.x / 100));
  card.style.setProperty("--x", `${x}px`);
  if (card.offsetWidth > width - 24) {
    card.style.whiteSpace = "normal";
    card.style.width = `${width - 32}px`;
    card.style.maxWidth = `${width - 32}px`;
    card.style.textAlign = "center";
    card.style.setProperty("--x", "50%");
  }
  if (manual) $("spoken-compliment").textContent = text;
  window.setTimeout(() => card.remove(), reducedMotion.matches ? 8500 : 9000);
}

function startCompliments() {
  if (complimentTimer !== null || document.hidden || !opened) return;
  complimentTimer = window.setInterval(() => {
    if (!dialog.open) addCompliment();
  }, SETTINGS.interval);
}

function burst(x, y, count = 18) {
  if (reducedMotion.matches) return;
  const colors = ["#f5abc6", "#ffe2cc", "#d784a8", "#e5b695"];
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "burst-heart";
    heart.textContent = i % 4 === 0 ? "✦" : "♥";
    const angle = Math.random() * Math.PI * 2;
    const distance = 65 + Math.random() * 160;
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    heart.style.setProperty("--dy", `${Math.sin(angle) * distance - 70}px`);
    heart.style.setProperty("--rotation", `${Math.random() * 100 - 50}deg`);
    heart.style.setProperty("--size", `${10 + Math.random() * 17}px`);
    heart.style.setProperty("--color", colors[i % colors.length]);
    $("burst-layer").append(heart);
    heart.addEventListener("animationend", () => heart.remove(), { once: true });
  }
}

$("open-envelope").addEventListener("click", (event) => {
  if (opened) return;
  opened = true;
  event.currentTarget.disabled = true;
  intro.classList.add("opening");
  const rect = event.currentTarget.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + 100, 26);
  window.setTimeout(() => intro.classList.add("leaving"), reducedMotion.matches ? 0 : 1050);
  window.setTimeout(() => {
    intro.hidden = true;
    reveal.hidden = false;
    window.requestAnimationFrame(() => {
      reveal.classList.add("visible");
      $("more-love").focus({ preventScroll: true });
      addCompliment();
      window.setTimeout(() => addCompliment(), 1000);
      startCompliments();
    });
  }, reducedMotion.matches ? 20 : 1650);
});

$("more-love").addEventListener("click", (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  addCompliment(true);
});

$("read-letter").addEventListener("click", () => dialog.showModal());
$("close-letter").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener("close", () => $("read-letter").focus({ preventScroll: true }));
document.querySelector(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  burst(event.clientX || 45, event.clientY || 35, 12);
});

// Ненавязчивая музыка без скачивания файлов: мягкие ноты синтезируются браузером.
let audioContext = null;
let musicBus = null;
let musicTimer = null;
let musicOn = false;
let melodyStep = 0;
const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 440, 523.25, 659.25, 523.25, 392, 493.88, 587.33, 493.88];

function playNote(frequency, time, duration, volume) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + .045);
  gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
  oscillator.connect(gain);
  gain.connect(musicBus);
  oscillator.start(time);
  oscillator.stop(time + duration + .1);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}

function musicTick() {
  if (!musicOn || document.hidden || !audioContext || audioContext.state !== "running") return;
  const time = audioContext.currentTime + .04;
  const frequency = melody[melodyStep % melody.length];
  playNote(frequency, time, 2.3, .09);
  if (melodyStep % 4 === 0) {
    playNote(frequency / 4, time, 3.6, .12);
    playNote(frequency / 2, time + .09, 3.2, .045);
  }
  melodyStep++;
}

$("sound-button").addEventListener("click", async () => {
  const button = $("sound-button");
  button.disabled = true;
  try {
    if (!audioContext) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error("Audio unavailable");
      audioContext = new Audio();
      musicBus = audioContext.createGain();
      musicBus.gain.value = .7;
      musicBus.connect(audioContext.destination);
    }
    musicOn = !musicOn;
    if (musicOn) {
      await audioContext.resume();
      musicTick();
      musicTimer = window.setInterval(musicTick, 780);
    } else {
      window.clearInterval(musicTimer);
      musicTimer = null;
      await audioContext.suspend();
    }
    button.setAttribute("aria-pressed", String(musicOn));
    button.setAttribute("aria-label", musicOn ? "Выключить музыку" : "Включить музыку");
    $("sound-label").textContent = musicOn ? "музыка включена" : "добавить музыку";
  } catch {
    musicOn = false;
    window.clearInterval(musicTimer);
    $("sound-label").textContent = "пока без музыки ♡";
  } finally {
    button.disabled = false;
  }
});

// Светящиеся пылинки на фоне. Лимит частиц и FPS щадит телефон.
const canvas = $("sparkles");
const context = canvas.getContext("2d");
let particles = [];
let animationFrame = null;
let lastFrame = 0;
let canvasWidth = 0;
let canvasHeight = 0;

function resizeCanvas() {
  if (!context) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: canvasWidth < 600 ? 34 : 65 }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    radius: .4 + Math.random() * 1.3,
    speed: .1 + Math.random() * .22,
    alpha: .12 + Math.random() * .38,
    phase: Math.random() * Math.PI * 2
  }));
  drawParticles(0, false);
}

function drawParticles(time, move = true) {
  if (!context) return;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  for (const particle of particles) {
    if (move) {
      particle.y -= particle.speed;
      particle.x += Math.sin(time * .0004 + particle.phase) * .08;
      if (particle.y < -5) particle.y = canvasHeight + 5;
    }
    const alpha = particle.alpha * (.65 + Math.sin(time * .001 + particle.phase) * .35);
    context.beginPath();
    context.fillStyle = `rgba(255, 210, 219, ${alpha})`;
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }
}

function animate(time) {
  if (time - lastFrame > 32) {
    drawParticles(time);
    lastFrame = time;
  }
  animationFrame = window.requestAnimationFrame(animate);
}

function startParticles() {
  if (!context || reducedMotion.matches || document.hidden || animationFrame !== null) return;
  animationFrame = window.requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  field.replaceChildren();
  lastSlot = -1;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
    window.clearInterval(complimentTimer);
    complimentTimer = null;
    if (audioContext && musicOn) audioContext.suspend().catch(() => {});
  } else {
    startParticles();
    startCompliments();
    if (audioContext && musicOn) audioContext.resume().catch(() => {});
  }
});
reducedMotion.addEventListener("change", () => {
  window.cancelAnimationFrame(animationFrame);
  animationFrame = null;
  if (reducedMotion.matches) drawParticles(0, false);
  else startParticles();
});
resizeCanvas();
startParticles();
