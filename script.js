// ================== CANVAS ==================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;

// Drawing
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

// Load the model silently in the background
(async () => {
  model = await tf.loadLayersModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mnist/model.json"
  );
  console.log("Model loaded ✅");
})();

// ================== PREDICT ==================
async function predict() {
  if (!model) return;

  // Get image data and resize to 28x28
  const offCanvas = document.createElement("canvas");
  offCanvas.width = 28;
  offCanvas.height = 28;
  const offCtx = offCanvas.getContext("2d");
  
  tempCtx.drawImage(canvas, 0, 0, 28, 28);

  const imgData = offCtx.getImageData(0, 0, 28, 28);
  const data = imgData.data;

  // Create a Float32Array for the model
  const input = new Float32Array(28 * 28);

  for (let i = 0; i < 28 * 28; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    const avg = (r + g + b) / 3;
    // invert so digit = 1, background = 0
    input[i] = (255 - avg) / 255;
  }

  const tensor = tf.tensor4d(input, [1, 28, 28, 1]);

  const prediction = model.predict(tensor);
  const probs = prediction.dataSync();

  const digit = probs.indexOf(Math.max(...probs));
  const confidence = (Math.max(...probs) * 100).toFixed(2);

  document.getElementById("prediction").innerText = digit;
  document.getElementById("confidence").innerText = `Confidence: ${confidence}%`;

  drawConfusionMatrix(digit);
}

// ================== CONFUSION MATRIX ==================
const matrixCanvas = document.getElementById("matrixCanvas");
const matrixCtx = matrixCanvas.getContext("2d");

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
