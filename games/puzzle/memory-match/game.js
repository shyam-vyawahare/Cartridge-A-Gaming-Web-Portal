/* ==========================================================================
   CARTRIDGE - MEMORY MATCH
   Game logic: shuffle cards, handle flips, detect matches, track win state.
   ========================================================================== */

(function () {
  "use strict";

  // 8 pairs = 16 cards on a 4x4 board. Using emoji as simple placeholder art -
  // TODO: swap for real card face images/icons once art assets exist
  const SYMBOLS = ["🕹️", "👾", "🎮", "🏆", "⭐", "💎", "🔥", "⚡"];

  const board = document.getElementById("game-board");
  const moveCountEl = document.getElementById("move-count");
  const matchCountEl = document.getElementById("match-count");
  const winPanel = document.getElementById("game-win");
  const finalMoveCountEl = document.getElementById("final-move-count");
  const restartBtn = document.getElementById("restart-btn");

  let flippedCards = [];
  let matchedCount = 0;
  let moveCount = 0;
  let boardLocked = false; // prevents clicks while a mismatch is being shown

  /**
   * Fisher-Yates shuffle
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
   * Keeps a card's aria-label in sync with its visual state, so screen
   * reader users get the same information sighted users get from the flip.
   */
  function updateCardLabel(card) {
    if (card.classList.contains("card--matched")) {
      card.setAttribute("aria-label", "Matched card, " + card.getAttribute("data-symbol"));
    } else if (card.classList.contains("card--flipped")) {
      card.setAttribute("aria-label", "Card showing " + card.getAttribute("data-symbol"));
    } else {
      card.setAttribute("aria-label", "Memory card, face down");
    }
  }

  /**
   * Builds one card DOM element for a given symbol
   */
  function buildCard(symbol, index) {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-symbol", symbol);
    card.setAttribute("data-index", index);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    card.innerHTML =
      '<div class="card__inner">' +
      '<div class="card__face card__face--back"></div>' +
      '<div class="card__face card__face--front">' + symbol + "</div>" +
      "</div>";

    updateCardLabel(card);

    card.addEventListener("click", function () {
      handleCardClick(card);
    });

    // Keyboard support: Enter/Space flips the card, same as click
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCardClick(card);
      }
    });

    return card;
  }

  function updateStats() {
    moveCountEl.textContent = "Moves: " + moveCount;
    matchCountEl.textContent = "Matches: " + matchedCount + " / " + SYMBOLS.length;
  }

  function handleCardClick(card) {
    if (boardLocked) return;
    if (card.classList.contains("card--flipped") || card.classList.contains("card--matched")) return;
    if (flippedCards.length >= 2) return;

    card.classList.add("card--flipped");
    updateCardLabel(card);
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      moveCount++;
      updateStats();
      checkForMatch();
    }
  }

  function checkForMatch() {
    const [first, second] = flippedCards;
    const isMatch = first.getAttribute("data-symbol") === second.getAttribute("data-symbol");

    if (isMatch) {
      first.classList.add("card--matched");
      second.classList.add("card--matched");
      updateCardLabel(first);
      updateCardLabel(second);
      matchedCount++;
      flippedCards = [];
      updateStats();

      if (matchedCount === SYMBOLS.length) {
        showWin();
      }
    } else {
      // Lock the board briefly so the player can see the mismatch before it flips back
      boardLocked = true;
      setTimeout(function () {
        first.classList.remove("card--flipped");
        second.classList.remove("card--flipped");
        updateCardLabel(first);
        updateCardLabel(second);
        flippedCards = [];
        boardLocked = false;
      }, 800);
    }
  }

  function showWin() {
    finalMoveCountEl.textContent = "Finished in " + moveCount + " moves.";
    winPanel.removeAttribute("hidden");
    // Move focus to the win panel so screen reader / keyboard users notice the game ended
    winPanel.setAttribute("tabindex", "-1");
    winPanel.focus();
  }

  function resetGame() {
    flippedCards = [];
    matchedCount = 0;
    moveCount = 0;
    boardLocked = false;
    winPanel.setAttribute("hidden", "");
    updateStats();
    renderBoard();
  }

  function renderBoard() {
    const deck = shuffle(SYMBOLS.concat(SYMBOLS)); // 8 symbols x 2 = 16 cards
    board.innerHTML = "";
    deck.forEach(function (symbol, index) {
      board.appendChild(buildCard(symbol, index));
    });
  }

  restartBtn.addEventListener("click", resetGame);

  // Init
  updateStats();
  renderBoard();
})();
