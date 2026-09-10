/* ==========================================================================
   CARTRIDGE - SUDOKU LITE
   Game logic: generate a solved 6x6 grid (2x3 boxes) via backtracking,
   carve a puzzle from it, handle cell selection + number entry, track
   mistakes, detect win when the board matches the solution.
   ========================================================================== */

(function () {
  "use strict";

  const SIZE = 6;
  const BOX_ROWS = 2; // each box is 2 rows tall
  const BOX_COLS = 3; // and 3 columns wide
  const GIVEN_COUNT = 16; // how many cells start filled (out of 36)

  const board = document.getElementById("game-board");
  const numberPicker = document.getElementById("number-picker");
  const mistakeCountEl = document.getElementById("mistake-count");
  const winPanel = document.getElementById("game-win");
  const finalMistakesEl = document.getElementById("final-mistakes");
  const restartBtn = document.getElementById("restart-btn");

  let solution = [];
  let puzzle = []; // 0 = empty cell
  let givenMask = []; // true = pre-filled, can't be edited
  let cellEls = [];
  let selectedIndex = null;
  let mistakes = 0;

  function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function boxIndex(row, col) {
    return Math.floor(row / BOX_ROWS) * (SIZE / BOX_COLS) + Math.floor(col / BOX_COLS);
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

  function updateStats() {
    mistakeCountEl.textContent = "Mistakes: " + mistakes;
  }

  function clearSelection() {
    if (selectedIndex === null) return;
    cellEls[selectedIndex].classList.remove("cell--selected");
    selectedIndex = null;
  }

  function selectCell(index) {
    if (givenMask[index]) return;
    clearSelection();
    selectedIndex = index;
    cellEls[index].classList.add("cell--selected");
  }

  function renderBoard() {
    board.innerHTML = "";
    cellEls = [];

    puzzle.forEach(function (value, index) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.setAttribute("role", "button");
      cell.setAttribute("tabindex", givenMask[index] ? "-1" : "0");

      if (givenMask[index]) {
        cell.classList.add("cell--given");
        cell.textContent = value;
      } else if (value !== 0) {
        cell.textContent = value;
      }

      cell.addEventListener("click", function () {
        selectCell(index);
      });

      board.appendChild(cell);
      cellEls.push(cell);
    });
  }

  function isBoardComplete() {
    return puzzle.every(function (value, index) { return value === solution[index]; });
  }

  function handleNumberPick(value) {
    if (selectedIndex === null) return;
    if (givenMask[selectedIndex]) return;

    if (value === 0) {
      // Clear
      puzzle[selectedIndex] = 0;
      cellEls[selectedIndex].textContent = "";
      cellEls[selectedIndex].classList.remove("cell--error");
      return;
    }

    puzzle[selectedIndex] = value;
    cellEls[selectedIndex].textContent = value;

    if (value !== solution[selectedIndex]) {
      mistakes++;
      updateStats();
      cellEls[selectedIndex].classList.add("cell--error");
    } else {
      cellEls[selectedIndex].classList.remove("cell--error");
    }

    if (isBoardComplete()) {
      showWin();
    }
  }

  function showWin() {
    finalMistakesEl.textContent = "Finished with " + mistakes + " mistake" + (mistakes === 1 ? "" : "s") + ".";
    winPanel.removeAttribute("hidden");
    winPanel.setAttribute("tabindex", "-1");
    winPanel.focus();
  }

  function resetGame() {
    const solvedGrid = generateSolvedBoard();
    const generated = generatePuzzle(solvedGrid);

    solution = generated.flatSolution;
    puzzle = generated.flatPuzzle.slice();
    givenMask = generated.mask;
    mistakes = 0;
    selectedIndex = null;

    winPanel.setAttribute("hidden", "");
    updateStats();
    renderBoard();
  }

  numberPicker.addEventListener("click", function (event) {
    const btn = event.target.closest("[data-number]");
    if (!btn) return;
    handleNumberPick(parseInt(btn.getAttribute("data-number"), 10));
  });

  restartBtn.addEventListener("click", resetGame);

  // Init
  resetGame();
})();
