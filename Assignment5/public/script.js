const socket = io();

const connectionStatus = document.getElementById("connection-status");
const playerCount = document.getElementById("player-count");

const loginSection = document.getElementById("login-section");
const usernameInput = document.getElementById("username-input");
const joinBtn = document.getElementById("join-btn");
const loginError = document.getElementById("login-error");

const waitingSection = document.getElementById("waiting-section");
const myName = document.getElementById("my-name");
const mySymbol = document.getElementById("my-symbol");

const gameSection = document.getElementById("game-section");
const playerXName = document.getElementById("player-x-name");
const playerOName = document.getElementById("player-o-name");
const userSymbol = document.getElementById("user-symbol");
const turnDisplay = document.getElementById("turn-display");
const cells = document.querySelectorAll(".cell");

const historyBody = document.getElementById("history-body");

const winnerModal = document.getElementById("winner-modal");
const winnerText = document.getElementById("winner-text");
const resetBtn = document.getElementById("reset-btn");

let currentSymbol = null;
let currentTurn = "X";
let activeX = "";
let activeO = "";
let isGameOver = false;

function updateTurn() {
  const name = currentTurn === "X" ? activeX : activeO;
  turnDisplay.textContent = `${name || "Player " + currentTurn} (${currentTurn})`;
}

function updateBoard(board) {
  cells.forEach((cell, i) => {
    cell.textContent = board[i];
  });
}

function renderHistory(history) {
  if (!history || history.length === 0) {
    historyBody.innerHTML = `<tr><td colspan="5" class="empty-cell">No games played yet</td></tr>`;
    return;
  }

  historyBody.innerHTML = history
    .map((game) => {
      const dateStr = new Date(game.createdAt).toLocaleString();
      let winnerLabel = game.winner;
      if (game.winner === "X") winnerLabel = `${game.playerX} (X)`;
      if (game.winner === "O") winnerLabel = `${game.playerO} (O)`;

      return `
        <tr>
          <td>${game.playerX}</td>
          <td>${game.playerO}</td>
          <td>${winnerLabel}</td>
          <td>${game.totalMoves}</td>
          <td>${dateStr}</td>
        </tr>
      `;
    })
    .join("");
}

joinBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (!username) {
    loginError.textContent = "Username cannot be empty";
    loginError.classList.remove("hidden");
    return;
  }
  loginError.classList.add("hidden");
  socket.emit("user-login", username);
});

usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    joinBtn.click();
  }
});

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (isGameOver) return;
    if (!currentSymbol) return;
    if (currentTurn !== currentSymbol) return;
    if (cell.textContent !== "") return;

    const index = parseInt(cell.getAttribute("data-index"), 10);
    socket.emit("make-move", index);
  });
});

resetBtn.addEventListener("click", () => {
  socket.emit("reset-game");
});

socket.on("connect", () => {
  connectionStatus.textContent = "Connected";
});

socket.on("disconnect", () => {
  connectionStatus.textContent = "Disconnected";
});

socket.on("login-success", (data) => {
  currentSymbol = data.symbol;
  userSymbol.textContent = data.symbol;
  mySymbol.textContent = data.symbol;
  myName.textContent = data.username;

  loginSection.classList.add("hidden");
  waitingSection.classList.remove("hidden");
  loginError.classList.add("hidden");
});

socket.on("login-error", (msg) => {
  loginError.textContent = msg;
  loginError.classList.remove("hidden");
});

socket.on("players-update", (data) => {
  playerCount.textContent = `${data.count}/2`;
  if (data.playerX) {
    playerXName.textContent = `${data.playerX} (X)`;
    activeX = data.playerX;
  }
  if (data.playerO) {
    playerOName.textContent = `${data.playerO} (O)`;
    activeO = data.playerO;
  }
  if (data.count === 0) {
    playerXName.textContent = "-";
    playerOName.textContent = "-";
    activeX = "";
    activeO = "";
  }
});

socket.on("game-start", (data) => {
  activeX = data.playerX;
  activeO = data.playerO;
  playerXName.textContent = `${data.playerX} (X)`;
  playerOName.textContent = `${data.playerO} (O)`;
  currentTurn = data.currentTurn;
  isGameOver = false;

  loginSection.classList.add("hidden");
  waitingSection.classList.add("hidden");
  gameSection.classList.remove("hidden");
  winnerModal.classList.add("hidden");

  updateTurn();
  updateBoard(data.board);
});

socket.on("move-made", (data) => {
  updateBoard(data.board);
  if (data.nextTurn) {
    currentTurn = data.nextTurn;
    updateTurn();
  }
});

socket.on("game-over", (data) => {
  isGameOver = true;
  if (data.winner === "Draw") {
    winnerText.textContent = "Game Draw!";
  } else {
    const winnerName = data.winner === "X" ? data.playerX : data.playerO;
    winnerText.textContent = `${winnerName} (${data.winner}) Wins!`;
  }
  winnerModal.classList.remove("hidden");
});

socket.on("game-reset", (data) => {
  currentSymbol = null;
  isGameOver = false;
  currentTurn = "X";

  winnerModal.classList.add("hidden");
  gameSection.classList.add("hidden");
  waitingSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
  usernameInput.value = "";

  cells.forEach((c) => (c.textContent = ""));

  if (data && data.message) {
    loginError.textContent = data.message;
    loginError.classList.remove("hidden");
  } else {
    loginError.classList.add("hidden");
  }
});

socket.on("history-data", (data) => {
  renderHistory(data);
});
