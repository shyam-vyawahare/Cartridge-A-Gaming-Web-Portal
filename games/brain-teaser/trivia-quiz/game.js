/* ==========================================================================
   CARTRIDGE - TRIVIA QUIZ
   Game logic: shuffle question order + answer order, check selection,
   track score, progress through the question bank, show final score.
   ========================================================================== */

(function () {
  "use strict";

  // Gaming-themed question bank - 10 questions, 4 options each, "answer" is the correct option text
  const QUESTIONS = [
    { question: "What year was the first PlayStation released?", options: ["1993", "1994", "1996", "1998"], answer: "1994" },
    { question: "In Pac-Man, what are the ghosts called collectively?", options: ["Enemies", "Spirits", "Phantoms", "Chompers"], answer: "Phantoms" },
    { question: "Which company created the Mario franchise?", options: ["Sega", "Nintendo", "Capcom", "Konami"], answer: "Nintendo" },
    { question: "What does 'NPC' stand for in gaming?", options: ["New Player Character", "Non-Player Character", "Networked Player Client", "Non-Playable Content"], answer: "Non-Player Character" },
    { question: "Which game popularized the 'battle royale' genre?", options: ["Fortnite", "PUBG", "Apex Legends", "Warzone"], answer: "PUBG" },
    { question: "What is the best-selling video game of all time?", options: ["Tetris", "Minecraft", "GTA V", "Wii Sports"], answer: "Minecraft" },
    { question: "In Tetris, what is the name of the S-shaped piece?", options: ["S-piece", "Z-piece", "L-piece", "T-piece"], answer: "S-piece" },
    { question: "Which console was the first to use analog sticks?", options: ["Nintendo 64", "Sega Saturn", "PlayStation", "Game Boy"], answer: "Nintendo 64" },
    { question: "What genre is 'Street Fighter'?", options: ["Platformer", "Fighting", "RPG", "Puzzle"], answer: "Fighting" },
    { question: "Who is the main antagonist in the Legend of Zelda series?", options: ["Bowser", "Ganon", "Sephiroth", "Dr. Eggman"], answer: "Ganon" }
  ];

  const questionTextEl = document.getElementById("question-text");
  const answerGrid = document.getElementById("answer-grid");
  const feedbackEl = document.getElementById("game-feedback");
  const questionProgressEl = document.getElementById("question-progress");
  const scoreCountEl = document.getElementById("score-count");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");
  const winPanel = document.getElementById("game-win");
  const finalScoreEl = document.getElementById("final-score");

  let questionOrder = [];
  let currentIndex = 0;
  let score = 0;

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

  function updateStats() {
    questionProgressEl.textContent = "Question: " + (currentIndex + 1) + " / " + questionOrder.length;
    scoreCountEl.textContent = "Score: " + score;
  }

  function renderQuestion() {
    const current = questionOrder[currentIndex];
    questionTextEl.textContent = current.question;
    feedbackEl.textContent = "";
    nextBtn.setAttribute("hidden", "");

    const shuffledOptions = shuffle(current.options);

    answerGrid.innerHTML = "";
    shuffledOptions.forEach(function (option) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer-btn";
      btn.textContent = option;

      btn.addEventListener("click", function () {
        handleAnswerClick(option, current.answer);
      });

      answerGrid.appendChild(btn);
    });

    updateStats();
  }

  function handleAnswerClick(selected, correctAnswer) {
    const buttons = answerGrid.querySelectorAll(".answer-btn");
    const isCorrect = selected === correctAnswer;

    buttons.forEach(function (btn) {
      btn.classList.add("answer-btn--disabled");

      if (btn.textContent === correctAnswer) {
        btn.classList.add("answer-btn--correct");
      } else if (btn.textContent === selected) {
        btn.classList.add("answer-btn--incorrect");
      }
    });

    if (isCorrect) {
      score++;
      feedbackEl.textContent = "Correct!";
    } else {
      feedbackEl.textContent = "Not quite - the correct answer was " + correctAnswer + ".";
    }

    updateStats();
    nextBtn.removeAttribute("hidden");
  }

  function goToNextQuestion() {
    currentIndex++;

    if (currentIndex >= questionOrder.length) {
      showEndScreen();
      return;
    }

    renderQuestion();
  }

  function showEndScreen() {
    finalScoreEl.textContent = "Final score: " + score + " / " + questionOrder.length;
    winPanel.removeAttribute("hidden");
    winPanel.setAttribute("tabindex", "-1");
    winPanel.focus();
  }

  function resetGame() {
    questionOrder = shuffle(QUESTIONS);
    currentIndex = 0;
    score = 0;
    winPanel.setAttribute("hidden", "");
    renderQuestion();
  }

  nextBtn.addEventListener("click", goToNextQuestion);
  restartBtn.addEventListener("click", resetGame);

  // Init
  resetGame();
})();
