document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  // ---------------------------
  // Canvas setup
  // ---------------------------
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

  // Clear canvas
  window.clearCanvas = function () {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById("prediction").innerText = "–";
    document.getElementById("confidence").innerText = "Confidence: –";

    // Clear confusion matrix
    mctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  };

  // ---------------------------
  // Load official TFJS MNIST model
  // ---------------------------
  const predictBtn = document.getElementById("predictBtn");
  let model = null;

  tf.loadLayersModel("https://storage.googleapis.com/tfjs-examples/mnist/model.json")
    .then(m => {
      model = m;
      predictBtn.disabled = false;
      console.log("MODEL LOADED");
    })
    .catch(err => console.error("Model load failed:", err));

  // ---------------------------
  // Prediction function
  // ---------------------------
  window.predict = function () {
    if (!model) return;

    // Resize canvas to 28x28
    const temp = document.createElement("canvas");
    temp.width = 28;
    temp.height = 28;
    const tctx = temp.getContext("2d");
    tctx.drawImage(canvas, 0, 0, 28, 28);

    const imgData = tctx.getImageData(0, 0, 28, 28);
    const data = imgData.data;
    const input = new Float32Array(28 * 28);

    // Convert to grayscale [0,1]
    for (let i = 0; i < 28 * 28; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const avg = (r + g + b) / 3;
      input[i] = (255 - avg) / 255; // invert colors
    }

    // Make tensor and predict
    const tensor = tf.tensor4d(input, [1, 28, 28, 1]);
    const output = model.predict(tensor);
    const probs = output.dataSync();

    // Prediction and confidence
    let digit = probs.indexOf(Math.max(...probs));
    let confidence = Math.max(...probs);

    document.getElementById("prediction").innerText = digit;
    document.getElementById("confidence").innerText = `Confidence: ${(confidence * 100).toFixed(2)}%`;

    // Draw confusion/probability matrix
    drawMatrix(probs);
  };

  // ---------------------------
  // Confusion matrix setup
  // ---------------------------
  const matrixCanvas = document.getElementById("matrixCanvas");
  const mctx = matrixCanvas.getContext("2d");
  mctx.font = "16px Arial";
  mctx.textAlign = "center";

  function drawMatrix(probs) {
    const cellSize = 30;
    const padding = 10;

    mctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    for (let i = 0; i < 10; i++) {
      const intensity = probs[i];
      mctx.fillStyle = `rgba(127,156,255,${intensity})`;
      mctx.fillRect(i * cellSize, 0, cellSize, cellSize);

      mctx.fillStyle = "#fff";
      mctx.fillText(i, i * cellSize + cellSize / 2, padding + 12);
    }
  }

  // ---------------------------
  // Theme toggle
  // ---------------------------
  window.toggleTheme = function () {
    document.body.classList.toggle("light");
  };
});
