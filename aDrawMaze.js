function drawMaze(mazeInput, n) {
  const canvas = document.getElementById("mazeCanvas");
	const ctx = canvas.getContext("2d");

  ctx.clearRect(0,0,600,600);
  const canvasWidth = 600;

  const margin = 1;
	const cellSize = (canvasWidth - n + 1) / n;

  for (let y = 0; y < mazeInput.length; y++) {
    for (let x = 0; x < mazeInput[y].length; x++) {

      if (mazeInput[y][x] === 1) {
        ctx.fillStyle = "black";
      } else ctx.fillStyle = "white";

      ctx.fillRect(
          x * (cellSize + margin) + margin + 1,
          y * (cellSize + margin) + margin + 1,
          cellSize,
          cellSize
      );

      ctx.strokeStyle = "black";
      ctx.strokeRect(
        x * (cellSize + margin) + margin,
        y * (cellSize + margin) + margin,
        cellSize,
        cellSize
      );
    }
  }
}