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

function nextCard() {
  current = (current + 1) % deck.length;
  flipped = false;
  showCard();
}

let showDetails = false;

function toggleDetails() {
  showDetails = !showDetails;
  document.getElementById("progress-details").style.display = showDetails ? "block" : "none";
  updateProgress();
}

function updateProgress() {
  let totalCorrect = 0, totalWrong = 0;
  let details = '';
  for (let c of cards) {
    totalCorrect += progress[c.front].correct;
    totalWrong += progress[c.front].wrong;
    details += `${c.front}: ✅${progress[c.front].correct} ❌${progress[c.front].wrong}\n`;
  }

  // summary only
  document.getElementById("progress-summary").textContent =
    `Total: ✅${totalCorrect} | ❌${totalWrong}`;

  // details only if toggle is on
  if (showDetails) {
    document.getElementById("progress-details").textContent = details;
  }

  localStorage.setItem("progress", JSON.stringify(progress));
}


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

function shuffleDeck(d) {
  return [...d].sort(() => Math.random() - 0.5);
}

// --- MODES ---
function startMode(selectedMode) {
  mode = selectedMode;
  titlePage.style.display = "none";
  appPage.style.display = "block";

  switch(mode) {
    case 'learn-all':
      deck = shuffleDeck(cards);
      setupFlipControls();
      break;
    case 'learn-hard':
      deck = shuffleDeck(cards.filter(c => progress[c.front].wrong > 0));
      if(deck.length === 0) deck = shuffleDeck(cards); // fallback
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
    <div class="row">
      <button onclick="markCorrect()">✅ Correct</button>
      <button onclick="markWrong()">❌ Wrong</button>
    </div>
    <div class="row">
      <button onclick="deck = shuffleDeck(deck); current = 0; showCard();">🔀 Shuffle</button>
      <button onclick="resetProgress()">♻️ Reset</button>
    </div>
  `;
}

function setupQuizControls() {
  controlsEl.innerHTML = `
    <div class="row">
      <input type="text" id="answer" placeholder="Type Romaji" />
      <button onclick="checkAnswer()">Submit</button>
    </div>
    <div id="feedback" style="text-align:center; margin-top:8px; font-weight:bold;"></div>
    <div class="row">
      <button onclick="deck = shuffleDeck(deck); current = 0; showCard();">🔀 Shuffle</button>
      <button onclick="resetProgress()">♻️ Reset</button>
    </div>
  `;
}


// --- QUIZ MODE ---
function checkAnswer() {
  const input = document.getElementById("answer");
  const feedback = document.getElementById("feedback");
  const userAnswer = input.value.trim().toLowerCase();
  const correctAnswer = deck[current].back.toLowerCase();

  if (userAnswer === correctAnswer) {
    progress[deck[current].front].correct++;
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
  } else {
    progress[deck[current].front].wrong++;
    feedback.textContent = `❌ Wrong! Correct: ${correctAnswer}`;
    feedback.style.color = "red";
  }

  updateProgress();

  // clear input for next attempt
  input.value = "";

  // move to next card after short delay
  setTimeout(() => {
    feedback.textContent = "";
    nextCard();
  }, 1000);
}


// --- RESET ---
function resetProgress() {
  cards.forEach(c => progress[c.front] = { correct:0, wrong:0 });
  updateProgress();
}





