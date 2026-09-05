/* ==========================================================================
   CARTRIDGE - WORD SCRAMBLE
   Game logic: scramble a word, let the player rebuild it by clicking letters,
   check correctness, progress through the word list, track solved count.
   ========================================================================== */

(function () {
  "use strict";

  // Gaming-themed word list to match the brand - 10 words
  const WORDS = [
    "PIXEL",
    "ARCADE",
    "CONTROLLER",
    "JOYSTICK",
    "CARTRIDGE",
    "RETRO",
    "LEVEL",
    "PUZZLE",
    "SCORE",
    "CONSOLE"
  ];

  const scrambleRow = document.getElementById("scramble-row");
  const answerRow = document.getElementById("answer-row");
  const feedbackEl = document.getElementById("game-feedback");
  const solvedCountEl = document.getElementById("solved-count");
  const clearBtn = document.getElementById("clear-btn");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");
  const winPanel = document.getElementById("game-win");

  let wordOrder = [];
  let currentWordIndex = 0;
  let currentWord = "";
  let scrambledLetters = []; // array of { letter, used, tileEl }
  let clickedOrder = [];
  let solvedCount = 0;

  /**
   * Fisher-Yates shuffle, reused for both word order and letter scrambling
   */
  function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Scrambles a word's letters, guaranteeing the result isn't identical
   * to the original word (possible with short words otherwise)
   */
  function scrambleWord(word) {
    const letters = word.split("");
    let scrambled;
    do {
      scrambled = shuffle(letters);
    } while (scrambled.join("") === word && letters.length > 1);
    return scrambled;
  }

  function updateStats() {
    solvedCountEl.textContent = "Solved: " + solvedCount + " / " + WORDS.length;
  }

  /**
   * Renders the scrambled letter tiles for the current word
   */
  function renderScrambleRow() {
    scrambleRow.innerHTML = "";
    scrambledLetters = scrambleWord(currentWord).map(function (letter) {
      return { letter: letter, used: false };
    });

    scrambledLetters.forEach(function (entry, index) {
      const tile = document.createElement("div");
      tile.className = "letter-tile";
      tile.textContent = entry.letter;
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("aria-label", "Letter " + entry.letter);

      tile.addEventListener("click", function () {
        handleLetterClick(index, tile);
      });
      tile.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleLetterClick(index, tile);
        }
      });

      entry.tileEl = tile;
      scrambleRow.appendChild(tile);
    });
  }

  function renderAnswerRow() {
    answerRow.innerHTML = "";
    clickedOrder.forEach(function (entryIndex) {
      const entry = scrambledLetters[entryIndex];
      const tile = document.createElement("div");
      tile.className = "letter-tile";
      tile.textContent = entry.letter;
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("aria-label", "Remove letter " + entry.letter);

      // Clicking an answer tile removes it (puts it back in the scramble row)
      tile.addEventListener("click", function () {
        entry.used = false;
        entry.tileEl.classList.remove("letter-tile--used");
        clickedOrder = clickedOrder.filter(function (index) { return index !== entryIndex; });
        renderAnswerRow();
      });

      answerRow.appendChild(tile);
    });
  }

  function handleLetterClick(index, tile) {
    const entry = scrambledLetters[index];
    if (entry.used) return;

    entry.used = true;
    clickedOrder.push(index);
    tile.classList.add("letter-tile--used");
    renderAnswerRow();
    checkAnswer();
  }

  function getCurrentAnswer() {
    return clickedOrder
      .map(function (index) { return scrambledLetters[index].letter; })
      .join("");
  }

  function checkAnswer() {
    const answer = getCurrentAnswer();

    if (answer.length !== currentWord.length) return;

    if (answer === currentWord) {
      solvedCount++;
      updateStats();
      feedbackEl.textContent = "Correct! It was " + currentWord + ".";
      nextBtn.removeAttribute("hidden");
      clearBtn.setAttribute("hidden", "");
      disableAllTiles();
    } else {
      feedbackEl.textContent = "Not quite - try again.";
    }
  }

  function disableAllTiles() {
    scrambledLetters.forEach(function (entry) {
      entry.tileEl.setAttribute("tabindex", "-1");
      entry.tileEl.classList.add("letter-tile--used");
    });
  }

  function clearAnswer() {
    clickedOrder = [];
    scrambledLetters.forEach(function (entry) {
      entry.used = false;
      entry.tileEl.classList.remove("letter-tile--used");
    });
    renderAnswerRow();
    feedbackEl.textContent = "";
  }

  function loadWord(index) {
    currentWord = wordOrder[index];
    clickedOrder = [];
    feedbackEl.textContent = "";
    nextBtn.setAttribute("hidden", "");
    clearBtn.removeAttribute("hidden");
    renderScrambleRow();
    renderAnswerRow();
  }

  function goToNextWord() {
    currentWordIndex++;

    if (currentWordIndex >= wordOrder.length) {
      showWin();
      return;
    }

    loadWord(currentWordIndex);
  }

  function showWin() {
    winPanel.removeAttribute("hidden");
    winPanel.setAttribute("tabindex", "-1");
    winPanel.focus();
  }

  function resetGame() {
    wordOrder = shuffle(WORDS);
    currentWordIndex = 0;
    solvedCount = 0;
    winPanel.setAttribute("hidden", "");
    updateStats();
    loadWord(0);
  }

  clearBtn.addEventListener("click", clearAnswer);
  nextBtn.addEventListener("click", goToNextWord);
  restartBtn.addEventListener("click", resetGame);

  // Init
  resetGame();
})();
