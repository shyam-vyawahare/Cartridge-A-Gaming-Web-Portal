/* ==========================================================================
   CARTRIDGE - SNAKE
   Game logic: canvas rendering, movement loop, food spawning, collision
   detection, score tracking, best-score persistence via localStorage.
   ========================================================================== */

(function () {
  "use strict";

  const GRID_SIZE = 20; // 20x20 cells
  const CELL_SIZE = 20; // canvas is 400x400, so 20px per cell
  const INITIAL_SPEED_MS = 140;
  const BEST_SCORE_KEY = "cartridge_snake_best_score";

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const scoreCountEl = document.getElementById("score-count");
  const bestScoreEl = document.getElementById("best-score");
  const winPanel = document.getElementById("game-win");
  const finalScoreEl = document.getElementById("final-score");
  const restartBtn = document.getElementById("restart-btn");
  const dpad = document.getElementById("dpad");

  let snake = [];
  let direction = { x: 1, y: 0 };
  let pendingDirection = { x: 1, y: 0 }; // buffers the next direction until the next tick, avoids mid-frame reversal bugs
  let food = { x: 0, y: 0 };
  let score = 0;
  let bestScore = 0;
  let loopId = null;
  let gameOver = false;

  // Brand colors pulled from CSS custom properties so canvas matches the token system
  function getToken(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function loadBestScore() {
    try {
      const saved = localStorage.getItem(BEST_SCORE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch (err) {
      return 0;
    }
  }

  function saveBestScore(value) {
    try {
      localStorage.setItem(BEST_SCORE_KEY, String(value));
    } catch (err) {
      // Fail silently - best score just won't persist this session
    }
  }

  function updateStats() {
    scoreCountEl.textContent = "Score: " + score;
    bestScoreEl.textContent = "Best: " + bestScore;
  }

  function randomEmptyCell() {
    let cell;
    do {
      cell = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(function (segment) { return segment.x === cell.x && segment.y === cell.y; }));
    return cell;
  }

  function spawnFood() {
    food = randomEmptyCell();
  }

  function draw() {
    const bgPanel = getToken("--color-bg-panel");
    const pink = getToken("--color-accent-primary");
    const gold = getToken("--color-accent-secondary");
    const lavender = getToken("--color-text");

    ctx.fillStyle = bgPanel;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Food
    ctx.fillStyle = gold;
    ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

    // Snake - head in pink, body in lavender
    snake.forEach(function (segment, index) {
      ctx.fillStyle = index === 0 ? pink : lavender;
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
  }

  function tick() {
    direction = pendingDirection;

    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      endGame();
      return;
    }

    // Self collision
    if (snake.some(function (segment) { return segment.x === newHead.x && segment.y === newHead.y; })) {
      endGame();
      return;
    }

    snake.unshift(newHead);

    const ateFood = newHead.x === food.x && newHead.y === food.y;
    if (ateFood) {
      score++;
      updateStats();
      spawnFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function setDirection(x, y) {
    // Prevent reversing directly into the snake's own body
    if (direction.x === -x && direction.y === -y) return;
    pendingDirection = { x: x, y: y };
  }

  function handleKeydown(event) {
    switch (event.key) {
      case "ArrowUp": event.preventDefault(); setDirection(0, -1); break;
      case "ArrowDown": event.preventDefault(); setDirection(0, 1); break;
      case "ArrowLeft": event.preventDefault(); setDirection(-1, 0); break;
      case "ArrowRight": event.preventDefault(); setDirection(1, 0); break;
    }
  }

  function handleDpadClick(event) {
    const btn = event.target.closest("[data-direction]");
    if (!btn) return;

    switch (btn.getAttribute("data-direction")) {
      case "up": setDirection(0, -1); break;
      case "down": setDirection(0, 1); break;
      case "left": setDirection(-1, 0); break;
      case "right": setDirection(1, 0); break;
    }
  }

  function endGame() {
    gameOver = true;
    clearInterval(loopId);

    if (score > bestScore) {
      bestScore = score;
      saveBestScore(bestScore);
    }

    finalScoreEl.textContent = "Final score: " + score;
    winPanel.removeAttribute("hidden");
    winPanel.setAttribute("tabindex", "-1");
    winPanel.focus();
    updateStats();
  }

  function resetGame() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    direction = { x: 1, y: 0 };
    pendingDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    winPanel.setAttribute("hidden", "");
    spawnFood();
    updateStats();
    draw();

    if (loopId) clearInterval(loopId);
    loopId = setInterval(tick, INITIAL_SPEED_MS);
  }

  document.addEventListener("keydown", handleKeydown);
  dpad.addEventListener("click", handleDpadClick);
  restartBtn.addEventListener("click", resetGame);

  // Init
  bestScore = loadBestScore();
  resetGame();
})();
