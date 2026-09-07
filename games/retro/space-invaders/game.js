/* ==========================================================================
   CARTRIDGE - SPACE INVADERS
   Game logic: player movement, shooting, invader grid formation march,
   invader return fire, collision detection, lives, score, win/lose states.
   ========================================================================== */

(function () {
  "use strict";

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 450;

  const PLAYER_WIDTH = 36;
  const PLAYER_HEIGHT = 20;
  const PLAYER_SPEED = 4;

  const BULLET_WIDTH = 4;
  const BULLET_HEIGHT = 12;
  const PLAYER_BULLET_SPEED = 6;
  const INVADER_BULLET_SPEED = 3;

  const INVADER_ROWS = 5;
  const INVADER_COLS = 8;
  const INVADER_WIDTH = 30;
  const INVADER_HEIGHT = 20;
  const INVADER_GAP_X = 10;
  const INVADER_GAP_Y = 14;
  const INVADER_TOP_OFFSET = 40;
  const INVADER_DROP_AMOUNT = 18;

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const scoreCountEl = document.getElementById("score-count");
  const livesCountEl = document.getElementById("lives-count");
  const winPanel = document.getElementById("game-win");
  const endMessageEl = document.getElementById("end-message");
  const finalScoreEl = document.getElementById("final-score");
  const restartBtn = document.getElementById("restart-btn");
  const controls = document.getElementById("controls");

  let player = null;
  let invaders = [];
  let invaderDirection = 1;
  let invaderMoveTimer = 0;
  let invaderMoveInterval = 600; // ms between formation steps, shrinks as invaders are destroyed
  let playerBullet = null;
  let invaderBullets = [];
  let score = 0;
  let lives = 3;
  let gameOver = false;
  let gameWon = false;
  let moveLeft = false;
  let moveRight = false;
  let lastFrameTime = 0;
  let animationFrameId = null;

  function getToken(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function createInvaders() {
    const grid = [];
    const totalWidth = INVADER_COLS * (INVADER_WIDTH + INVADER_GAP_X) - INVADER_GAP_X;
    const startX = (CANVAS_WIDTH - totalWidth) / 2;

    for (let row = 0; row < INVADER_ROWS; row++) {
      for (let col = 0; col < INVADER_COLS; col++) {
        grid.push({
          x: startX + col * (INVADER_WIDTH + INVADER_GAP_X),
          y: INVADER_TOP_OFFSET + row * (INVADER_HEIGHT + INVADER_GAP_Y),
          width: INVADER_WIDTH,
          height: INVADER_HEIGHT,
          alive: true
        });
      }
    }
    return grid;
  }

  function updateStats() {
    scoreCountEl.textContent = "Score: " + score;
    livesCountEl.textContent = "Lives: " + lives;
  }

  function aliveInvaders() {
    return invaders.filter(function (inv) { return inv.alive; });
  }

  function updatePlayer() {
    if (moveLeft) player.x -= PLAYER_SPEED;
    if (moveRight) player.x += PLAYER_SPEED;
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));
  }

  function fireBullet() {
    if (playerBullet || gameOver || gameWon) return; // classic rule: one player bullet on screen at a time
    playerBullet = {
      x: player.x + player.width / 2 - BULLET_WIDTH / 2,
      y: player.y - BULLET_HEIGHT,
      width: BULLET_WIDTH,
      height: BULLET_HEIGHT
    };
  }

  function updatePlayerBullet() {
    if (!playerBullet) return;

    playerBullet.y -= PLAYER_BULLET_SPEED;

    if (playerBullet.y + playerBullet.height < 0) {
      playerBullet = null;
      return;
    }

    for (let i = 0; i < invaders.length; i++) {
      const inv = invaders[i];
      if (!inv.alive) continue;

      if (rectsOverlap(playerBullet, inv)) {
        inv.alive = false;
        playerBullet = null;
        score += 10;
        updateStats();

        if (aliveInvaders().length === 0) {
          endGame(true);
        }
        break;
      }
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function updateInvaders(delta) {
    invaderMoveTimer += delta;

    // Fewer invaders left = faster march, classic Space Invaders tension curve
    const remaining = aliveInvaders().length;
    invaderMoveInterval = Math.max(120, 150 + remaining * 15);

    if (invaderMoveTimer < invaderMoveInterval) return;
    invaderMoveTimer = 0;

    const living = aliveInvaders();
    if (living.length === 0) return;

    const leftMost = Math.min.apply(null, living.map(function (inv) { return inv.x; }));
    const rightMost = Math.max.apply(null, living.map(function (inv) { return inv.x + inv.width; }));

    let hitEdge = false;
    if ((invaderDirection === 1 && rightMost >= CANVAS_WIDTH - 8) ||
        (invaderDirection === -1 && leftMost <= 8)) {
      hitEdge = true;
    }

    if (hitEdge) {
      invaderDirection *= -1;
      living.forEach(function (inv) { inv.y += INVADER_DROP_AMOUNT; });
    } else {
      const step = 10;
      living.forEach(function (inv) { inv.x += step * invaderDirection; });
    }

    // Invaders reaching the player's row is an instant loss condition
    const lowestY = Math.max.apply(null, living.map(function (inv) { return inv.y + inv.height; }));
    if (lowestY >= player.y) {
      endGame(false);
    }
  }

  function maybeSpawnInvaderBullet() {
    if (gameOver || gameWon) return;

    const living = aliveInvaders();
    if (living.length === 0) return;

    // Small random chance per frame that a random alive invader fires
    if (Math.random() < 0.01) {
      const shooter = living[Math.floor(Math.random() * living.length)];
      invaderBullets.push({
        x: shooter.x + shooter.width / 2 - BULLET_WIDTH / 2,
        y: shooter.y + shooter.height,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT
      });
    }
  }

  function updateInvaderBullets() {
    for (let i = invaderBullets.length - 1; i >= 0; i--) {
      const bullet = invaderBullets[i];
      bullet.y += INVADER_BULLET_SPEED;

      if (bullet.y > CANVAS_HEIGHT) {
        invaderBullets.splice(i, 1);
        continue;
      }

      if (rectsOverlap(bullet, player)) {
        invaderBullets.splice(i, 1);
        lives--;
        updateStats();

        if (lives <= 0) {
          endGame(false);
        }
      }
    }
  }

  function draw() {
    const bgBase = getToken("--color-bg-base");
    const pink = getToken("--color-accent-primary");
    const gold = getToken("--color-accent-secondary");
    const lavender = getToken("--color-text");

    ctx.fillStyle = bgBase;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.fillStyle = gold;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Invaders
    ctx.fillStyle = pink;
    invaders.forEach(function (inv) {
      if (!inv.alive) return;
      ctx.fillRect(inv.x, inv.y, inv.width, inv.height);
    });

    // Player bullet
    if (playerBullet) {
      ctx.fillStyle = lavender;
      ctx.fillRect(playerBullet.x, playerBullet.y, playerBullet.width, playerBullet.height);
    }

    // Invader bullets
    ctx.fillStyle = lavender;
    invaderBullets.forEach(function (bullet) {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
  }

  function loop(timestamp) {
    if (gameOver || gameWon) return;

    const delta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    updatePlayer();
    updatePlayerBullet();
    updateInvaders(delta);
    maybeSpawnInvaderBullet();
    updateInvaderBullets();
    draw();

    animationFrameId = requestAnimationFrame(loop);
  }

  function endGame(won) {
    gameOver = !won;
    gameWon = won;

    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    endMessageEl.textContent = won ? "You Win!" : "Game Over";
    finalScoreEl.textContent = "Final score: " + score;
    winPanel.removeAttribute("hidden");
    winPanel.setAttribute("tabindex", "-1");
    winPanel.focus();
  }

  function handleKeydown(event) {
    switch (event.key) {
      case "ArrowLeft": event.preventDefault(); moveLeft = true; break;
      case "ArrowRight": event.preventDefault(); moveRight = true; break;
      case " ": event.preventDefault(); fireBullet(); break;
    }
  }

  function handleKeyup(event) {
    switch (event.key) {
      case "ArrowLeft": moveLeft = false; break;
      case "ArrowRight": moveRight = false; break;
    }
  }

  function handleControlsDown(event) {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");

    if (action === "left") moveLeft = true;
    if (action === "right") moveRight = true;
    if (action === "fire") fireBullet();
  }

  function handleControlsUp(event) {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");

    if (action === "left") moveLeft = false;
    if (action === "right") moveRight = false;
  }

  function resetGame() {
    player = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 16,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT
    };

    invaders = createInvaders();
    invaderDirection = 1;
    invaderMoveTimer = 0;
    playerBullet = null;
    invaderBullets = [];
    score = 0;
    lives = 3;
    gameOver = false;
    gameWon = false;
    moveLeft = false;
    moveRight = false;

    winPanel.setAttribute("hidden", "");
    updateStats();
    draw();

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyup);
  controls.addEventListener("mousedown", handleControlsDown);
  controls.addEventListener("mouseup", handleControlsUp);
  controls.addEventListener("mouseleave", handleControlsUp);
  controls.addEventListener("touchstart", function (event) {
    event.preventDefault();
    handleControlsDown(event);
  });
  controls.addEventListener("touchend", function (event) {
    event.preventDefault();
    handleControlsUp(event);
  });
  restartBtn.addEventListener("click", resetGame);

  // Init
  resetGame();
})();
