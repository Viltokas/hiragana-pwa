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

const pictureCards = [
  { front: "images/a.png", back: "a" }, { front: "images/i.png", back: "i" }, { front: "images/u.png", back: "u" }, 
  { front: "images/e.png", back: "e" }, { front: "images/o.png", back: "o" }, 
  { front: "images/ka.png", back: "ka" }, { front: "images/ki.png", back: "ki" }, { front: "images/ku.png", back: "ku" },
  { front: "images/ke.png", back: "ke" }, { front: "images/ko.png", back: "ko" }, 
  { front: "images/sa.png", back: "sa" }, { front: "images/shi.png", back: "shi" }, { front: "images/su.png", back: "su" },
  { front: "images/se.png", back: "se" }, { front: "images/so.png", back: "so" }, 
  { front: "images/ta.png", back: "ta" }, { front: "images/chi.png", back: "chi" }, { front: "images/tsu.png", back: "tsu" },
  { front: "images/te.png", back: "te" }, { front: "images/to.png", back: "to" }, 
  { front: "images/na.png", back: "na" }, { front: "images/ni.png", back: "ni" }, { front: "images/nu.png", back: "nu" },
  { front: "images/ne.png", back: "ne" }, { front: "images/no.png", back: "no" }, 
  { front: "images/ha.png", back: "ha" }, { front: "images/hi.png", back: "hi" }, { front: "images/fu.png", back: "fu" },
  { front: "images/he.png", back: "he" }, { front: "images/ho.png", back: "ho" }, 
  { front: "images/ma.png", back: "ma" }, { front: "images/mi.png", back: "mi" }, { front: "images/mu.png", back: "mu" },
  { front: "images/me.png", back: "me" }, { front: "images/mo.png", back: "mo" }, 
  { front: "images/ya.png", back: "ya" }, { front: "images/yu.png", back: "yu" }, { front: "images/yo.png", back: "yo" },
  { front: "images/ra.png", back: "ra" }, { front: "images/ri.png", back: "ri" }, { front: "images/ru.png", back: "ru" },
  { front: "images/re.png", back: "re" }, { front: "images/ro.png", back: "ro" }, 
  { front: "images/wa.png", back: "wa" }, { front: "images/wo.png", back: "wo" }, { front: "images/n.png", back: "n" }
];

// --- STATE ---
let deck = [];
let current = 0;
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

let showDetails = false;

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
  if(showDetails) {
    document.getElementById("progress-details").textContent = details;
  }
  localStorage.setItem("progress", JSON.stringify(progress));
}

function toggleDetails() {
  showDetails = !showDetails;
  document.getElementById("progress-details").style.display = showDetails ? "block" : "none";
  updateProgress();
}

function markCorrect() {
  const front = deck[current].back ? deck[current].back : deck[current].front;
  progress[deck[current].back || deck[current].front].correct++;
  updateProgress();
  nextCard();
}

function markWrong() {
  progress[deck[current].back || deck[current].front].wrong++;
  updateProgress();
  nextCard();
}

function nextCard() {
  current = (current + 1) % deck.length;
  showCard();
}

// --- SHOW CARD WITH FLIP ---
function showCard() {
  if (!deck[current]) return;

  // Front = image (if picture mode), back = romaji
  let frontContent = (mode === "picture")
    ? `<img src="${deck[current].front}" alt="Hiragana">`
    : deck[current].front;

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

// --- SETUP CONTROLS ---
function setupControls() {
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
      break;
    case 'learn-hard':
      deck = shuffleDeck(cards.filter(c => progress[c.front].wrong > 0));
      if(deck.length === 0) deck = shuffleDeck(cards);
      break;
    case 'quiz':
      deck = shuffleDeck(cards);
      setupQuizControls();
      break;
    case 'picture':
      deck = shuffleDeck(pictureCards);
      break;
  }

  current = 0;
  setupControls();
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
      <button onclick="checkAnswer()">Submit</button>
    </div>
    <div id="feedback" style="text-align:center; margin-top:8px; font-weight:bold;"></div>
    <div class="row">
      <button onclick="deck = shuffleDeck(deck); current = 0; showCard();">🔀 Shuffle</button>
      <button onclick="resetProgress()">♻️ Reset</button>
    </div>
  `;
}

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
  input.value = "";
  setTimeout(() => {
    feedback.textContent = "";
    nextCard();
  }, 1000);
}
