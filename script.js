document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM READY");

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const matrixCanvas = document.getElementById("matrixCanvas");
  const mctx = matrixCanvas.getContext("2d");

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

  // ----- Build in-browser MNIST model -----
  function createModel() {
    const m = tf.sequential();
    m.add(tf.layers.flatten({ inputShape: [28, 28, 1] }));
    m.add(tf.layers.dense({ units: 128, activation: "relu" }));
    m.add(tf.layers.dense({ units: 10, activation: "softmax" }));
    m.compile({ optimizer: "adam", loss: "categoricalCrossentropy", metrics: ["accuracy"] });
    return m;
  }

  // ----- Initialize model -----
  model = createModel();
  console.log("MODEL READY");

  // ----- Predict -----
  window.predict = function () {
    if (!model) return;

    // Resize the drawn image to 28x28
    const temp = document.createElement("canvas");
    temp.width = 28;
    temp.height = 28;
    const tctx = temp.getContext("2d");
    tctx.drawImage(canvas, 0, 0, 28, 28);

    // Get pixel data
    const imgData = tctx.getImageData(0, 0, 28, 28);
    const input = new Float32Array(28 * 28);
    for (let i = 0; i < 28 * 28; i++) {
      const avg = (imgData.data[i * 4] + imgData.data[i * 4 + 1] + imgData.data[i * 4 + 2]) / 3;
      input[i] = (255 - avg) / 255;
    }

    const tensor = tf.tensor4d(input, [1, 28, 28, 1]);

    // Predict
    const output = model.predict(tensor).dataSync();
    const digit = output.indexOf(Math.max(...output));
    const confidence = Math.max(...output);

    document.getElementById("prediction").innerText = digit;
    document.getElementById("confidence").innerText = `Confidence: ${(confidence * 100).toFixed(2)}%`;

    drawMatrix(output);
  };

  // ----- Draw confusion/probability matrix -----
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
