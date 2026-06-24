const socket = io();

let canvas = document.getElementById("wheelCanvas");
let ctx = canvas.getContext("2d");
let playerName = "";

let questions = [
  "¿Cuál es la función  del onceavo dedo ?",
  "¿Cómo se ajusta la presión de los rodillos?",
  "Menciona 3 componentes de la Komax 355",
  "Menciona los pasos para realizar el cambio de una boquilla",
  "¿Qué sucede si no retiramos el separador (cega) del Aplicador al momento de subirlo?",
  "¿Cuál es el método para realizar un cambio de cable?",
  "Qué es gramification?",
  "¿Cuántos botones de paro de emergencia tiene la maquina Komax 355?"
];

let colors = ["#C20B1D","#F16601","#F9CF0B","#00DD04","#00EAFF","#2307F2" ,"#A100E4","#FE25AA"];

let angle = 0;

function drawWheel() {
  let arc = (2 * Math.PI) / questions.length;

  for (let i = 0; i < questions.length; i++) {
    let start = angle + i * arc;

    // segmento
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 150, start, start + arc);
    ctx.fill();

    // texto
    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(start + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(questions[i], 130, 5);
    ctx.restore();
  }
}

function spin() {

  socket.emit("spin", playerName);

  let spins = Math.floor(Math.random() * 3600);
  angle += spins * Math.PI / 180;

  animateSpin(spins);
}

function animateSpin(spins) {
  let start = null;
  let duration = 4000;

  function animate(time) {
    if (!start) start = time;
    let progress = time - start;

    let ease = 1 - Math.pow(1 - progress / duration, 3);

    let current = spins * ease;

    angle = current * Math.PI / 180;

    ctx.clearRect(0, 0, 300, 300);
    drawWheel();

    if (progress < duration) {
      requestAnimationFrame(animate);
    } else {
      finishSpin();
    }
  }

  requestAnimationFrame(animate);
}

function finishSpin() {
  let arc = 360 / questions.length;
  let deg = (angle * 180 / Math.PI) % 360;

  let index = Math.floor((360 - deg) / arc) % questions.length;

  document.getElementById("question").innerText =
    "❓ " + questions[index];

  // quitar pregunta (no se repite)
  questions.splice(index, 1);

  drawWheel();
}

drawWheel();

function join() {
  let name = document.getElementById("name").value;

  if (!name) {
    alert("Escribe tu nombre");
    return;
  }

  playerName = name;

  socket.emit("join", name);

  console.log("Jugador conectado:", name);
}



socket.on("updatePlayers", (players) => {
  const list = document.getElementById("players");

  list.innerHTML = "";

  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    list.appendChild(li);
  });
});

socket.on("playerSpinning", (playerName) => {

  document.getElementById("turno").innerText =
    playerName + " está girando la ruleta 🎡";

});

socket.on("turnChanged", (player) => {

  document.getElementById("turno").innerText =
    "🎯 Turno de: " + player.name;

});