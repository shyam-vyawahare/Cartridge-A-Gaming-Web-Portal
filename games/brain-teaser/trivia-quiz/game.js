/* ==========================================================================
   CARTRIDGE - TRIVIA QUIZ
   Game logic: shuffle question order + answer order, check selection,
   track score, progress through the question bank, show final score.
   ========================================================================== */

(function () {
  "use strict";

  const QUESTION_BANK = {
    "Gaming History": [
      { question: "What year was the Atari 2600 released in North America?", options: ["1975", "1977", "1980", "1982"], answer: "1977" },
      { question: "Which company released the Game Boy in 1989?", options: ["Atari", "Nintendo", "Sega", "NEC"], answer: "Nintendo" },
      { question: "Which arcade game by Taito became a global phenomenon in 1978?", options: ["Asteroids", "Space Invaders", "Galaga", "Centipede"], answer: "Space Invaders" },
      { question: "Which company launched the original PlayStation in 1995?", options: ["Sony", "Microsoft", "Sega", "Nintendo"], answer: "Sony" },
      { question: "What was the name of Nintendo's 8-bit home console released in 1985?", options: ["GameCube", "Super Nintendo", "Nintendo Entertainment System", "Game Boy"], answer: "Nintendo Entertainment System" },
      { question: "Which company created the Game & Watch handheld series in the 1980s?", options: ["Nintendo", "Atari", "Sega", "NEC"], answer: "Nintendo" },
      { question: "Which controller feature became iconic with the Nintendo 64?", options: ["Touchscreen", "Analog stick", "Trackball", "Gyroscope"], answer: "Analog stick" },
      { question: "Which console introduced the dual-screen handheld form factor?", options: ["Game Boy Advance", "Nintendo DS", "Sega Nomad", "PlayStation Portable"], answer: "Nintendo DS" },
      { question: "Which company created the Sega Genesis?", options: ["Nintendo", "Sega", "Capcom", "Atari"], answer: "Sega" },
      { question: "Which home console was first sold under the Xbox brand?", options: ["Xbox 360", "Xbox One", "Original Xbox", "Xbox Series X"], answer: "Original Xbox" }
    ],
    "Guess the Game": [
      { question: "A yellow character eats pellets and dodges ghosts in a maze. What game is this?", options: ["Dig Dug", "Pac-Man", "Ms. Pac-Man", "Galaga"], answer: "Pac-Man" },
      { question: "Falling blocks must be arranged into complete lines before they reach the top. What game is this?", options: ["Dr. Mario", "Columns", "Tetris", "Puyo Puyo"], answer: "Tetris" },
      { question: "A green-clad hero travels across Hyrule to rescue Princess Zelda. What game is this?", options: ["The Legend of Zelda", "Metroid", "Final Fantasy", "Chrono Trigger"], answer: "The Legend of Zelda" },
      { question: "A plumber leaps over gaps and stomps Goombas in a mushroom kingdom. What game is this?", options: ["Super Mario Bros.", "Sonic the Hedgehog", "Kirby", "Crash Bandicoot"], answer: "Super Mario Bros." },
      { question: "Players sprint through loops and spring-filled zones as a blue hedgehog. What game is this?", options: ["Sonic the Hedgehog", "Rayman", "Spyro the Dragon", "Aero the Acro-Bat"], answer: "Sonic the Hedgehog" },
      { question: "A racer zooms around colorful tracks while collecting coins and using items. What game is this?", options: ["Mario Kart", "Crash Team Racing", "Need for Speed", "F-Zero"], answer: "Mario Kart" },
      { question: "Players build and manage a city from a tiny grid while balancing taxes and services. What game is this?", options: ["SimCity", "Cities: Skylines", "Banished", "The Sims"], answer: "SimCity" },
      { question: "A lone space bounty hunter explores alien planets in a powered suit. What game is this?", options: ["Metroid", "Halo", "Star Fox", "Mass Effect"], answer: "Metroid" },
      { question: "You guide a tiny blue blob through intricate levels while swallowing enemies and growing larger. What game is this?", options: ["Kirby", "Pikmin", "Yoshi", "Lolo"], answer: "Kirby" },
      { question: "A space marine fights alien armies across ring-shaped worlds. What game is this?", options: ["Halo", "Elder Scrolls", "Gears of War", "Half-Life"], answer: "Halo" }
    ],
    "Guess the Famous Gaming Character": [
      { question: "This plumber is known for rescuing Princess Peach and jumping across Mushroom Kingdom. Who is it?", options: ["Kratos", "Mario", "Sonic", "Cloud"], answer: "Mario" },
      { question: "This blue mascot is famous for collecting rings and racing at supersonic speed. Who is it?", options: ["Sonic", "Gordon Freeman", "Ryu", "Link"], answer: "Sonic" },
      { question: "This hero of Hyrule fights monsters with a sword and shield while protecting the Triforce. Who is it?", options: ["Samus", "Link", "Peach", "Dante"], answer: "Link" },
      { question: "This electric mouse is one of Nintendo's most recognizable mascots and often partners with Ash. Who is it?", options: ["Pikachu", "Jigglypuff", "Squirtle", "Charmander"], answer: "Pikachu" },
      { question: "This bounty hunter uses a powered suit to explore hostile alien worlds. Who is it?", options: ["Samus Aran", "Alyx Vance", "Lara Croft", "Cortana"], answer: "Samus Aran" },
      { question: "This Spartan is the iconic hero of the Halo series, fighting for humanity across ring worlds. Who is it?", options: ["Master Chief", "Marcus Fenix", "Duke Nukem", "John-117"], answer: "Master Chief" },
      { question: "This character is a legendary Greek warrior known for his rage and chain blades. Who is it?", options: ["Cloud Strife", "Kratos", "Ryu", "Joel"], answer: "Kratos" },
      { question: "This hero carries a massive Buster Sword and battles Sephiroth in a high-fantasy world. Who is it?", options: ["Tidus", "Cloud Strife", "Squall Leonhart", "Zidane"], answer: "Cloud Strife" },
      { question: "This princess of the Mushroom Kingdom is often kidnapped by Bowser. Who is she?", options: ["Peach", "Zelda", "Daisy", "Rosalina"], answer: "Peach" },
      { question: "This large turtle-like villain is Mario's recurring arch-nemesis. Who is he?", options: ["Bowser", "Wario", "King K. Rool", "Dr. Eggman"], answer: "Bowser" }
    ],
    "Gaming Consoles & Hardware": [
      { question: "What does GPU stand for?", options: ["Graphics Processing Unit", "General Power Unit", "Game Port Utility", "Graphics Performance Upgrade"], answer: "Graphics Processing Unit" },
      { question: "Which company makes the Nintendo Switch?", options: ["Sony", "Microsoft", "Nintendo", "Sega"], answer: "Nintendo" },
      { question: "Which handheld was the first to use two screens?", options: ["Game Boy Advance", "Nintendo DS", "Game Gear", "Atari Lynx"], answer: "Nintendo DS" },
      { question: "What iconic feature was introduced by the Nintendo 64 controller?", options: ["Touchpad", "Analog stick", "Motion sensor", "Dual screen"], answer: "Analog stick" },
      { question: "Which format did the original PlayStation use for games?", options: ["Cartridge", "DVD", "Compact disc", "Blu-ray"], answer: "Compact disc" },
      { question: "Which hardware component stores a game's permanent data in a cartridge?", options: ["RAM", "CPU", "ROM", "GPU"], answer: "ROM" },
      { question: "Which company manufactures the Xbox family of consoles?", options: ["Sony", "Microsoft", "Apple", "NVIDIA"], answer: "Microsoft" },
      { question: "What is the primary purpose of a D-pad?", options: ["Audio output", "Directional input", "Storage expansion", "Video capture"], answer: "Directional input" },
      { question: "What does RAM stand for?", options: ["Random Access Memory", "Read-only Analog Module", "Regional Audio Menu", "Rapid Array Manager"], answer: "Random Access Memory" },
      { question: "What general label is used for the controller used to play console games?", options: ["Keyboard", "Gamepad", "Mouse", "Trackpad"], answer: "Gamepad" }
    ],
    "Game Worlds & Lore": [
      { question: "What is the name of the kingdom in which Mario often battles Bowser to rescue Peach?", options: ["Mushroom Kingdom", "Hyrule", "Zebes", "Skyrim"], answer: "Mushroom Kingdom" },
      { question: "In The Legend of Zelda, what is the name of the kingdom Link protects?", options: ["Mushroom Kingdom", "Hyrule", "Tamriel", "Koholint"], answer: "Hyrule" },
      { question: "In Minecraft, what is the main world layer where players normally spawn and build?", options: ["Nether", "End", "Overworld", "Aether"], answer: "Overworld" },
      { question: "What company is responsible for the Aperture Science testing facility in the Portal series?", options: ["Black Mesa", "Aperture Science", "Chell Industries", "Valve Labs"], answer: "Aperture Science" },
      { question: "Which planet is Samus Aran famous for exploring in the Metroid series?", options: ["Zebes", "Tallon IV", "Earth", "Veldin"], answer: "Zebes" },
      { question: "In Undertale, what is the name of the region below the surface where monsters are sealed?", options: ["The Underground", "The Nether", "The Void", "The Rift"], answer: "The Underground" },
      { question: "In Skyrim, what is the province that gives the game its name?", options: ["Hammerfell", "Cyrodiil", "Skyrim", "High Rock"], answer: "Skyrim" },
      { question: "Which city plays a central role in the story of Final Fantasy VII?", options: ["Midgar", "Rabanastre", "Lindblum", "Dunwall"], answer: "Midgar" },
      { question: "What is the name of the dark, lava-filled realm in Minecraft that players can access via portals?", options: ["The Nether", "The End", "The Void", "The Frozen Biome"], answer: "The Nether" },
      { question: "Which legendary kingdom does the hero of Zelda often explore through temples and dungeons?", options: ["Hyrule", "Mushroom Kingdom", "Naboo", "Kanto"], answer: "Hyrule" }
    ]
  };

  const CATEGORY_LABELS = {
    "Gaming History": "🎮 Gaming History",
    "Guess the Game": "🕹️ Guess the Game",
    "Guess the Famous Gaming Character": "👾 Guess the Famous Gaming Character",
    "Gaming Consoles & Hardware": "⚙️ Gaming Consoles & Hardware",
    "Game Worlds & Lore": "🌍 Game Worlds & Lore"
  };

  const categoryPicker = document.getElementById("category-picker");
  const questionTextEl = document.getElementById("question-text");
  const answerGrid = document.getElementById("answer-grid");
  const feedbackEl = document.getElementById("game-feedback");
  const questionProgressEl = document.getElementById("question-progress");
  const scoreCountEl = document.getElementById("score-count");
  const nextBtn = document.getElementById("next-btn");
  const startOverlay = document.getElementById("start-overlay");
  const startBtn = document.getElementById("start-btn");
  const gameModal = document.getElementById("game-modal");
  const finalScoreEl = document.getElementById("final-score");
  const newGameBtn = document.getElementById("new-game-btn");

  let selectedCategory = Object.keys(QUESTION_BANK)[0];
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

  function createCategoryButtons() {
    Object.keys(QUESTION_BANK).forEach(function (categoryName) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "category-btn";
      btn.dataset.category = categoryName;
      btn.textContent = CATEGORY_LABELS[categoryName];
      btn.setAttribute("aria-pressed", categoryName === selectedCategory ? "true" : "false");

      btn.addEventListener("click", function () {
        selectedCategory = categoryName;
        updateCategoryButtons();
      });

      categoryPicker.appendChild(btn);
    });

    updateCategoryButtons();
  }

  function updateCategoryButtons() {
    const buttons = categoryPicker.querySelectorAll(".category-btn");
    buttons.forEach(function (button) {
      const isSelected = button.dataset.category === selectedCategory;
      button.classList.toggle("category-btn--selected", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  }

  function buildSessionQuestions(categoryName) {
    const uniqueQuestions = [];
    const seen = new Set();

    shuffle(QUESTION_BANK[categoryName].slice()).forEach(function (question) {
      if (seen.has(question.question)) return;
      seen.add(question.question);
      uniqueQuestions.push({
        question: question.question,
        options: question.options.slice(),
        answer: question.answer
      });
    });

    return uniqueQuestions;
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

    const shuffledOptions = shuffle(current.options.slice());

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
    gameModal.removeAttribute("hidden");
    gameModal.setAttribute("tabindex", "-1");
    gameModal.focus();
  }

  function showStartScreen() {
    questionOrder = [];
    currentIndex = 0;
    score = 0;
    gameModal.setAttribute("hidden", "");
    startOverlay.removeAttribute("hidden");
    document.getElementById("game-board").setAttribute("hidden", "");
    scoreCountEl.textContent = "Score: 0";
    questionProgressEl.textContent = "Question: 1 / 10";
  }

  function startGame() {
    questionOrder = buildSessionQuestions(selectedCategory);
    currentIndex = 0;
    score = 0;
    startOverlay.setAttribute("hidden", "");
    gameModal.setAttribute("hidden", "");
    document.getElementById("game-board").removeAttribute("hidden");
    renderQuestion();
  }

  nextBtn.addEventListener("click", goToNextQuestion);
  startBtn.addEventListener("click", startGame);
  newGameBtn.addEventListener("click", function () {
    showStartScreen();
  });

  // Init
  createCategoryButtons();
  showStartScreen();
})();
