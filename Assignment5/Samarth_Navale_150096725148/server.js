const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://rougeparrot_db_user:d4ds62FCCJvkri5I@hm-crud.idwimmo.mongodb.net/tictactoe";

const gameSchema = new mongoose.Schema(
  {
    playerX: { type: String, required: true },
    playerO: { type: String, required: true },
    winner: { type: String, required: true },
    totalMoves: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { bufferCommands: false }
);

const Game = mongoose.model("Game", gameSchema);

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.error("Database connection failed:", error.message));

const players = {
  X: null,
  O: null
};

let board = ["", "", "", "", "", "", "", "", ""];
let currentTurn = "X";
let gameStarted = false;
let moveCount = 0;

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function checkWinner() {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combination: combination };
    }
  }
  if (moveCount === 9 || !board.includes("")) {
    return { winner: "Draw" };
  }
  return null;
}

function resetGameState() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentTurn = "X";
  gameStarted = false;
  moveCount = 0;
  players.X = null;
  players.O = null;
}

function getPlayerCount() {
  let count = 0;
  if (players.X) count++;
  if (players.O) count++;
  return count;
}

io.on("connection", (socket) => {
  socket.emit("players-update", {
    count: getPlayerCount(),
    playerX: players.X ? players.X.username : null,
    playerO: players.O ? players.O.username : null
  });

  Game.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .then((history) => {
      socket.emit("history-data", history);
    })
    .catch(() => {
      socket.emit("history-data", []);
    });

  socket.on("get-history", () => {
    Game.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .then((history) => {
        socket.emit("history-data", history);
      })
      .catch(() => {
        socket.emit("history-data", []);
      });
  });

  socket.on("user-login", (username) => {
    if (!username || typeof username !== "string" || !username.trim()) {
      socket.emit("login-error", "Username cannot be empty");
      return;
    }

    const cleanUsername = username.trim();

    if (players.X && players.O) {
      socket.emit("login-error", "Game is full");
      return;
    }

    let assignedSymbol = null;
    if (!players.X) {
      players.X = { id: socket.id, username: cleanUsername };
      assignedSymbol = "X";
    } else if (!players.O) {
      players.O = { id: socket.id, username: cleanUsername };
      assignedSymbol = "O";
    }

    socket.emit("login-success", {
      symbol: assignedSymbol,
      username: cleanUsername
    });

    io.emit("players-update", {
      count: getPlayerCount(),
      playerX: players.X ? players.X.username : null,
      playerO: players.O ? players.O.username : null
    });

    if (players.X && players.O) {
      board = ["", "", "", "", "", "", "", "", ""];
      currentTurn = "X";
      gameStarted = true;
      moveCount = 0;

      io.emit("game-start", {
        playerX: players.X.username,
        playerO: players.O.username,
        currentTurn: "X",
        board: board
      });
    }
  });

  socket.on("make-move", async (index) => {
    let playerSymbol = null;
    if (players.X && players.X.id === socket.id) playerSymbol = "X";
    if (players.O && players.O.id === socket.id) playerSymbol = "O";

    if (!playerSymbol || !gameStarted) {
      return;
    }

    if (currentTurn !== playerSymbol) {
      return;
    }

    const cellIndex = Number(index);
    if (isNaN(cellIndex) || cellIndex < 0 || cellIndex > 8 || board[cellIndex] !== "") {
      return;
    }

    board[cellIndex] = playerSymbol;
    moveCount++;

    const result = checkWinner();

    if (result) {
      gameStarted = false;

      io.emit("move-made", {
        index: cellIndex,
        symbol: playerSymbol,
        board: board,
        nextTurn: null
      });

      io.emit("game-over", {
        winner: result.winner,
        combination: result.combination || null,
        playerX: players.X.username,
        playerO: players.O.username,
        totalMoves: moveCount
      });

      try {
        await Game.create({
          playerX: players.X.username,
          playerO: players.O.username,
          winner: result.winner,
          totalMoves: moveCount
        });

        const history = await Game.find().sort({ createdAt: -1 }).limit(10);
        io.emit("history-data", history);
      } catch (error) {
        console.error("Failed to save game history:", error.message);
      }
    } else {
      currentTurn = currentTurn === "X" ? "O" : "X";
      io.emit("move-made", {
        index: cellIndex,
        symbol: playerSymbol,
        board: board,
        nextTurn: currentTurn
      });
    }
  });

  socket.on("reset-game", () => {
    resetGameState();
    io.emit("game-reset");
    io.emit("players-update", {
      count: 0,
      playerX: null,
      playerO: null
    });
  });

  socket.on("disconnect", () => {
    let isPlayer = false;
    if (players.X && players.X.id === socket.id) isPlayer = true;
    if (players.O && players.O.id === socket.id) isPlayer = true;

    if (isPlayer) {
      resetGameState();
      io.emit("game-reset", { message: "Opponent disconnected" });
      io.emit("players-update", {
        count: 0,
        playerX: null,
        playerO: null
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
