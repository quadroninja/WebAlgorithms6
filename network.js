let canvas = document.getElementById("canvas");
canvas.width = 500;
canvas.height = 500;

let ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// var scaleFactor = 10; 
// ctx.scale(scaleFactor, scaleFactor);


let draw_color = "black";
let draw_width = "10";
let is_drawing = false;


canvas.addEventListener("mousedown", start, false);
canvas.addEventListener("mousemove", draw, false);
canvas.addEventListener("mouseup", stop, false);
canvas.addEventListener("mouseout", stop, false);

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


