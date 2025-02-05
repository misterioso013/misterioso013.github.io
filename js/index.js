/* ========================
   Custom Cursor
=========================== */
const customCursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', (e) => {
  customCursor.style.top = e.clientY + 'px';
  customCursor.style.left = e.clientX + 'px';
});

/* ========================
   Efeito de partículas
=========================== */
const canvas = document.querySelector('.particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;
  }
  draw() {
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = Array(100).fill().map(() => new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ========================
   Sons via Howler (instâncias únicas)
=========================== */
const hoverSound = new Howl({
  src: ['/sounds/transition.mp3'],
  volume: 0.3
});
const clickSound = new Howl({
  src: ['/sounds/click.mp3'],
  volume: 0.5
});

/* Áudio de fundo inicial (em loop) */
const backgroundMusic = new Howl({
  src: ['/sounds/background.mp3'],
  volume: 0.2,
  loop: true
});
backgroundMusic.play();

/* ========================
   Modal genérico
=========================== */
function showModal(message) {
  const modal = document.getElementById('modalMessage');
  document.getElementById('modalContent').innerHTML = message;
  modal.style.display = 'block';
}
function closeModal() {
  document.getElementById('modalMessage').style.display = 'none';
}

/* ========================
   Sistema de Progresso e Link Cards
=========================== */
let progress = 0;
const progressBar = document.querySelector('.progress');

document.querySelectorAll('.link-card').forEach(card => {
  card.addEventListener('click', (e) => {
    e.preventDefault();
    progress += 25;
    progressBar.style.width = `${progress}%`;

    if (progress >= 100) {
      document.querySelector('.header h1').classList.add('secret-unlocked');
      setTimeout(() => {
        showModal('🎉 Secret Unlocked: Level Up!');
      }, 500);
    }

    clickSound.play();
    window.open(card.dataset.link, '_blank');
  });
});

/* Efeito de hover */
document.querySelectorAll('.link-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    hoverSound.play();
  });
});

/* ========================
   Efeito de digitação no título
=========================== */
const title = document.querySelector('.header h1');
const originalText = title.innerText;
title.innerText = '';
let i = 0;
const typeWriter = setInterval(() => {
  title.innerText += originalText[i];
  i++;
  if (i >= originalText.length) clearInterval(typeWriter);
}, 100);

/* ========================
   Sistema de Puzzle
=========================== */
const puzzleContainer = document.querySelector('.puzzle-container');
const puzzleGrid = document.querySelector('.puzzle-grid');
const puzzleClose = document.querySelector('.puzzle-close');
const linksContainer = document.querySelector('.links-container');

// Bloqueia os links até que o puzzle seja resolvido ou cancelado
linksContainer.style.opacity = '0.3';
linksContainer.style.pointerEvents = 'none';

function generatePuzzle() {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, ''];
  numbers.sort(() => Math.random() - 0.5);
  puzzleGrid.innerHTML = '';
  numbers.forEach(num => {
    const tile = document.createElement('div');
    tile.classList.add('puzzle-tile');
    tile.textContent = num;
    tile.dataset.value = num;
    tile.addEventListener('click', handleTileClick);
    puzzleGrid.appendChild(tile);
  });
}

function checkPuzzle() {
  const tiles = [...document.querySelectorAll('.puzzle-tile')];
  const values = tiles.map(tile => tile.dataset.value);
  const correctOrder = ['1', '2', '3', '4', '5', '6', '7', '8', ''];
  if (values.join(',') === correctOrder.join(',')) {
    puzzleContainer.style.display = 'none';
    linksContainer.style.opacity = '1';
    linksContainer.style.pointerEvents = 'all';
    showModal('🎉 Puzzle resolvido! Links desbloqueados!');
  }
}

function handleTileClick(e) {
  const clickedTile = e.target;
  const emptyTile = document.querySelector('.puzzle-tile[data-value=""]');
  const clickedIndex = [...puzzleGrid.children].indexOf(clickedTile);
  const emptyIndex = [...puzzleGrid.children].indexOf(emptyTile);
  const isAdjacent =
    clickedIndex === emptyIndex - 1 ||
    clickedIndex === emptyIndex + 1 ||
    clickedIndex === emptyIndex - 3 ||
    clickedIndex === emptyIndex + 3;
  if (isAdjacent) {
    [clickedTile.dataset.value, emptyTile.dataset.value] =
      [emptyTile.dataset.value, clickedTile.dataset.value];
    clickedTile.textContent = clickedTile.dataset.value;
    emptyTile.textContent = emptyTile.dataset.value;
    checkPuzzle();
  } else {
    clickedTile.classList.add('wrong');
    setTimeout(() => clickedTile.classList.remove('wrong'), 500);
  }
}

window.addEventListener('load', () => {
  puzzleContainer.style.display = 'flex';
  generatePuzzle();
});

puzzleClose.addEventListener('click', () => {
  // Se o usuário fechar o puzzle, libera os links após 5 segundos
  showModal('🚨 <span style="color:red">Apressadinho!</span><br>Links liberados em 5 segundos...');
  setTimeout(() => {
    closeModal();
    linksContainer.style.opacity = '1';
    linksContainer.style.pointerEvents = 'all';
    puzzleContainer.style.display = 'none';
  }, 5000);
});

/* ========================
   Easter Egg: Konami Code
   Sequência: ↑ ↑ ↓ ↓ ← → ← → B A
=========================== */
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let konamiIndex = 0;
document.addEventListener('keydown', (e) => {
  if (e.keyCode === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      // Ativa o light show (easter egg)
      document.body.classList.add('light-show');
      // Pausa a música original e inicia o novo som de hacker bass
      backgroundMusic.pause();
      const hackerBassSound = new Howl({
        src: ['/sounds/hacker-bass.mp3'],
        volume: 0.3,
        loop: true
      });
      hackerBassSound.play();
      showModal('🎉 Easter Egg ativado! Modo God ativado! Enjoy the light show!');
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

let lastShakeTime = 0;
let shakeCount = 0;

// Easter Egg: Shake para revelar segredo
function handleShake() {
const now = Date.now();
if (now - lastShakeTime < 1000) return;

shakeCount++;
if (shakeCount === 3) {
showModal('📱 SHAKE DETECTADO! Easter Egg Mobile Ativado!');
document.body.classList.add('light-show');
setTimeout(() => document.body.classList.remove('light-show'), 3000);
shakeCount = 0;
}
lastShakeTime = now;
}

// Detecção de movimento para shake
let lastAcceleration = { x: null, y: null, z: null };
window.addEventListener('devicemotion', (e) => {
if (!e.accelerationIncludingGravity) return;

const { x, y, z } = e.accelerationIncludingGravity;
const threshold = 15;

if (!lastAcceleration.x) {
lastAcceleration = { x, y, z };
return;
}

const deltaX = Math.abs(x - lastAcceleration.x);
const deltaY = Math.abs(y - lastAcceleration.y);
const deltaZ = Math.abs(z - lastAcceleration.z);

if ((deltaX > threshold && deltaY > threshold) ||
  (deltaX > threshold && deltaZ > threshold) ||
  (deltaY > threshold && deltaZ > threshold)) {
handleShake();
}

lastAcceleration = { x, y, z };
});

let lastTapTime = 0;
let tapCount = 0;

document.querySelector('.header').addEventListener('touchend', (e) => {
const currentTime = new Date().getTime();
const tapLength = currentTime - lastTapTime;

if (tapLength < 500 && tapLength > 0) {
tapCount++;
if (tapCount === 3) {
  showModal('👆 TOQUE TRIPLO! Easter Egg Mobile Ativado!');
  document.querySelectorAll('.link-card').forEach(card => {
    card.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
  });
  tapCount = 0;
}
} else {
tapCount = 0;
}
lastTapTime = currentTime;
});