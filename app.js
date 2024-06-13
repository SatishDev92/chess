const express = require("express");
const socket = require("socket.io");
const path = require("path");
const http = require("http");
const { Chess } = require("chess.js");

// calling the expresss to use it .
const app = express();

// connecting our express server with socket.io and the socket use only http server so, performing the following thing.
const server = http.createServer(app);
const io = socket(server);

let players = {};
let currentPlayer = "w";
const chess = new Chess();

// setting up the view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (uniqueSocket) => {
    console.log("connected");
    if (!players.white) {
        players.white = uniqueSocket.id;
        uniqueSocket.emit("Player Role", "w");
    } else if (!players.black) {
        players.black = uniqueSocket.id;
        uniqueSocket.emit("Player Role", "b");
    } else {
        uniqueSocket.emit("Spectator Role");
    }

    uniqueSocket.on("disconnect", () => {
        if (uniqueSocket.id === players.white) {
            delete players.white;
        } else if (uniqueSocket.id === players.black) {
            delete players.black;
        }
    });

    uniqueSocket.on("move", (move) => {
        try {
            if (chess.turn() === "w" && uniqueSocket.id !== players.white) return;
            if (chess.turn() === "b" && uniqueSocket.id !== players.black) return;
            
            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", chess.fen());
                io.emit("boardState", chess.fen());
            } else {
                console.log("Invalid Move:", move);
                uniqueSocket.emit("InvalidMove", move);
            }
        } catch (error) {
            console.log(error);
            uniqueSocket.emit("InvalidMove", move);
        }
    });
});

app.get("/", function (req, res) {
    res.render("index", { title: "ChessGame" });
});

server.listen(3000, () => {
    console.log("listening on the port 3000");
});
