# Real-Time Multiplayer Tic Tac Toe

A simple, real-time multiplayer 2-player Tic Tac Toe web application built with Node.js, Express, Socket.io, and MongoDB with Mongoose.

## Technologies

- **Backend**: Node.js, Express, Socket.io, Mongoose, dotenv, cors
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: MongoDB

## Features

- Real-time 2-player gameplay via Socket.io
- Automatic role assignment (Player 1 as X, Player 2 as O)
- Player cap of 2 players (extra connections receive "Game is full")
- Server-authoritative turn validation, move verification, win, and draw detection
- Live connection status indicator and active player count
- Animated winner and draw notification modal
- Completed match history persisted in MongoDB and rendered in real-time
- Game reset requiring players to enter usernames again
- Opponent disconnect detection and lobby reset

## Folder Structure

```text
Assignment5/
├── server.js
├── package.json
├── .env
├── README.md
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

## Installation

1. Clone or navigate to the project directory.
2. Install dependencies:

```bash
npm install
```

## MongoDB Setup

Ensure MongoDB is installed and running locally on the default port `27017` or have a remote MongoDB URI ready.

To start local MongoDB service (e.g. with brew or system service):

```bash
brew services start mongodb-community
```

## Environment Variables (.env)

Create or verify the `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/tictactoe
PORT=3000
```

## How to Run

Start the server:

```bash
npm start
```

Or directly with Node:

```bash
node server.js
```

Open `http://localhost:3000` in your web browser.

## How to Test with Two Players

1. Open `http://localhost:3000` in a browser window (Window 1).
2. Enter a username (e.g. `Rahul`) and click **Join Game**. Window 1 is assigned symbol `X`.
3. Open `http://localhost:3000` in a private / incognito browser window (Window 2).
4. Enter another username (e.g. `Sam`) and click **Join Game**. Window 2 is assigned symbol `O`.
5. The game starts automatically.
6. Make alternating moves starting with `X`.
7. Once a player wins or all cells are filled (Draw), the winner modal will appear and the record is stored in MongoDB.
8. Click **Play Again** to reset the game and return both players to the login screen.
9. To test third-player rejection, open a third window while two players are connected and attempt to join (receives "Game is full").

## Socket Events

### Client → Server

- `user-login`: Sends username to join the game.
- `make-move`: Sends the clicked cell index `(0-8)`.
- `reset-game`: Requests a game reset and returns players to login.
- `get-history`: Fetches the latest 10 completed games.

### Server → Client

- `login-success`: Confirms login with assigned symbol (`X` or `O`) and username.
- `login-error`: Returns error message (e.g. "Game is full" or "Username cannot be empty").
- `players-update`: Broadcasts active player count and usernames.
- `game-start`: Broadcasts game start payload with player info, initial turn, and empty board.
- `move-made`: Broadcasts updated board state and next turn.
- `game-over`: Broadcasts winner information (`X`, `O`, or `Draw`), winning combination, and move count.
- `game-reset`: Notifies clients to clear board and return to login screen.
- `history-data`: Sends recent match history array.

## Database Structure

The single Mongoose `Game` schema stores completed game records:

```javascript
{
  playerX: String,
  playerO: String,
  winner: String, // "X", "O", or "Draw"
  totalMoves: Number,
  createdAt: Date
}
```
