const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessBoard");

let draggedPieces = null;
let sourcePieces = null;
let playerRole = 'w';

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowindex + squareindex) % 2 === 0 ? "light" : "dark");
            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText = getPieceUnique(square);
                pieceElement.draggable = playerRole === square.color;
                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPieces = pieceElement;
                        sourcePieces = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceElement.addEventListener("dragend", () => {
                    draggedPieces = null;
                    sourcePieces = null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", function (e) {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", function (e) {
                e.preventDefault();
                if (draggedPieces) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourcePieces, targetSource);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });
    if(playerRole === "b"){
        boardElement.classList.add("flipped")
    } else {
        boardElement.classList.remove("flipped");
    }
};

const handleMove = (source, target) => {
    const move = chess.move({
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`
    });
    if (move) {
        socket.emit("move", move);
        renderBoard();
    } else {
        console.log("Invalid move");
    }
};

const getPieceUnique = (piece) => {
    const uniquePieces = {
        'p': '♙',
        'r': '♖',
        'n': '♘',
        'b': '♗',
        'q': '♕',
        'k': '♔',
        'P': '♟︎',
        'R': '♜',
        'N': '♞',
        'B': '♝',
        'Q': '♛',
        'K': '♚'
    };
    return uniquePieces[piece.type.toLowerCase()] || "";
};

socket.on("Player Role", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("Spectator Role", () => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (fen) => {
    chess.load(fen);
    renderBoard();
});

renderBoard();
