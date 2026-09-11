/* ==========================================================================
   CARTRIDGE - SUDOKU LITE
   Game logic: generate a solved 6x6 grid (2x3 boxes) via backtracking,
   carve a puzzle from it, handle cell selection + number entry, track
   mistakes/hints/time, detect win when the board matches the solution.
   ========================================================================== */

(function () {
  "use strict";

  const SIZE = 6;
  const BOX_ROWS = 2; // each box is 2 rows tall
  const BOX_COLS = 3; // and 3 columns wide
  const GIVEN_COUNT = 16; // how many cells start filled (out of 36)
  const MAX_HINTS = 3;

  const startOverlay = document.getElementById("start-overlay");
  const startBtn = document.getElementById("start-btn");
  const board = document.getElementById("game-board");
  const numberPicker = document.getElementById("number-picker");
  const gameActions = document.getElementById("game-actions");
  const hintBtn = document.getElementById("hint-btn");
  const resetBtn = document.getElementById("reset-btn");
  const timerDisplayEl = document.getElementById("timer-display");
  const mistakeCountEl = document.getElementById("mistake-count");
  const hintCountEl = document.getElementById("hint-count");
  const winPanel = document.getElementById("game-win");
  const finalStatsEl = document.getElementById("final-stats");
  const restartBtn = document.getElementById("restart-btn");

  let solution = [];
  let puzzle = []; // 0 = empty cell
  let givenMask = []; // true = pre-filled, can't be edited
  let hintMask = []; // true = revealed via hint, also can't be edited
  let cellEls = [];
  let selectedIndex = null;
  let mistakes = 0;
  let hintsUsed = 0;
  let elapsedSeconds = 0;
  let timerIntervalId = null;

  function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Backtracking solved-board generator for a 6x6 grid with 2x3 boxes
   */
  function generateSolvedBoard() {
    const grid = Array.from({ length: SIZE }, function () { return new Array(SIZE).fill(0); });

    function isValid(row, col, value) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[row][c] === value) return false;
      }
      for (let r = 0; r < SIZE; r++) {
        if (grid[r][col] === value) return false;
      }
      const boxRowStart = Math.floor(row / BOX_ROWS) * BOX_ROWS;
      const boxColStart = Math.floor(col / BOX_COLS) * BOX_COLS;
      for (let r = boxRowStart; r < boxRowStart + BOX_ROWS; r++) {
        for (let c = boxColStart; c < boxColStart + BOX_COLS; c++) {
          if (grid[r][c] === value) return false;
        }
      }
      return true;
    }

    function fill(cellIndex) {
      if (cellIndex === SIZE * SIZE) return true;

      const row = Math.floor(cellIndex / SIZE);
      const col = cellIndex % SIZE;
      const candidates = shuffle([1, 2, 3, 4, 5, 6]);

      for (let i = 0; i < candidates.length; i++) {
        const value = candidates[i];
        if (isValid(row, col, value)) {
          grid[row][col] = value;
          if (fill(cellIndex + 1)) return true;
          grid[row][col] = 0;
        }
      }
      return false;
    }

    fill(0);
    return grid;
  }

  /**
   * Flattens the solved grid, keeps GIVEN_COUNT random cells, blanks the rest
   */
  function generatePuzzle(solvedGrid) {
    const flatSolution = [];
    solvedGrid.forEach(function (row) { flatSolution.push.apply(flatSolution, row); });

    const keepIndices = new Set(shuffle(flatSolution.map(function (_, i) { return i; })).slice(0, GIVEN_COUNT));

    const flatPuzzle = flatSolution.map(function (value, index) {
      return keepIndices.has(index) ? value : 0;
    });

    const mask = flatPuzzle.map(function (value) { return value !== 0; });

    return { flatSolution: flatSolution, flatPuzzle: flatPuzzle, mask: mask };
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
  }

  function updateStats() {
    timerDisplayEl.textContent = "Time: " + formatTime(elapsedSeconds);
    mistakeCountEl.textContent = "Mistakes: " + mistakes;
    hintCountEl.textContent = "Hints: " + (MAX_HINTS - hintsUsed) + " left";
  }

  function startTimer() {
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = setInterval(function () {
      elapsedSeconds++;
      updateStats();
    }, 1000);
  }

  function stopTimer() {
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = null;
  }

  function clearSelection() {
    if (selectedIndex === null) return;
    cellEls[selectedIndex].classList.remove("cell--selected");
    selectedIndex = null;
  }

  function isLocked(index) {
    return givenMask[index] || hintMask[index];
  }

  function selectCell(index) {
    if (isLocked(index)) return;
    clearSelection();
    selectedIndex = index;
    cellEls[index].classList.add("cell--selected");
  }

  function renderCell(index) {
    const cell = cellEls[index];
    const value = puzzle[index];

    cell.className = "cell";
    cell.textContent = value !== 0 ? value : "";

    if (givenMask[index]) {
      cell.classList.add("cell--given");
    } else if (hintMask[index]) {
      cell.classList.add("cell--hint");
    } else if (value !== 0 && value !== solution[index]) {
      cell.classList.add("cell--error");
    }

    if (index === selectedIndex) {
      cell.classList.add("cell--selected");
    }
  }

  function renderBoard() {
    board.innerHTML = "";
    cellEls = [];

    puzzle.forEach(function (value, index) {
      const cell = document.createElement("div");
      cell.setAttribute("role", "button");
      cell.setAttribute("tabindex", isLocked(index) ? "-1" : "0");

      cell.addEventListener("click", function () {
        selectCell(index);
      });

      board.appendChild(cell);
      cellEls.push(cell);
      renderCell(index);
    });
  }

  function isBoardComplete() {
    return puzzle.every(function (value, index) { return value === solution[index]; });
  }

  function handleNumberPick(value) {
    if (selectedIndex === null) return;
    if (isLocked(selectedIndex)) return;

    if (value === 0) {
      // Clear
      puzzle[selectedIndex] = 0;
      renderCell(selectedIndex);
      return;
    }

    puzzle[selectedIndex] = value;

    if (value !== solution[selectedIndex]) {
      mistakes++;
      updateStats();
    }

    renderCell(selectedIndex);

    if (isBoardComplete()) {
      showWin();
    }
  }

  function handleHint() {
    if (hintsUsed >= MAX_HINTS) return;

    let targetIndex = selectedIndex;

    // If nothing selected, or the selection is already correct/locked, pick a random incorrect cell instead
    if (targetIndex === null || isLocked(targetIndex) || puzzle[targetIndex] === solution[targetIndex]) {
      const candidates = puzzle
        .map(function (value, index) { return index; })
        .filter(function (index) { return !isLocked(index) && puzzle[index] !== solution[index]; });

      if (candidates.length === 0) return; // nothing left to hint
      targetIndex = candidates[Math.floor(Math.random() * candidates.length)];
    }

    puzzle[targetIndex] = solution[targetIndex];
    hintMask[targetIndex] = true;
    hintsUsed++;

    if (selectedIndex === targetIndex) {
      clearSelection();
    }

    updateStats();
    renderCell(targetIndex);

    if (isBoardComplete()) {
      showWin();
    }
  }

  function handleReset() {
    // Clears player-entered (non-given, non-hint) values and mistakes,
    // keeps the same puzzle, keeps hints already used, timer keeps running
    puzzle = puzzle.map(function (value, index) {
      return isLocked(index) ? value : 0;
    });
    mistakes = 0;
    clearSelection();
    updateStats();
    renderBoard();
  }

  function showWin() {
    stopTimer();
    finalStatsEl.textContent =
      "Time: " + formatTime(elapsedSeconds) + " - Mistakes: " + mistakes + " - Hints used: " + hintsUsed;
    winPanel.removeAttribute("hidden");
    winPanel.setAttribute("tabindex", "-1");
    winPanel.focus();
  }

  function generateNewPuzzle() {
    const solvedGrid = generateSolvedBoard();
    const generated = generatePuzzle(solvedGrid);

    solution = generated.flatSolution;
    puzzle = generated.flatPuzzle.slice();
    givenMask = generated.mask;
    hintMask = new Array(SIZE * SIZE).fill(false);
    mistakes = 0;
    hintsUsed = 0;
    elapsedSeconds = 0;
    selectedIndex = null;
  }

  function beginPlay() {
    startOverlay.setAttribute("hidden", "");
    board.removeAttribute("hidden");
    numberPicker.removeAttribute("hidden");
    gameActions.removeAttribute("hidden");

    updateStats();
    renderBoard();
    startTimer();
  }

  function resetGame() {
    stopTimer();
    winPanel.setAttribute("hidden", "");
    startOverlay.removeAttribute("hidden");
    board.setAttribute("hidden", "");
    numberPicker.setAttribute("hidden", "");
    gameActions.setAttribute("hidden", "");

    generateNewPuzzle();
    updateStats();
  }

  startBtn.addEventListener("click", beginPlay);

  numberPicker.addEventListener("click", function (event) {
    const btn = event.target.closest("[data-number]");
    if (!btn) return;
    handleNumberPick(parseInt(btn.getAttribute("data-number"), 10));
  });

  hintBtn.addEventListener("click", handleHint);
  resetBtn.addEventListener("click", handleReset);
  restartBtn.addEventListener("click", resetGame);

  // Init - puzzle is generated immediately so Hint has a solution ready,
  // but the timer and board stay hidden until Start is clicked
  generateNewPuzzle();
  updateStats();
})();
