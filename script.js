document.addEventListener("DOMContentLoaded", () => {

  console.log("DOM READY");

  // 1️⃣ Grab DOM elements FIRST
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const matrixCanvas = document.getElementById("matrixCanvas");
  const mctx = matrixCanvas.getContext("2d");

  const predictBtn = document.getElementById("predictBtn");

  // 2️⃣ Init canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3️⃣ Drawing logic
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

  // 4️⃣ Clear
  window.clearCanvas = function () {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById("prediction").innerText = "–";
    document.getElementById("confidence").innerText = "Confidence: –";
  };

  // 5️⃣ MODEL LOAD ⬅️ THIS GOES HERE
  let model = null;
  tf.loadLayersModel("https://raw.githubusercontent.com/guillaume-chevalier/MNIST_tfjs_model/main/model.json")
  .then(m => {
    model = m;
    predictBtn.disabled = false;
    console.log("MODEL LOADED");
  })

  // 6️⃣ Confusion matrix helper
  function drawMatrix(probs) {
    mctx.clearRect(0, 0, 300, 300);

    const cellSize = 30;

    for (let i = 0; i < 10; i++) {
      mctx.fillStyle = `rgba(127,156,255,${probs[i]})`;
      mctx.fillRect(i * cellSize, 0, cellSize, cellSize);
      mctx.fillStyle = "#fff";
      mctx.fillText(i, i * cellSize + 12, 20);
    }
  }

  // 7️⃣ Predict (uses model loaded above)
  window.predict = function () {
    if (!model) return;

    const imageData = ctx.getImageData(0, 0, 280, 280);

    const tensor = tf.browser
      .fromPixels(imageData, 1)
      .resizeNearestNeighbor([28, 28])
      .toFloat()
      .div(255)
      .expandDims(0);

    const probs = model.predict(tensor).dataSync();

    const digit = probs.indexOf(Math.max(...probs));
    const confidence = Math.max(...probs);

    document.getElementById("prediction").innerText = digit;
    document.getElementById("confidence").innerText =
      `Confidence: ${(confidence * 100).toFixed(2)}%`;

    drawMatrix(probs);
  };

});
