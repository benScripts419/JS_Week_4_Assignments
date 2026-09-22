const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = HEIGHT * 0.7; 

// Tunable constants 

const GRAVITY = 2200;       
const JUMP_VELOCITY = -700; 
const BASE_SPEED = 260;     
const MAX_SPEED = 520;

// Best score 

let bestScore = 0;
try {
  bestScore = Number(localStorage.getItem('duneRunnerBest')) || 0;
} catch (err) {
  bestScore = 0;
}
bestScoreEl.textContent = bestScore;

function saveBestScore(score) {
  bestScore = Math.max(bestScore, score);
  bestScoreEl.textContent = bestScore;
  try {
    localStorage.setItem('duneRunnerBest', String(bestScore));
  } catch (err) {
  }
}

// Player 

const player = {
  x: 60,
  width: 32,
  height: 36,
  y: GROUND_Y - 36,
  velocityY: 0,
  grounded: true
};

function resetPlayer() {
  player.y = GROUND_Y - player.height;
  player.velocityY = 0;
  player.grounded = true;
}

function jump() {
  if (player.grounded) {
    player.velocityY = JUMP_VELOCITY;
    player.grounded = false;
  }
}

// Obstacles 

let obstacles = [];
let timeUntilNextObstacle = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function spawnObstacle() {
  const height = randomBetween(24, 46);
  const width = randomBetween(16, 30);
  obstacles.push({
    x: WIDTH + width,
    width,
    height,
    y: GROUND_Y - height,
    scored: false
  });
}

function scheduleNextObstacle() {
  // Spawns get a little more frequent as the game speeds up.
  const difficultyFactor = Math.max(0.55, 1 - score / 400);
  timeUntilNextObstacle = randomBetween(0.9, 1.7) * difficultyFactor;
}

// Game state 

let state = 'ready';
let score = 0;
let speed = BASE_SPEED;
let lastTimestamp = null;

function startGame() {
  obstacles = [];
  score = 0;
  speed = BASE_SPEED;
  resetPlayer();
  scheduleNextObstacle();
  state = 'playing';
  overlay.classList.add('hidden');
  scoreEl.textContent = score;
}

function endGame() {
  state = 'gameover';
  saveBestScore(score);
  overlay.classList.remove('hidden');
  overlay.querySelector('.overlay__title').textContent = 'Run over!';
  overlay.querySelector('.overlay__hint').textContent =
    `Score: ${score} — press Space to try again`;
}

function handleActionKey() {
  if (state === 'ready' || state === 'gameover') {
    startGame();
  } else if (state === 'playing') {
    jump();
  }
}


function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update(dt) {
  speed = Math.min(MAX_SPEED, BASE_SPEED + score * 6);

  
  player.velocityY += GRAVITY * dt;
  player.y += player.velocityY * dt;

  if (player.y >= GROUND_Y - player.height) {
    player.y = GROUND_Y - player.height;
    player.velocityY = 0;
    player.grounded = true;
  }

  // Obstacles 
  timeUntilNextObstacle -= dt;
  if (timeUntilNextObstacle <= 0) {
    spawnObstacle();
    scheduleNextObstacle();
  }

  for (const obstacle of obstacles) {
    obstacle.x -= speed * dt;

    if (!obstacle.scored && obstacle.x + obstacle.width < player.x) {
      obstacle.scored = true;
      score += 1;
      scoreEl.textContent = score;
    }
  }

  obstacles = obstacles.filter((o) => o.x + o.width > -10);

  // Collision detection 
  const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
  for (const obstacle of obstacles) {
    if (rectsOverlap(playerRect, obstacle)) {
      endGame();
      break;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Ground line
  ctx.strokeStyle = 'rgba(74, 55, 40, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(WIDTH, GROUND_Y);
  ctx.stroke();

  ctx.fillStyle = '#c9483c';
  drawRoundedRect(player.x, player.y, player.width, player.height, 6);
  ctx.fill();

  ctx.fillStyle = '#4a3728';
  for (const obstacle of obstacles) {
    drawRoundedRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 4);
    ctx.fill();
  }
}

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function loop(timestamp) {
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05); // cap dt to avoid big jumps
  lastTimestamp = timestamp;

  if (state === 'playing') {
    update(dt);
  }

  draw();
  requestAnimationFrame(loop);
}

// Input

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    handleActionKey();
  }
});

canvas.addEventListener('pointerdown', () => {
  handleActionKey();
});

resetPlayer();
requestAnimationFrame(loop);