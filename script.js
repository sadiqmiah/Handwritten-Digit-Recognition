alert("SCRIPT LOADED");
console.log("script.js loaded");

// ================== CANVAS ==================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseleave", () => drawing = false);
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, 10, 0, Math.PI * 2);
  ctx.fill();
}

// ================== CLEAR ==================
function clearCanvas() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  document.getElementById("prediction").innerText = "–";
  document.getElementById("confidence").innerText = "Confidence: –";
}

// ================== MODEL ==================
let model = null;

tf.loadLayersModel(
  "https://storage.googleapis.com/tfjs-models/tfjs/mnist/model.json"
).then(m => {
  model = m;
  console.log("MODEL LOADED");
}).catch(err => console.error(err));

// ================== PREDICT ==================
function predict() {
  console.log("PREDICT CLICKED");

  if (!model) {
    console.log("MODEL NOT READY");
    return;
  }

  const temp = document.createElement("canvas");
  temp.width = 28;
  temp.height = 28;
  const tctx = temp.getContext("2d");

  tctx.drawImage(canvas, 0, 0, 28, 28);

  const img = tctx.getImageData(0, 0, 28, 28).data;
  const input = new Float32Array(28 * 28);

  for (let i = 0; i < 28 * 28; i++) {
    const avg =
      (img[i * 4] + img[i * 4 + 1] + img[i * 4 + 2]) / 3;
    input[i] = (255 - avg) / 255;
  }

  const tensor = tf.tensor4d(input, [1, 28, 28, 1]);
  const output = model.predict(tensor).dataSync();

  let digit = 0;
  let max = output[0];

  for (let i = 1; i < 10; i++) {
    if (output[i] > max) {
      max = output[i];
      digit = i;
    }
  }

  document.getElementById("prediction").innerText = digit;
  document.getElementById("confidence").innerText =
    `Confidence: ${(max * 100).toFixed(2)}%`;

  console.log("PREDICTED:", digit);
}

// ================== THEME ==================
function toggleTheme() {
  document.body.classList.toggle("light");
  console.log("THEME TOGGLED");
}
