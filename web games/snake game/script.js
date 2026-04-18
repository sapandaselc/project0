const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Arena size
canvas.width = 800;
canvas.height = 400;

const box = 20;
let snake;
let direction;
let food;
let score;
let gameSpeed;
let isGameOver = false;
let lastTime = 0;
let moveDelay = 0;
let glowWave = 0;
let glowing = false;

let showInstructions = true; // Show at game start

function startGame() {
  snake = [{ x: 9 * box, y: 10 * box, glowTimer: 0 }];
  direction = null;
  score = 0;
  gameSpeed = 150;
  isGameOver = false;
  lastTime = 0;
  moveDelay = 0;
  glowing = false;
  glowWave = 0;
  showInstructions = false; // Remove instructions once game starts

  food = randomFood();
  requestAnimationFrame(gameLoop);
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && isGameOver) {
    showInstructions = true; // Show instructions again on restart
    startGame();
  } else {
    directionControl(event);
  }
});

function directionControl(event) {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

function gameLoop(timestamp) {
  if (isGameOver) return;

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  moveDelay += deltaTime;

  if (moveDelay >= gameSpeed) {
    moveSnake();
    moveDelay = 0;
  }

  // Glow wave logic
  if (glowing) {
    glowWave += deltaTime;
    for (let i = 0; i < snake.length; i++) {
      const delay = i * 50;
      if (glowWave > delay && glowWave < delay + 500) snake[i].glowTimer = 1;
      else if (glowWave >= delay + 500) snake[i].glowTimer = 0;
    }
    if (glowWave > snake.length * 50 + 500) {
      glowing = false;
      glowWave = 0;
    }
  }

  drawGame();
  requestAnimationFrame(gameLoop);
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔹 Neon glowing text above the border
  const time = Date.now() / 200; // controls pulse speed
  const glowIntensity = 10 + Math.sin(time) * 10; // pulsating glow

  /* Draw Snake Logo
  ctx.fillStyle = "#00bfff"; // sky blue
  ctx.font = "50px Arial Black";
  ctx.textAlign = "center";
  ctx.shadowBlur = glowIntensity;
  ctx.shadowColor = "#00bfff";
  ctx.fillText("SNAKE GAME", canvas.width / 2,50); */ //above canvas border

  // Instructions
  if (showInstructions || isGameOver) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.shadowBlur = glowIntensity / 2;
    ctx.shadowColor = "#00bfff";
    ctx.fillText("Use Arrow Keys to Play", canvas.width / 2, 70);
  }

  ctx.shadowBlur = 0; // reset for game elements

  // Draw glowing circular food
  const glowSize = 15 + Math.sin(Date.now() / 200) * 5;
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, glowSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "red";
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;

  // Draw snake with head-to-tail glow
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    if (segment.glowTimer > 0) {
      ctx.fillStyle = "#ffff66";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ffff99";
    } else {
      ctx.fillStyle = "#ffcc00";
      ctx.shadowBlur = 0;
    }
    ctx.fillRect(segment.x, segment.y, box, box);
  }

  ctx.shadowBlur = 0;

  // Draw score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 10, canvas.height - 10);
}


function moveSnake() {
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  if (snakeX === food.x && snakeY === food.y) {
    score++;
    food = randomFood();
    if (gameSpeed > 60) gameSpeed -= 5;
    glowing = true;
    glowWave = 0;
  } else {
    snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY, glowTimer: 0 };

  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    isGameOver = true;
    ctx.fillStyle = "white";
    ctx.font = "25px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over! Press Enter to Restart", canvas.width / 2, canvas.height / 2);
    return;
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  return false;
}

// Start game
startGame();
