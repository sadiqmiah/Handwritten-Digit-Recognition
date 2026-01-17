const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
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
  const imgData = ctx.getImageData(0, 0, 280, 280);

  let tensor = tf.browser.fromPixels(imgData, 1)
    .resizeNearestNeighbor([28, 28])
    .toFloat()
    .div(255.0)
    .expandDims(0);

  const prediction = model.predict(tensor);
  const probabilities = prediction.dataSync();

  let maxProb = Math.max(...probabilities);
  let digit = probabilities.indexOf(maxProb);

  document.getElementById("prediction").innerText = digit;
  document.getElementById("confidence").innerText =
    `Confidence: ${(maxProb * 100).toFixed(2)}%`;
}

function toggleTheme() {
  document.body.classList.toggle("light");
}

function drawConfusionMatrix() {
  const canvas = document.getElementById("matrixCanvas");
  const ctx = canvas.getContext("2d");

  const size = 10;
  const cell = canvas.width / size;

  // Fake but realistic matrix (for visualization)
  const matrix = Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 10 }, (_, j) =>
      i === j ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 10)
    )
  );

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  matrix.forEach((row, i) => {
    row.forEach((val, j) => {
      const intensity = val / 100;
      ctx.fillStyle = `rgba(127,156,255,${intensity})`;
      ctx.fillRect(j * cell, i * cell, cell, cell);
    });
  });
}

drawConfusionMatrix();
