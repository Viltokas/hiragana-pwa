// --- CARDS ---
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

// --- PICTURE CARDS ---
const pictureCards = cards.map(c => ({
  front: `images/${c.back}.png`,
  back: c.back // visada sutampa su progress key
}));

// --- STATE ---
let deck = [];
let current = 0;
let mode = '';
let showDetails = false;

let progress = JSON.parse(localStorage.getItem("progress")) || {};
cards.forEach(c => {
  if (!progress[c.front]) progress[c.front] = { correct: 0, wrong: 0 };
});

// --- DOM ELEMENTS ---
const cardEl = document.getElementById("card");
const controlsEl = document.getElementById("controls");
const titlePage = document.getElementById("title-page");
const appPage = document.getElementById("app");

// --- UTILITIES ---
function shuffleDeck(d) {
  return [...d].sort(() => Math.random() - 0.5);
}

function updateProgress() {
  let totalCorrect = 0, totalWrong = 0;
  let details = '';
  for (let c of cards) {
    totalCorrect += progress[c.front].correct;
    totalWrong += progress[c.front].wrong;
    details += `${c.front}: ✅${progress[c.front].correct} ❌${progress[c.front].wrong}\n`;
  }
  document.getElementById("progress-summary").textContent =
    `Total: ✅${totalCorrect} | ❌${totalWrong}`;
  const detailsEl = document.getElementById("progress-details");
  if(detailsEl) detailsEl.style.display = showDetails ? "block" : "none";
  if(showDetails && detailsEl) detailsEl.textContent = details;
  localStorage.setItem("progress", JSON.stringify(progress));
}

function toggleDetails() {
  showDetails = !showDetails;
  updateProgress();
}

// --- CARD NAVIGATION ---
function markCorrect() {
  const key = deck[current].back; // visada back
  progress[key].correct++;
  updateProgress();
  nextCard();
}

function markWrong() {
  const key = deck[current].back;
  progress[key].wrong++;
  updateProgress();
  nextCard();
}


function nextCard() {
  current = (current + 1) % deck.length;
  showCard();
}

// --- SHOW CARD ---
function showCard() {
  if(!deck[current]) return;
  let frontContent = (mode === "picture") ? `<img src="${deck[current].front}" alt="Hiragana">` : deck[current].front;
  let backContent = deck[current].back;
  cardEl.innerHTML = `
    <div class="card-inner">
      <div class="card-front">${frontContent}</div>
      <div class="card-back">${backContent}</div>
    </div>
  `;
  cardEl.classList.remove("flipped");
  cardEl.onclick = () => cardEl.classList.toggle("flipped");
}

// --- CONTROLS ---
function setupControls() {
  controlsEl.innerHTML = `
    <button id="correct-btn">✅ Correct</button>
    <button id="wrong-btn">❌ Wrong</button>
    <button id="shuffle-btn">🔀 Shuffle</button>
    <button id="reset-btn">♻️ Reset</button>
  `;

  document.getElementById("correct-btn").addEventListener("click", markCorrect);
  document.getElementById("wrong-btn").addEventListener("click", markWrong);
  document.getElementById("shuffle-btn").addEventListener("click", () => {
    deck = shuffleDeck(deck); current = 0; showCard();
  });
  document.getElementById("reset-btn").addEventListener("click", resetProgress);
}


function resetProgress() {
  cards.forEach(c => progress[c.front] = { correct:0, wrong:0 });
  updateProgress();
}

// --- MODES ---
function startMode(selectedMode) {
  mode = selectedMode;
  titlePage.style.display = "none";
  appPage.style.display = "block";

  switch(mode) {
    case 'learn-all':
      deck = shuffleDeck(cards);
      setupControls();
      break;
    case 'learn-hard':
      deck = shuffleDeck(cards.filter(c => progress[c.front].wrong > 0));
      if(deck.length === 0) deck = shuffleDeck(cards);
      setupControls();
      break;
    case 'quiz':
      deck = shuffleDeck(cards);
      setupQuizControls();
      break;
    case 'picture':
      deck = shuffleDeck(pictureCards);
      setupControls();
      break;
  }

  current = 0;
  showCard();
  updateProgress();
}

function goHome() {
  appPage.style.display = "none";
  titlePage.style.display = "block";
}

// --- QUIZ MODE ---
function setupQuizControls() {
  controlsEl.innerHTML = `
    <div class="row">
      <input type="text" id="answer" placeholder="Type Romaji" />
      <button id="submit-answer">Submit</button>
    </div>
    <div id="feedback" style="text-align:center; margin-top:8px; font-weight:bold;"></div>
    <div class="row">
      <button id="shuffle-btn">🔀 Shuffle</button>
      <button id="reset-btn">♻️ Reset</button>
    </div>
  `;

  document.getElementById("submit-answer").addEventListener("click", checkAnswer);
  document.getElementById("shuffle-btn").addEventListener("click", () => { deck = shuffleDeck(deck); current = 0; showCard(); });
  document.getElementById("reset-btn").addEventListener("click", resetProgress);
}

function checkAnswer() {
  const input = document.getElementById("answer");
  const feedback = document.getElementById("feedback");
  const userAnswer = input.value.trim().toLowerCase();
  const correctAnswer = deck[current].back.toLowerCase();

  const frontKey = deck[current].back || deck[current].front;
  if (userAnswer === correctAnswer) {
    progress[frontKey].correct++;
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
  } else {
    progress[frontKey].wrong++;
    feedback.textContent = `❌ Wrong! Correct: ${correctAnswer}`;
    feedback.style.color = "red";
  }

  updateProgress();
  input.value = "";
  setTimeout(() => {
    feedback.textContent = "";
    nextCard();
  }, 1000);
}


