// Full Hiragana set
const cards = [
  { front: "あ", back: "a" }, { front: "い", back: "i" }, { front: "う", back: "u" }, { front: "え", back: "e" }, { front: "お", back: "o" },
  { front: "か", back: "ka" }, { front: "き", back: "ki" }, { front: "く", back: "ku" }, { front: "け", back: "ke" }, { front: "こ", back: "ko" },
  { front: "さ", back: "sa" }, { front: "し", back: "shi" }, { front: "す", back: "su" }, { front: "せ", back: "se" }, { front: "そ", back: "so" },
  { front: "た", back: "ta" }, { front: "ち", back: "chi" }, { front: "つ", back: "tsu" }, { front: "て", back: "te" }, { front: "と", back: "to" },
  { front: "な", back: "na" }, { front: "に", back: "ni" }, { front: "ぬ", back: "nu" }, { front: "ね", back: "ne" }, { front: "の", back: "no" },
  { front: "は", back: "ha" }, { front: "ひ", back: "hi" }, { front: "ふ", back: "fu" }, { front: "へ", back: "he" }, { front: "ほ", back: "ho" },
  { front: "ま", back: "ma" }, { front: "み", back: "mi" }, { front: "む", back: "mu" }, { front: "め", back: "me" }, { front: "も", back: "mo" },
  { front: "や", back: "ya" }, { front: "ゆ", back: "yu" }, { front: "よ", back: "yo" },
  { front: "ら", back: "ra" }, { front: "り", back: "ri" }, { front: "る", back: "ru" }, { front: "れ", back: "re" }, { front: "ろ", back: "ro" },
  { front: "わ", back: "wa" }, { front: "を", back: "wo" }, { front: "ん", back: "n" }
];

// State
let deck = [];
let remainingDeck = [];
let current = 0;
let flipped = false;
let mode = '';
let progress = JSON.parse(localStorage.getItem("progress")) || {};
cards.forEach(c => {
  if (!progress[c.front]) progress[c.front] = { correct: 0, wrong: 0 };
});

const cardEl = document.getElementById("card");
const controlsEl = document.getElementById("controls");
const progressEl = document.getElementById("progress");
const titlePage = document.getElementById("title-page");
const appPage = document.getElementById("app");

// --- UTILITIES ---
function showCard() {
  cardEl.textContent = flipped ? deck[current].back : deck[current].front;
}

cardEl.addEventListener("click", () => {
  flipped = !flipped;
  showCard();
});

function shuffleDeck(d) {
  return [...d].sort(() => Math.random() - 0.5);
}

// --- PROGRESS DISPLAY ---
function updateProgress() {
  let totalCorrect = 0, totalWrong = 0;
  let details = '';
  cards.forEach(c => {
    totalCorrect += progress[c.front].correct;
    totalWrong += progress[c.front].wrong;
    details += `${c.front}: ✅${progress[c.front].correct} ❌${progress[c.front].wrong}\n`;
  });

  progressEl.innerHTML = `Total: ✅${totalCorrect} | ❌${totalWrong} 
    <button onclick="toggleDetails()">Show Details</button>
    <div class="progress-details" id="details" style="display:none;">${details}</div>`;
  localStorage.setItem("progress", JSON.stringify(progress));
}

function toggleDetails() {
  const detailsDiv = document.getElementById("details");
  detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
}

// --- MARK CARDS ---
function markCorrect() {
  const front = deck[current].front;
  progress[front].correct++;
  updateProgress();
  nextCard();
}

function markWrong() {
  const front = deck[current].front;
  progress[front].wrong++;
  updateProgress();
  nextCard();
}

// --- RESET ---
function resetProgress() {
  cards.forEach(c => progress[c.front] = { correct: 0, wrong: 0 });
  updateProgress();
}

// --- MODES ---
function startMode(selectedMode) {
  mode = selectedMode;
  titlePage.style.display = "none";
  appPage.style.display = "block";

  switch (mode) {
    case 'learn-all':
      deck = shuffleDeck(cards);
      remainingDeck = [...deck];
      setupFlipControls();
      break;
    case 'learn-hard':
      deck = shuffleDeck(cards.filter(c => progress[c.front].wrong > 0));
      if (deck.length === 0) deck = shuffleDeck(cards);
      remainingDeck = [...deck];
      setupFlipControls();
      break;
    case 'quiz':
      deck = shuffleDeck(cards);
      setupQuizControls();
      break;
  }

  current = 0;
  flipped = false;
  showCard();
  updateProgress();
}

function goHome() {
  appPage.style.display = "none";
  titlePage.style.display = "block";
}

// --- CONTROL SETUPS ---
function setupFlipControls() {
  controlsEl.innerHTML = `
    <button onclick="markCorrect()">✅ Correct</button>
    <button onclick="markWrong()">❌ Wrong</button>
    <button onclick="remainingDeck=shuffleDeck(deck); current=0; showCard();">🔀 Shuffle</button>
    <button onclick="resetProgress()">♻️ Reset Progress</button>
  `;
}

function setupQuizControls() {
  controlsEl.innerHTML = `
    <input type="text" id="answer" placeholder="Type Romaji">
    <button onclick="checkAnswer()">Submit</button>
    <button onclick="deck=shuffleDeck(deck); current=0; showCard();">🔀 Shuffle</button>
    <button onclick="resetProgress()">♻️ Reset Progress</button>
    <div id="feedback" style="margin-top:10px;font-weight:bold;"></div>
  `;
}

// --- FLIPCARDS ROUND HANDLING ---
function nextCard() {
  if (mode === 'learn-all' || mode === 'learn-hard') {
    remainingDeck.splice(current, 1); // remove current card

    if (remainingDeck.length === 0) {
      alert("🎉 Round completed! You have seen all cards.");
      remainingDeck = [...deck];
      deck = shuffleDeck(deck);
      current = 0;
    } else {
      current = Math.floor(Math.random() * remainingDeck.length);
    }
    flipped = false;
    showCard();
  } else {
    // Quiz mode behavior
    current = (current + 1) % deck.length;
    flipped = false;
    showCard();
  }
}

// --- QUIZ MODE ---
function checkAnswer() {
  const answerInput = document.getElementById("answer");
  const ans = answerInput.value.trim().toLowerCase();
  const front = deck[current].front;
  const feedbackEl = document.getElementById("feedback");

  if (ans === deck[current].back.toLowerCase()) {
    progress[front].correct++;
    feedbackEl.textContent = "✅ Correct!";
    feedbackEl.style.color = "green";
  } else {
    progress[front].wrong++;
    feedbackEl.textContent = `❌ Wrong! Correct: ${deck[current].back}`;
    feedbackEl.style.color = "red";
  }

  answerInput.value = '';
  updateProgress();
  nextCard();
}