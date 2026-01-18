// ================== CANVAS ==================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
});
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
let modelLoaded = false;

async function loadModel() {
  document.getElementById("prediction").innerText = "Loading model...";
  document.getElementById("confidence").innerText = "";

  model = await tf.loadLayersModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mnist/model.json"
  );

  modelLoaded = true;

  document.getElementById("prediction").innerText = "Ready ✓";
  document.getElementById("confidence").innerText = "Draw a digit and click Predict";
  console.log("✅ MNIST model loaded");
}

loadModel();

// ================== PREDICT ==================
async function predict() {
  if (!modelLoaded) {
    return; // silently ignore clicks until ready
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let img = tf.browser
    .fromPixels(imageData, 1)
    .resizeNearestNeighbor([28, 28])
    .toFloat()
    .div(255.0)
    
  img = tf.sub(1, img);

  img = img.reshape([1, 28, 28, 1]);

  const prediction = model.predict(img);
  const probs = prediction.dataSync();

  const digit = probs.indexOf(Math.max(...probs));
  const confidence = (Math.max(...probs) * 100).toFixed(2);

  document.getElementById("prediction").innerText = digit;
  document.getElementById("confidence").innerText =
    `Confidence: ${confidence}%`;

  drawConfusionMatrix(digit);
}

// ================== CONFUSION MATRIX ==================
const matrixCanvas = document.getElementById("matrixCanvas");
const matrixCtx = matrixCanvas.getContext("2d");

matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);

function drawConfusionMatrix(predictedDigit) {
  matrixCtx.clearRect(0, 0, 300, 300);

  const size = 30;

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      matrixCtx.strokeStyle = "#aaa";
      matrixCtx.strokeRect(j * size, i * size, size, size);

      if (i === predictedDigit && j === predictedDigit) {
        matrixCtx.fillStyle = "rgba(0, 200, 255, 0.6)";
        matrixCtx.fillRect(j * size, i * size, size, size);
      }
    }
  }
}

// ================== THEME ==================
function toggleTheme() {
  document.body.classList.toggle("light");
}
