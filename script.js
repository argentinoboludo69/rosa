// Jogo da memória: encontre os 6 pares e conheça mensagens de conscientização.
const cardsData = [
  { id: "laco", symbol: "🎀", label: "Laço rosa", tip: "O laço rosa é um símbolo da conscientização sobre o câncer de mama." },
  { id: "coracao", symbol: "💗", label: "Cuidado", tip: "Conversar sobre saúde e acolher as pessoas também é uma forma de cuidar." },
  { id: "flor", symbol: "🌸", label: "Atenção", tip: "Conhecer as mudanças habituais do próprio corpo ajuda a notar sinais diferentes." },
  { id: "lupa", symbol: "🔎", label: "Observe", tip: "Nódulos ou alterações na pele da mama devem ser avaliados por profissionais de saúde." },
  { id: "hospital", symbol: "🏥", label: "Saúde", tip: "Em caso de dúvidas ou alterações, procure uma unidade de saúde para orientação." },
  { id: "sol", symbol: "☀️", label: "Bem-estar", tip: "Praticar atividade física e manter hábitos saudáveis faz bem à saúde." }
];

const grid = document.getElementById("memory-grid");
const pairsElement = document.getElementById("pairs");
const movesElement = document.getElementById("moves");
const timerElement = document.getElementById("timer");
const feedbackElement = document.getElementById("game-feedback");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const winMessage = document.getElementById("win-message");
const winDescription = document.getElementById("win-description");

let firstCard = null;
let secondCard = null;
let locked = false;
let pairs = 0;
let moves = 0;
let seconds = 0;
let timerInterval = null;
let flipTimeout = null;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

function startTimer() {
  if (timerInterval !== null) return;
  timerInterval = setInterval(() => {
    seconds++;
    timerElement.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  if (timerInterval !== null) clearInterval(timerInterval);
  timerInterval = null;
}

function updateScore() {
  pairsElement.textContent = `${pairs} / ${cardsData.length}`;
  movesElement.textContent = String(moves);
  progressFill.style.width = `${(pairs / cardsData.length) * 100}%`;
  progressBar.setAttribute("aria-valuenow", String(pairs));
}

function turnCard(card, faceUp) {
  card.classList.toggle("is-flipped", faceUp);
  const data = cardsData.find(item => item.id === card.dataset.id);
  card.setAttribute("aria-label", faceUp ? `${data.label}, carta virada` : "Carta virada para baixo");
}

function selectCard(card) {
  if (locked || card === firstCard || card.classList.contains("is-matched")) return;
  startTimer();
  turnCard(card, true);

  if (firstCard === null) {
    firstCard = card;
    feedbackElement.textContent = "Agora escolha outra carta!";
    return;
  }

  secondCard = card;
  moves++;
  updateScore();
  locked = true;

  if (firstCard.dataset.id === secondCard.dataset.id) {
    const match = cardsData.find(item => item.id === card.dataset.id);
    firstCard.classList.add("is-matched");
    secondCard.classList.add("is-matched");
    firstCard.disabled = true;
    secondCard.disabled = true;
    firstCard.setAttribute("aria-label", `${match.label}, par encontrado`);
    secondCard.setAttribute("aria-label", `${match.label}, par encontrado`);
    pairs++;
    updateScore();
    feedbackElement.textContent = `✨ ${match.tip}`;
    firstCard = null;
    secondCard = null;
    locked = false;

    if (pairs === cardsData.length) {
      stopTimer();
      winDescription.textContent = `Você encontrou todos os pares em ${moves} jogadas e ${formatTime(seconds)}. Continue espalhando cuidado!`;
      winMessage.hidden = false;
      feedbackElement.textContent = "Parabéns! Todos os pares foram encontrados. 🎉";
    }
  } else {
    feedbackElement.textContent = "Ainda não foi dessa vez. Tente lembrar onde estavam!";
    flipTimeout = setTimeout(() => {
      turnCard(firstCard, false);
      turnCard(secondCard, false);
      firstCard = null;
      secondCard = null;
      locked = false;
      flipTimeout = null;
    }, 850);
  }
}

function resetGame() {
  // Evita que um jogo anterior vire cartas do jogo novo.
  if (flipTimeout !== null) clearTimeout(flipTimeout);
  flipTimeout = null;
  stopTimer();
  firstCard = null;
  secondCard = null;
  locked = false;
  pairs = 0;
  moves = 0;
  seconds = 0;
  timerElement.textContent = "00:00";
  feedbackElement.textContent = "Vire duas cartas para começar! 💗";
  winMessage.hidden = true;
  updateScore();
  grid.innerHTML = "";

  const deck = shuffle(cardsData.flatMap(item => [item, item]));
  deck.forEach((data, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "memory-card";
    card.dataset.id = data.id;
    card.setAttribute("aria-label", `Carta ${index + 1}, virada para baixo`);
    card.innerHTML = `
      <span class="card-inner">
        <span class="card-face card-back" aria-hidden="true">♡</span>
        <span class="card-face card-front" aria-hidden="true">
          <span class="card-symbol">${data.symbol}</span>
          <span class="card-label">${data.label}</span>
        </span>
      </span>`;
    card.addEventListener("click", () => selectCard(card));
    grid.appendChild(card);
  });
}

document.getElementById("reset-game").addEventListener("click", resetGame);
document.getElementById("play-again").addEventListener("click", resetGame);
resetGame();
