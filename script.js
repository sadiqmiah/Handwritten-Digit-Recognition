const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const matrixCanvas = document.getElementById("matrixCanvas");
const matrixCtx = matrixCanvas.getContext("2d");

// Clear matrix on load
matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;

// Drawing
canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, 10, 0, Math.PI * 2);
  ctx.fill();
}

function clearCanvas() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  document.getElementById("prediction").innerText = "–";
}

// Load pretrained MNIST model
let model;
(async () => {
  model = await tf.loadLayersModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mnist/model.json"
  );
})();

async function predict() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const tfImg = tf.browser.fromPixels(imageData, 1)
    .resizeNearestNeighbor([28, 28])
    .toFloat()
    .div(255.0)
    .reshape([1, 28, 28, 1]);

  if (!window.model) {
    window.model = await tf.loadLayersModel("model/model.json");
  }

  const prediction = window.model.predict(tfImg);
  const probabilities = prediction.dataSync();

  let maxIndex = probabilities.indexOf(Math.max(...probabilities));
  let confidence = (probabilities[maxIndex] * 100).toFixed(2);

  document.getElementById("prediction").innerText = maxIndex;
  document.getElementById("confidence").innerText =
    `Confidence: ${confidence}%`;

  drawConfusionMatrix(maxIndex);
}

function toggleTheme() {
  document.body.classList.toggle("light");
}

function drawConfusionMatrix(predictedDigit) {
  matrixCtx.clearRect(0, 0, 300, 300);

  const size = 30;

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      matrixCtx.strokeStyle = "#aaa";
      matrixCtx.strokeRect(j * size, i * size, size, size);

      if (i === predictedDigit && j === predictedDigit) {
        matrixCtx.fillStyle = "rgba(0, 255, 255, 0.6)";
        matrixCtx.fillRect(j * size, i * size, size, size);
      }
    }
  }
}
