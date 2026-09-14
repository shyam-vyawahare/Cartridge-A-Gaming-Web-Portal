/* ==========================================================================
   CARTRIDGE - HANGMAN
   Game logic: pick a word, render on-screen keyboard, track guesses,
   draw the hangman figure progressively, show a result modal on win/loss.
   ========================================================================== */

(function () {
  "use strict";

  const WORDS = [
    "PIXEL", "ARCADE", "CONTROLLER", "JOYSTICK", "CARTRIDGE",
    "RETRO", "LEVEL", "PUZZLE", "SCORE", "CONSOLE"
  ];
  const MAX_WRONG = 6;
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const startOverlay = document.getElementById("start-overlay");
  const startBtn = document.getElementById("start-btn");
  const gameBoard = document.getElementById("game-board");
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const wordDisplayEl = document.getElementById("word-display");
  const keyboardEl = document.getElementById("keyboard");
  const attemptsLeftEl = document.getElementById("attempts-left");
  const resultModal = document.getElementById("result-modal");
  const resultTitleEl = document.getElementById("result-title");
  const resultMessageEl = document.getElementById("result-message");
  const resultBtn = document.getElementById("result-btn");

  let word = "";
  let guessedLetters = [];
  let wrongCount = 0;

  function getToken(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function pickWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  function updateStats() {
    attemptsLeftEl.textContent = "Attempts: " + (MAX_WRONG - wrongCount);
  }

  function renderWordDisplay() {
    wordDisplayEl.textContent = word
      .split("")
      .map(function (letter) { return guessedLetters.includes(letter) ? letter : "_"; })
      .join(" ");
  }

  function drawHangman() {
    const bgPanel = getToken("--color-bg-panel");
    const lavender = getToken("--color-text");

    ctx.fillStyle = bgPanel;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = lavender;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    // Gallows - always visible
    ctx.beginPath();
    ctx.moveTo(20, 200); ctx.lineTo(120, 200); // base
    ctx.moveTo(50, 200); ctx.lineTo(50, 20);   // pole
    ctx.lineTo(140, 20);                       // beam
    ctx.lineTo(140, 45);                       // rope
    ctx.stroke();

    if (wrongCount < 1) return;
    ctx.beginPath();
    ctx.arc(140, 65, 20, 0, Math.PI * 2); // head
    ctx.stroke();

    if (wrongCount < 2) return;
    ctx.beginPath();
    ctx.moveTo(140, 85); ctx.lineTo(140, 140); // body
    ctx.stroke();

    if (wrongCount < 3) return;
    ctx.beginPath();
    ctx.moveTo(140, 95); ctx.lineTo(115, 120); // left arm
    ctx.stroke();

    if (wrongCount < 4) return;
    ctx.beginPath();
    ctx.moveTo(140, 95); ctx.lineTo(165, 120); // right arm
    ctx.stroke();

    if (wrongCount < 5) return;
    ctx.beginPath();
    ctx.moveTo(140, 140); ctx.lineTo(118, 175); // left leg
    ctx.stroke();

    if (wrongCount < 6) return;
    ctx.beginPath();
    ctx.moveTo(140, 140); ctx.lineTo(162, 175); // right leg
    ctx.stroke();
  }

  function buildKeyboard() {
    keyboardEl.innerHTML = "";
    LETTERS.forEach(function (letter) {
      const key = document.createElement("button");
      key.type = "button";
      key.className = "key";
      key.textContent = letter;
      key.setAttribute("aria-label", "Guess letter " + letter);

      key.addEventListener("click", function () {
        handleGuess(letter, key);
      });

      keyboardEl.appendChild(key);
    });
  }

  function handleGuess(letter, keyEl) {
    if (guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);
    keyEl.classList.add("key--disabled");

    if (word.includes(letter)) {
      keyEl.classList.add("key--correct");
    } else {
      keyEl.classList.add("key--incorrect");
      wrongCount++;
      updateStats();
      drawHangman();
    }

    renderWordDisplay();

    const solved = word.split("").every(function (l) { return guessedLetters.includes(l); });

    if (solved) {
      showResult(true);
    } else if (wrongCount >= MAX_WRONG) {
      showResult(false);
    }
  }

  function showResult(won) {
    resultTitleEl.textContent = won ? "You Win!" : "Game Over";
    resultMessageEl.textContent = won
      ? "You guessed it - the word was " + word + "."
      : "Out of attempts. The word was " + word + ".";
    resultBtn.textContent = won ? "New Game" : "Try Again";

    resultModal.removeAttribute("hidden");
    resultModal.setAttribute("tabindex", "-1");
    resultModal.focus();
  }

  function beginPlay() {
    startOverlay.setAttribute("hidden", "");
    gameBoard.removeAttribute("hidden");

    word = pickWord();
    guessedLetters = [];
    wrongCount = 0;

    updateStats();
    renderWordDisplay();
    buildKeyboard();
    drawHangman();
  }

  function resetToStart() {
    resultModal.setAttribute("hidden", "");
    gameBoard.setAttribute("hidden", "");
    startOverlay.removeAttribute("hidden");
  }

  startBtn.addEventListener("click", beginPlay);
  resultBtn.addEventListener("click", resetToStart);

  // Init - nothing starts until Start is clicked
})();
