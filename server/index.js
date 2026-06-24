const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = [];

let questions = [
  "¿Cuál es tu comida favorita?",
  "¿Qué harías con $1 millón?",
  "¿A dónde viajarías?",
  "¿Cuál es tu sueño?",
  "¿Tu película favorita?",
  "¿Tu hobby favorito?"
];

io.on("connection", (socket) => {
  console.log("Jugador conectado:", socket.id);

  socket.on("join", (name) => {
    players.push({ id: socket.id, name });
    io.emit("updatePlayers", players);
  });

  socket.on("spin", (playerName) => {

  io.emit("playerSpinning", playerName);

  let index = Math.floor(Math.random() * questions.length);

  let question = questions.splice(index, 1)[0];

  io.emit("spinResult", {
    question,
    index
  });

});

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    io.emit("updatePlayers", players);
  });
});

http.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});