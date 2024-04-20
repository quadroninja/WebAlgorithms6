function drawPoint(n, point, color = "red") {

  const canvas = document.getElementById('mazeCanvas');
  const ctx = canvas.getContext("2d");
  const cellSize = (canvas.width - n + 1) / n;
  const radius = cellSize / 2;
  const x = point.x * (cellSize + 1) + cellSize / 2;
  const y = point.y * (cellSize + 1) + cellSize / 2;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
}


function drawCell(n, x, y, color="rgba(150, 176, 81, 1)"){
  const canvas = document.getElementById('mazeCanvas');
  const ctx = canvas.getContext("2d");
  const margin = 1;
  const cellSize = (canvas.width - n + 1) / n;

  ctx.fillStyle = color;

  ctx.fillRect(
    x * (cellSize + margin) + margin + 1,
    y * (cellSize + margin) + margin + 1,
    cellSize,
    cellSize
  );
  //обводочка клеток
  ctx.strokeStyle = "black";
  ctx.strokeRect(
    x * (cellSize + margin) + margin,
    y * (cellSize + margin) + margin,
    cellSize,
    cellSize
  );
}

function drawPath(path, n) {
  for (let i = 0; i < path.length; i++) {
      setTimeout(() => { drawCell(n, path[i][1], path[i][0], "rgba(235, 79, 41, 1)"); }, 200);
    }
}