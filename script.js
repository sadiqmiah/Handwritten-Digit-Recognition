document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM READY");

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const matrixCanvas = document.getElementById("matrixCanvas");
  const mctx = matrixCanvas.getContext("2d");
  const predictBtn = document.getElementById("predictBtn");

  // Fill canvas black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let drawing = false;
  let model = null;

  // ----- Drawing -----
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

  // ----- Clear Canvas -----
  window.clearCanvas = function () {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById("prediction").innerText = "–";
    document.getElementById("confidence").innerText = "Confidence: –";
    mctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  };

  // ----- Load pretrained TFJS graph model -----
  try {
    model = await tf.loadLayersModel("./web_model/model.json");
    console.log("MODEL READY");
    predictBtn.disabled = false; // enable button
  } catch (err) {
    console.error("Model load failed:", err);
  }

  // ----- Predict -----
  window.predict = async function () {
  if (!model) return;

  const temp = document.createElement("canvas");
  temp.width = 28;
  temp.height = 28;
  const tctx = temp.getContext("2d");
  tctx.drawImage(canvas, 0, 0, 28, 28);

  const imgData = tctx.getImageData(0, 0, 28, 28);
  const input = new Float32Array(28 * 28);

  for (let i = 0; i < 28 * 28; i++) {
    const avg =
      imgData.data[i * 4] +
      imgData.data[i * 4 + 1] +
      imgData.data[i * 4 + 2];
    input[i] = (255 - avg) / (3 * 255);
  }

  const tensor = tf.tensor4d(input, [1, 28, 28, 1]);

  const output = model.predict(tensor);
  const probs = output.dataSync();

  const digit = probs.indexOf(Math.max(...probs));
  const confidence = Math.max(...probs);

  document.getElementById("prediction").innerText = digit;
  document.getElementById("confidence").innerText =
    `Confidence: ${(confidence * 100).toFixed(2)}%`;

  drawMatrix(probs);
};
  // ----- Draw probability/confusion matrix -----
  function drawMatrix(probs) {
    mctx.clearRect(0, 0, 300, 300);
    const cellSize = 30;
    for (let i = 0; i < 10; i++) {
      const intensity = probs[i];
      mctx.fillStyle = `rgba(127,156,255,${intensity})`;
      mctx.fillRect(i * cellSize, 0, cellSize, cellSize);

      mctx.fillStyle = "#fff";
      mctx.font = "16px Arial";
      mctx.fillText(i, i * cellSize + 10, 20);
    }
  }

  // ----- Theme toggle -----
  window.toggleTheme = function () {
    document.body.classList.toggle("light");
  };
});
