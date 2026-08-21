/* ==========================================================================
   CARTRIDGE - NUMBER SLIDE
   Game logic: generate a solvable shuffle, handle tile moves, detect win.
   ========================================================================== */

(function () {
  "use strict";

  const GRID_SIZE = 4; // 4x4 board, 15 tiles + 1 blank
  const BLANK_VALUE = 0;

  const board = document.getElementById("game-board");
  const moveCountEl = document.getElementById("move-count");
  const winPanel = document.getElementById("game-win");
  const finalMoveCountEl = document.getElementById("final-move-count");
  const restartBtn = document.getElementById("restart-btn");

  let tiles = []; // flat array of length 16, values 0-15 (0 = blank)
  let moveCount = 0;

  /**
   * Returns the solved state: [1, 2, 3, ..., 15, 0]
   */
  function solvedState() {
    const result = [];
    for (let i = 1; i < GRID_SIZE * GRID_SIZE; i++) {
      result.push(i);
    }
    result.push(BLANK_VALUE);
    return result;
  }

  /**
   * Counts inversions in the tile array (ignoring the blank) to determine solvability.
   * For a 4x4 board: solvable if (inversions + blank row from bottom, 1-indexed) is even.
   */
  function isSolvable(state) {
    const flat = state.filter(function (v) { return v !== BLANK_VALUE; });
    let inversions = 0;
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inversions++;
      }
    }

    const blankIndex = state.indexOf(BLANK_VALUE);
    const blankRowFromBottom = GRID_SIZE - Math.floor(blankIndex / GRID_SIZE);

    if (GRID_SIZE % 2 === 0) {
      // Even grid width: solvable if (inversions + blank row from bottom) is odd
      return (inversions + blankRowFromBottom) % 2 === 1;
    }
    // Odd grid width (not used here, but kept for correctness): solvable if inversions is even
    return inversions % 2 === 0;
  }

  /**
   * Shuffles the solved state until it lands on a solvable, non-solved configuration
   */
  function generateSolvableShuffle() {
    let state;
    do {
      state = solvedState();
      // Fisher-Yates shuffle
      for (let i = state.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state[i], state[j]] = [state[j], state[i]];
      }
    } while (!isSolvable(state) || isSolved(state));

    return state;
  }

  function isSolved(state) {
    const target = solvedState();
    return state.every(function (value, index) { return value === target[index]; });
  }

  /**
   * Returns true if the tile at `index` is orthogonally adjacent to the blank
   */
  function isAdjacentToBlank(index) {
    const blankIndex = tiles.indexOf(BLANK_VALUE);
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const blankRow = Math.floor(blankIndex / GRID_SIZE);
    const blankCol = blankIndex % GRID_SIZE;

    const sameRowAdjacent = row === blankRow && Math.abs(col - blankCol) === 1;
    const sameColAdjacent = col === blankCol && Math.abs(row - blankRow) === 1;

    return sameRowAdjacent || sameColAdjacent;
  }

  function handleTileClick(index) {
    if (!isAdjacentToBlank(index)) return;

    const blankIndex = tiles.indexOf(BLANK_VALUE);
    [tiles[index], tiles[blankIndex]] = [tiles[blankIndex], tiles[index]];
    moveCount++;
    updateStats();
    renderBoard();

    if (isSolved(tiles)) {
      showWin();
    }
  }

  function updateStats() {
    moveCountEl.textContent = "Moves: " + moveCount;
  }

  function buildTile(value, index) {
    const tile = document.createElement("div");

    if (value === BLANK_VALUE) {
      tile.className = "tile tile--blank";
      tile.setAttribute("aria-hidden", "true");
      return tile;
    }

    tile.className = "tile";
    tile.textContent = value;
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.setAttribute(
      "aria-label",
      "Tile " + value + (isAdjacentToBlank(index) ? ", movable" : ", not movable")
    );

    tile.addEventListener("click", function () {
      handleTileClick(index);
    });

    tile.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleTileClick(index);
      }
    });

    return tile;
  }

  function renderBoard() {
    board.innerHTML = "";
    tiles.forEach(function (value, index) {
      board.appendChild(buildTile(value, index));
    });
  }

  function showWin() {
    finalMoveCountEl.textContent = "Solved in " + moveCount + " moves.";
    winPanel.removeAttribute("hidden");
    winPanel.setAttribute("tabindex", "-1");
    winPanel.focus();
  }

  function resetGame() {
    moveCount = 0;
    winPanel.setAttribute("hidden", "");
    updateStats();
    tiles = generateSolvableShuffle();
    renderBoard();
  }

  restartBtn.addEventListener("click", resetGame);

  // Init
  tiles = generateSolvableShuffle();
  updateStats();
  renderBoard();
})();
