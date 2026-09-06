/* ==========================================================================
   CARTRIDGE - TETRIS
   Game logic: board grid, tetromino pieces + rotation, gravity drop,
   collision detection, line clearing, scoring, level speed-up.
   ========================================================================== */

(function () {
  "use strict";

  const COLS = 10;
  const ROWS = 20;
  const CELL = 24; // canvas is 240x480, so 24px per cell (10x20 grid)
  const LINES_PER_LEVEL = 10;
  const BASE_DROP_MS = 800;
  const MIN_DROP_MS = 120;

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const nextCanvas = document.getElementById("next-canvas");
  const nextCtx = nextCanvas.getContext("2d");
  const scoreCountEl = document.getElementById("score-count");
  const linesCountEl = document.getElementById("lines-count");
  const levelCountEl = document.getElementById("level-count");
  const winPanel = document.getElementById("game-win");
  const finalScoreEl = document.getElementById("final-score");
  const restartBtn = document.getElementById("restart-btn");
  const dpad = document.getElementById("dpad");

  // Each piece: 4 rotation states, each a 4x4 grid of 0/1 (classic SRS-style layouts)
  const PIECES = {
    I: {
      rotations: [
        [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
        [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
        [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
        [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]
      ],
      colorToken: "--color-accent-secondary"
    },
    J: {
      rotations: [
        [[1,0,0],[1,1,1],[0,0,0]],
        [[1,1],[1,0],[1,0]],
        [[1,1,1],[0,0,1],[0,0,0]],
        [[0,1],[0,1],[1,1]]
      ],
      colorToken: "--color-accent-primary"
    },
    L: {
      rotations: [
        [[0,0,1],[1,1,1],[0,0,0]],
        [[1,0],[1,0],[1,1]],
        [[1,1,1],[1,0,0],[0,0,0]],
        [[1,1],[0,1],[0,1]]
      ],
      colorToken: "--color-accent-secondary"
    },
    O: {
      rotations: [
        [[1,1],[1,1]],
        [[1,1],[1,1]],
        [[1,1],[1,1]],
        [[1,1],[1,1]]
      ],
      colorToken: "--color-accent-primary"
    },
    S: {
      rotations: [
        [[0,1,1],[1,1,0],[0,0,0]],
        [[1,0],[1,1],[0,1]],
        [[0,1,1],[1,1,0],[0,0,0]],
        [[1,0],[1,1],[0,1]]
      ],
      colorToken: "--color-accent-secondary"
    },
    T: {
      rotations: [
        [[0,1,0],[1,1,1],[0,0,0]],
        [[1,0],[1,1],[1,0]],
        [[1,1,1],[0,1,0],[0,0,0]],
        [[0,1],[1,1],[0,1]]
      ],
      colorToken: "--color-accent-primary"
    },
    Z: {
      rotations: [
        [[1,1,0],[0,1,1],[0,0,0]],
        [[0,1],[1,1],[1,0]],
        [[1,1,0],[0,1,1],[0,0,0]],
        [[0,1],[1,1],[1,0]]
      ],
      colorToken: "--color-accent-secondary"
    }
  };

  const PIECE_TYPES = Object.keys(PIECES);

  let board = []; // ROWS x COLS, each cell either null or a colorToken string
  let current = null; // { type, rotation, x, y }
  let next = null; // { type }
  let score = 0;
  let lines = 0;
  let level = 1;
  let dropIntervalId = null;
  let gameOver = false;

  function getToken(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function createEmptyBoard() {
    const rows = [];
    for (let r = 0; r < ROWS; r++) {
      rows.push(new Array(COLS).fill(null));
    }
    return rows;
  }

  function randomType() {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  }

  function getMatrix(piece) {
    return PIECES[piece.type].rotations[piece.rotation];
  }

  function spawnPiece(type) {
    const matrix = PIECES[type].rotations[0];
    const width = matrix[0].length;
    return {
      type: type,
      rotation: 0,
      x: Math.floor((COLS - width) / 2),
      y: -2 // start slightly above the visible board so pieces drop in
    };
  }

  function collides(piece, offsetX, offsetY, rotationOverride) {
    const rotation = rotationOverride !== undefined ? rotationOverride : piece.rotation;
    const matrix = PIECES[piece.type].rotations[rotation];

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (!matrix[r][c]) continue;

        const boardX = piece.x + c + offsetX;
        const boardY = piece.y + r + offsetY;

        if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true;
        if (boardY >= 0 && board[boardY][boardX]) return true;
      }
    }
    return false;
  }

  function mergePiece() {
    const matrix = getMatrix(current);
    const colorToken = PIECES[current.type].colorToken;

    matrix.forEach(function (row, r) {
      row.forEach(function (cell, c) {
        if (!cell) return;
        const boardY = current.y + r;
        const boardX = current.x + c;
        if (boardY >= 0) {
          board[boardY][boardX] = colorToken;
        }
      });
    });
  }

  function clearLines() {
    let clearedCount = 0;

    board = board.filter(function (row) {
      const isFull = row.every(function (cell) { return cell !== null; });
      if (isFull) clearedCount++;
      return !isFull;
    });

    while (board.length < ROWS) {
      board.unshift(new Array(COLS).fill(null));
    }

    if (clearedCount > 0) {
      // Classic scoring: more lines at once scores disproportionately more
      const points = [0, 100, 300, 500, 800][clearedCount] * level;
      score += points;
      lines += clearedCount;

      const newLevel = Math.floor(lines / LINES_PER_LEVEL) + 1;
      if (newLevel !== level) {
        level = newLevel;
        restartDropInterval();
      }

      updateStats();
    }
  }

  function updateStats() {
    scoreCountEl.textContent = "Score: " + score;
    linesCountEl.textContent = "Lines: " + lines;
    levelCountEl.textContent = "Level: " + level;
  }

  function draw() {
    const bgPanel = getToken("--color-bg-panel");
    const bgBase = getToken("--color-bg-base");

    ctx.fillStyle = bgBase;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Settled board cells
    board.forEach(function (row, r) {
      row.forEach(function (cell, c) {
        if (!cell) return;
        ctx.fillStyle = getToken(cell);
        ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
      });
    });

    // Active falling piece
    if (current) {
      const matrix = getMatrix(current);
      const color = getToken(PIECES[current.type].colorToken);
      ctx.fillStyle = color;

      matrix.forEach(function (row, r) {
        row.forEach(function (cell, c) {
          if (!cell) return;
          const boardY = current.y + r;
          if (boardY < 0) return; // don't draw above visible board
          ctx.fillRect((current.x + c) * CELL + 1, boardY * CELL + 1, CELL - 2, CELL - 2);
        });
      });
    }

    void bgPanel; // reserved for future gridline styling
    drawNextPreview();
  }

  function drawNextPreview() {
    nextCtx.fillStyle = getToken("--color-bg-base");
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!next) return;

    const matrix = PIECES[next.type].rotations[0];
    const size = matrix.length;
    const previewCell = Math.floor(nextCanvas.width / 4.5);
    const offsetX = (nextCanvas.width - size * previewCell) / 2;
    const offsetY = (nextCanvas.height - size * previewCell) / 2;
    const color = getToken(PIECES[next.type].colorToken);

    nextCtx.fillStyle = color;
    matrix.forEach(function (row, r) {
      row.forEach(function (cell, c) {
        if (!cell) return;
        nextCtx.fillRect(offsetX + c * previewCell + 1, offsetY + r * previewCell + 1, previewCell - 2, previewCell - 2);
      });
    });
  }

  function lockAndAdvance() {
    mergePiece();
    clearLines();

    current = spawnPiece(next.type);
    next = { type: randomType() };

    if (collides(current, 0, 0)) {
      endGame();
    }
  }

  function tick() {
    if (gameOver) return;

    if (!collides(current, 0, 1)) {
      current.y++;
    } else {
      lockAndAdvance();
    }

    draw();
  }

  function moveLeft() {
    if (!current || gameOver) return;
    if (!collides(current, -1, 0)) {
      current.x--;
      draw();
    }
  }

  function moveRight() {
    if (!current || gameOver) return;
    if (!collides(current, 1, 0)) {
      current.x++;
      draw();
    }
  }

  function softDrop() {
    if (!current || gameOver) return;
    if (!collides(current, 0, 1)) {
      current.y++;
      score += 1; // small reward for manual soft-dropping, matches classic Tetris scoring conventions
      updateStats();
      draw();
    } else {
      lockAndAdvance();
      draw();
    }
  }

  function rotate() {
    if (!current || gameOver) return;
    const nextRotation = (current.rotation + 1) % PIECES[current.type].rotations.length;

    // Try the rotation as-is, then a couple of simple horizontal nudges (basic wall-kick)
    if (!collides(current, 0, 0, nextRotation)) {
      current.rotation = nextRotation;
    } else if (!collides(current, -1, 0, nextRotation)) {
      current.x -= 1;
      current.rotation = nextRotation;
    } else if (!collides(current, 1, 0, nextRotation)) {
      current.x += 1;
      current.rotation = nextRotation;
    }
    draw();
  }

  function handleKeydown(event) {
    switch (event.key) {
      case "ArrowLeft": event.preventDefault(); moveLeft(); break;
      case "ArrowRight": event.preventDefault(); moveRight(); break;
      case "ArrowDown": event.preventDefault(); softDrop(); break;
      case "ArrowUp": event.preventDefault(); rotate(); break;
      case " ": event.preventDefault(); rotate(); break;
    }
  }

  function handleDpadClick(event) {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;

    switch (btn.getAttribute("data-action")) {
      case "left": moveLeft(); break;
      case "right": moveRight(); break;
      case "down": softDrop(); break;
      case "rotate": rotate(); break;
    }
  }

  function restartDropInterval() {
    if (dropIntervalId) clearInterval(dropIntervalId);
    const speed = Math.max(MIN_DROP_MS, BASE_DROP_MS - (level - 1) * 60);
    dropIntervalId = setInterval(tick, speed);
  }

  function endGame() {
    gameOver = true;
    if (dropIntervalId) clearInterval(dropIntervalId);

    finalScoreEl.textContent = "Final score: " + score + " - Lines: " + lines;
    winPanel.removeAttribute("hidden");
    winPanel.setAttribute("tabindex", "-1");
    winPanel.focus();
  }

  function resetGame() {
    board = createEmptyBoard();
    score = 0;
    lines = 0;
    level = 1;
    gameOver = false;
    winPanel.setAttribute("hidden", "");

    current = spawnPiece(randomType());
    next = { type: randomType() };

    updateStats();
    draw();
    restartDropInterval();
  }

  document.addEventListener("keydown", handleKeydown);
  dpad.addEventListener("click", handleDpadClick);
  restartBtn.addEventListener("click", resetGame);

  // Init
  resetGame();
})();
