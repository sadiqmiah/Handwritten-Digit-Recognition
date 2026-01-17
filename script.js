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
