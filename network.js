let canvas = document.getElementById("canvas");
canvas.width = 500;
canvas.height = 500;

let ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// var scaleFactor = 10; 
// ctx.scale(scaleFactor, scaleFactor);


let draw_color = "white";
let draw_width = "35";
let is_drawing = false;


canvas.addEventListener("mousedown", start, false);
canvas.addEventListener("mousemove", draw, false);
canvas.addEventListener("mouseup", stop, false);
// canvas.addEventListener("mouseout", stop, false);

function start(event) {
    is_drawing = true;
    ctx.beginPath();
    ctx.moveTo(event.clientX - canvas.offsetLeft - 110, event.clientY - canvas.offsetTop - 100);
    event.preventDefault();
}

function draw(event) {
    if (is_drawing) {
        ctx.lineTo(event.clientX - canvas.offsetLeft-110, event.clientY - canvas.offsetTop-100);
        ctx.strokeStyle = draw_color;
        ctx.lineWidth = draw_width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
    }
    event.preventDefault();
}

function stop(event) {
    if (is_drawing) {
        ctx.stroke();
        ctx.closePath();
        is_drawing = false;
    }
    ctx.preventDefault();
}

function clear() {
    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

document.getElementById("clear-button").addEventListener("click", function () {clear()});

document.getElementById("play-button").addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'image.png';
    link.click();
  });


