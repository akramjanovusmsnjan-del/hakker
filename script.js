
const matrix = document.getElementById("matrix");
const ctx = matrix.getContext("2d");

const glitch = document.getElementById("glitch");
const gctx = glitch.getContext("2d");

const floatingCodes = document.getElementById("floatingCodes");
const glitchLines = document.getElementById("glitchLines");
const randomShapes = document.getElementById("randomShapes");

const progress = document.getElementById("loadingProgress");
const percent = document.getElementById("loadingPercent");
const errorCode = document.getElementById("errorCode");
const connection = document.getElementById("connection");
const warningText = document.getElementById("warningText");
const bottomMessage = document.getElementById("bottomMessage");
const memoryDump = document.getElementById("memoryDump");
const packetLog = document.getElementById("packetLog");
const signalBars = document.getElementById("signalBars");
const signalNumber = document.getElementById("signalNumber");
const flash = document.getElementById("flash");

let width = innerWidth;
let height = innerHeight;
let columns = [];
let animationFrame = 0;
let lastGlitch = 0;
let lastCode = 0;
let lastShape = 0;
let lastLine = 0;
let lastMessage = 0;
let loadValue = 0;
let flashTimeout;
let lastTime = 0;

const GREEN = "#00ff41";
const CHARACTERS =
  "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@<>[]{}:/\\|░▒▓█";
const HEX = "0123456789ABCDEF";

const messages = [
  "SYSTEM FAILURE DETECTED...",
  "MEMORY ACCESS VIOLATION",
  "UNKNOWN PROCESS RUNNING",
  "CONNECTION INTERRUPTED",
  "READING MEMORY BLOCKS...",
  "ERROR: SYSTEM NOT RESPONDING",
  "DATA STREAM CORRUPTED",
  "RECONSTRUCTING FILE SYSTEM...",
  "WARNING: INVALID RESPONSE",
  "SIGNAL LOST // RETRYING...",
  "CRITICAL EXCEPTION 0x0000F4A2",
  "BUFFER OVERFLOW DETECTED",
  "PROCESS TERMINATED UNEXPECTEDLY",
  "RECOVERY FAILED // RETRYING",
  "KERNEL RESPONSE: UNKNOWN",
  "SCANNING MEMORY SECTORS...",
  "PACKET LOSS DETECTED",
  "REBOOT SEQUENCE INTERRUPTED"
];

const warnings = [
  "DIQQAT: MA'LUMOTLAR O'QILMOQDA...",
  "XATO: TIZIM JAVOB BERMAYAPTI",
  "ALOQA UZILDI... QAYTA URINISH",
  "XOTIRA BLOKI BUZILGAN",
  "NOMA'LUM JARAYON ANIQLANDI",
  "QAYTA TIKLASH AMALI BAJARILMOQDA...",
  "KRITIK XATO: 0x00FF12",
  "SIGNAL YO'QOLDI...",
  "TIZIM BARQARORLIGI: 0%",
  "XATO: QAYTA URINISH MUVAFFAQIYATSIZ"
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHex(length = 8) {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += HEX[randomInt(0, HEX.length - 1)];
  }

  return result;
}

function randomText(length = 20) {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += CHARACTERS[randomInt(0, CHARACTERS.length - 1)];
  }

  return result;
}

function resize() {
  width = innerWidth;
  height = innerHeight;

  const dpr = Math.min(devicePixelRatio || 1, 2);

  [matrix, glitch].forEach(canvas => {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  });

  columns = Array.from(
    { length: Math.ceil(width / 16) },
    () => Math.random() * -height / 16
  );

  createMemoryDump();
  createSignalBars();
}

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
  ctx.fillRect(0, 0, width, height);

  ctx.font = "13px Consolas, monospace";

  for (let i = 0; i < columns.length; i++) {
    const char = CHARACTERS[randomInt(0, CHARACTERS.length - 1)];
    const x = i * 16;
    const y = columns[i] * 16;

    ctx.fillStyle = Math.random() > 0.97 ? "#caffd4" : GREEN;
    ctx.fillText(char, x, y);

    if (y > height && Math.random() > 0.96) {
      columns[i] = 0;
    }

    columns[i] += Math.random() * 1.4 + 0.5;
  }
}

function drawRandomGlitches(time) {
  gctx.clearRect(0, 0, width, height);

  // Tasodifiy gorizontal uzilishlar
  if (time - lastGlitch > randomInt(100, 400)) {
    lastGlitch = time;

    const count = randomInt(1, 5);

    for (let i = 0; i < count; i++) {
      const y = randomInt(0, height);
      const x = randomInt(0, width);
      const w = randomInt(20, width * 0.6);

      gctx.fillStyle = Math.random() > 0.4
        ? "rgba(0,255,65,0.75)"
        : "rgba(0,120,25,0.85)";

      gctx.fillRect(x, y, w, randomInt(1, 3));
    }
  }

  // Qisqa tasvir siljishi
  if (Math.random() > 0.985) {
    const y = randomInt(0, height);
    const h = randomInt(2, 18);
    const shift = randomInt(-20, 20);

    try {
      const strip = gctx.getImageData(0, y, width, h);
      gctx.clearRect(0, y, width, h);
      gctx.putImageData(strip, shift, y);
    } catch (error) {
      // Ayrim brauzerlarda tasvir nusxalash xatosi bo‘lsa,
      // boshqa animatsiyalar davom etadi.
    }
  }
}

function spawnCode() {
  const el = document.createElement("div");
  el.className = "float-code";

  const type = randomInt(0, 4);

  if (type === 0) {
    el.textContent = "0x" + randomHex(8) + " // " + randomText(12);
  } else if (type === 1) {
    el.textContent = "[ERR_" + randomHex(4) + "] " + randomText(9);
  } else if (type === 2) {
    el.textContent = ">> " + randomText(randomInt(10, 28));
  } else if (type === 3) {
    el.textContent = "0" + randomHex(2) + ":" + randomHex(4) +
      " :: " + randomText(7);
  } else {
    el.textContent = "MEM_" + randomHex(6) + " // ACCESS DENIED";
  }

  el.style.left = randomInt(0, Math.max(0, width - 250)) + "px";
  el.style.top = randomInt(65, Math.max(70, height - 80)) + "px";
  el.style.fontSize = randomInt(9, 14) + "px";
  el.style.animationDuration = randomInt(1, 4) + "s";

  floatingCodes.appendChild(el);

  setTimeout(() => el.remove(), 4200);
}

function spawnGlitchLine() {
  const el = document.createElement("div");
  el.className = "glitch-line";

  el.style.top = randomInt(0, height) + "px";
  el.style.left = randomInt(0, width) + "px";
  el.style.width = randomInt(30, Math.max(40, width * 0.5)) + "px";
  el.style.height = randomInt(1, 3) + "px";
  el.style.animationDuration = (Math.random() * 0.7 + 0.2) + "s";

  glitchLines.appendChild(el);

  setTimeout(() => el.remove(), 1000);
}

function spawnBlock() {
  const el = document.createElement("div");
  el.className = "glitch-block";

  el.style.left = randomInt(0, width) + "px";
  el.style.top = randomInt(0, height) + "px";
  el.style.width = randomInt(4, 75) + "px";
  el.style.height = randomInt(2, 24) + "px";

  glitchLines.appendChild(el);
  setTimeout(() => el.remove(), 500);
}

function spawnShape() {
  const el = document.createElement("div");
  const types = ["circle", "diamond", "cross"];
  const type = types[randomInt(0, types.length - 1)];

  el.className = "shape " + type;
  el.style.left = randomInt(0, Math.max(0, width - 80)) + "px";
  el.style.top = randomInt(50, Math.max(60, height - 80)) + "px";

  const size = randomInt(15, 90);
  el.style.width = size + "px";
  el.style.height = size + "px";
  el.style.animationDuration = randomInt(1, 3) + "s";

  randomShapes.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function createMemoryDump() {
  memoryDump.replaceChildren();

  for (let i = 0; i < 14; i++) {
    const line = document.createElement("div");
    line.className = "memory-line";
    line.textContent =
      "0x" + randomHex(4) + "  " +
      randomHex(2) + " " +
      randomHex(2) + " " +
      randomHex(2) + " " +
      randomHex(2) + " " +
      randomText(5);

    memoryDump.appendChild(line);
  }
}

function createSignalBars() {
  signalBars.replaceChildren();

  for (let i = 0; i < 26; i++) {
    const bar = document.createElement("div");
    bar.className = "signal-bar";
    bar.style.animationDelay = Math.random() + "s";
    bar.style.height = randomInt(10, 100) + "%";
    signalBars.appendChild(bar);
  }
}

function updatePacketLog() {
  packetLog.replaceChildren();

  for (let i = 0; i < 5; i++) {
    const line = document.createElement("div");
    line.className = "packet-line";

    const statuses = [
      "RECEIVING",
      "FAILED",
      "UNKNOWN",
      "RETRYING",
      "CORRUPTED",
      "TIMEOUT"
    ];

    line.textContent =
      "PKT_" + randomHex(4) + " :: " +
      statuses[randomInt(0, statuses.length - 1)];

    packetLog.appendChild(line);
  }
}

function updateErrorDetails() {
  errorCode.textContent = "0x" + randomHex(8);

  const states = [
    "UNSTABLE",
    "FAILED",
    "UNKNOWN",
    "LOST",
    "RETRYING",
    "CORRUPTED"
  ];

  connection.textContent = states[randomInt(0, states.length - 1)];
  warningText.textContent =
    warnings[randomInt(0, warnings.length - 1)];

  signalNumber.textContent = randomInt(0, 99) + "." +
    randomInt(10, 99) + "%";

  bottomMessage.textContent =
    messages[randomInt(0, messages.length - 1)];

  updatePacketLog();
}

function updateLoading() {
  loadValue += randomInt(3, 17);

  if (loadValue >= 100) {
    loadValue = randomInt(1, 12);

    warningText.textContent =
      "XATO: QAYTA TIKLASH AMALI BAJARILMADI";
    bottomMessage.textContent = "RECOVERY FAILED // RESTARTING...";
  }

  progress.style.width = loadValue + "%";
  percent.textContent = loadValue + "%";
}

function flashScreen() {
  flash.style.opacity = "0.12";

  clearTimeout(flashTimeout);
  flashTimeout = setTimeout(() => {
    flash.style.opacity = "0";
  }, 70);
}

function animationLoop(time) {
  if (time - lastTime >= 30) {
    drawMatrix();
    drawRandomGlitches(time);
    lastTime = time;
  }

  if (time - lastCode > 180) {
    spawnCode();
    lastCode = time;
  }

  if (time - lastLine > 100) {
    spawnGlitchLine();

    if (Math.random() > 0.55) {
      spawnBlock();
    }

    lastLine = time;
  }

  if (time - lastShape > 650) {
    if (Math.random() > 0.2) {
      spawnShape();
    }

    lastShape = time;
  }

  if (Math.random() > 0.997) {
    flashScreen();
  }

  animationFrame = requestAnimationFrame(animationLoop);
}

function startSimulation() {
  resize();

  updateErrorDetails();
  updateLoading();

  setInterval(updateErrorDetails, 1700);
  setInterval(updateLoading, 900);
  setInterval(createMemoryDump, 2300);
  setInterval(() => {
    document.getElementById("systemTime").textContent =
      new Date().toLocaleTimeString("uz-UZ", { hour12: false });
  }, 1000);

  setInterval(() => {
    if (Math.random() > 0.3) {
      spawnCode();
      spawnGlitchLine();
    }
  }, 250);

  window.addEventListener("resize", resize);

  animationFrame = requestAnimationFrame(animationLoop);
}

startSimulation();
