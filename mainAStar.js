class Point {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.isDragging = false;
    }
  }
  
  function drawPoint(ctx, n, point, radius = 5) {
  
    const cellSize = (600 - n + 1) / n;
    const x = point.x * (cellSize + 1) + cellSize / 2;
    const y = point.y * (cellSize + 1) + cellSize / 2;
  
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();
  }
  
  function mainAStar () {
  
  const sliderContainer = document.getElementById('slider-container');
  const slider = sliderContainer.querySelector('#slider');
  
  const sliderValueSpan = sliderContainer.querySelector('#slider-value');
  let n = parseInt(slider.value);
  slider.addEventListener('input', function() {
      sliderValueSpan.textContent = slider.value;
  });
  
  
  let mazeInput = generateMaze(n);
  drawMaze(mazeInput, n);
  
  const canvas = document.getElementById('mazeCanvas');
  const ctx = canvas.getContext("2d");
  let start = new Point(1, 1, "start");
  let end = new Point(n-2, n-2, "end");
  
  if (n % 2 == 0) {
      end.x = n-1;
      end.y = n-1;
  }
  
  drawPoint(n, start, "red");
  drawPoint(n, end, "green");
  
  canvas.addEventListener('click', function(event) {
  
    const cellSize = (canvas.width - n + 1) / n;
    const rect = canvas.getBoundingClientRect();
    let mouseX = parseInt((event.clientX - rect.left) / cellSize);
    let mouseY = parseInt((event.clientY - rect.left) / cellSize);
  
    if (choosingStart || choosingEnd) {
      if (choosingStart) {
          start.x = mouseX;
          start.y = mouseY;
          choosingStart = false;
      } else if (choosingEnd) {
          end.x = mouseX;
          end.y = mouseY;
          choosingEnd = false;
      }
      // клетка, куда кликаем, автоматически становится белой
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.left;
      const cellX = Math.floor(mouseX / (canvas.width / n));
      const cellY = Math.floor(mouseY / (canvas.height / n));
      mazeInput[cellY][cellX] = 0;
  
      drawMaze(mazeInput, n);
  
      drawPoint(n, start, "red");
      drawPoint(n, end, "green");
  
    }
    
  
    else {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.left;
  
      const cellX = Math.floor(mouseX / (canvas.width / n));
      const cellY = Math.floor(mouseY / (canvas.height / n));
  
      if (mazeInput[cellY][cellX] == 1) {
        mazeInput[cellY][cellX] = 0;
      } else {
        mazeInput[cellY][cellX] = 1;
      }
  
      drawMaze(mazeInput, n);
      drawPoint(n, start, "red");
      drawPoint(n, end, "green");
    }
  
  });
  
  const buttonMaze = document.getElementById("buttonGenerateMaze");
  const buttonPath = document.getElementById("buttonFindPath");
  
  const startButton = document.getElementById("startButton");
  const endButton = document.getElementById("endButton");
  
  let choosingStart = false;
  let choosingEnd = false;
  
  startButton.addEventListener('click', function() {
    choosingStart = true;
  });
  
  endButton.addEventListener('click', function() {
    choosingEnd = true;
  });
  
  buttonMaze.addEventListener('click', () => {
    n = parseInt(slider.value);
    mazeInput = generateMaze(n);
    drawMaze(mazeInput, n);
  
    drawPoint(n, start, "red");
    drawPoint(n, end, "green");
  
  })
  
  buttonPath.addEventListener('click', () => {
  
    console.log(mazeInput);
    console.log(start, end)
    const path = astar(mazeInput, start, end);
    console.log(path);
    drawPath(path, n);
  
  });
  }