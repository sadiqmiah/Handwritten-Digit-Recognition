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
let pendingPredict = false;

// Load MNIST model
tf.loadLayersModel("https://storage.googleapis.com/tfjs-models/tfjs/mnist/model.json")
  .then(loadedModel => {
    model = loadedModel;
    console.log("Model loaded ✅");

    // Run pending prediction if user clicked predict early
    if (pendingPredict) {
      predict();
      pendingPredict = false;
    }
  })
  .catch(err => console.error("Model failed to load:", err));

// ================== PREDICT ==================
function predict() {
  if (!model) {
    // Model not ready yet, set flag and return
    pendingPredict = true;
    return;
  }

  // Resize canvas to 28x28 for model
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 28;
  tempCanvas.height = 28;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(canvas, 0, 0, 28, 28);

  const imgData = tempCtx.getImageData(0, 0, 28, 28);
  const data = imgData.data;

  // Prepare Float32Array for model
  const input = new Float32Array(28 * 28);

  for (let i = 0; i < 28 * 28; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const avg = (r + g + b) / 3;
    // Invert colors: digit = 1, background = 0
    input[i] = (255 - avg) / 255;
  }

  // Create tensor
  const tensor = tf.tensor4d(input, [1, 28, 28, 1]);

  // Predict
  const prediction = model.predict(tensor);
  const probs = prediction.dataSync();

  const digit = probs.indexOf(Math.max(...probs));
  const confidence = (Math.max(...probs) * 100).toFixed(2);

  // Update HTML
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
