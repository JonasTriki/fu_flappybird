window.addEventListener("load", init);

var fired = false;
window.addEventListener("keydown", function(e) {
    if (!fired && (e.keyCode || e.which) == 32) {
        fired = true;
        cup.yv = cup.dyv;
    }
});
window.addEventListener("keyup", function(e) {
    var code = e.keyCode || e.which;
    if (fired && code == 32) {
        fired = false;
    } else if (code == 68) {
        debug = !debug;
    }
});

var canvas, ctx;
var imgs, cup, pipes;
var pipeDelay = 0;
var debug = false;

function init() {

    // Load DOM
    canvas = document.querySelector("#game");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // Load images then start game.
    cup = {x: 100, y: 10, dyv: -5, yv: 1, angle: 0};
    pipes = [];
    loadImages();
}

function loadImages() {
    imgs = {};
    var cupImg = new Image();
    cupImg.onload = function () {
        imgs.cup = cupImg;
        var pipeImg = new Image();
        pipeImg.onload = function () {
            imgs.pipe = pipeImg;

            // Images loaded, start game.
            setInterval(gameLoop, 1000 / 60);
        };
        pipeImg.src = "img/pipe.png";
    };
    cupImg.src = "img/cup.png";
}

function rotate(x, y, w, h, angle) {
    ctx.translate(x + w /2, y + h / 2);
    ctx.rotate(angle * Math.PI / 180);
}

function drawImage(img, x, y, w, h) {
    ctx.drawImage(img, x, y, w, h);
    if (debug) {
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = "1";
        ctx.rect(x, y, w, h);
        ctx.stroke();
    }
}

function draw() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pipes
    for (var i = pipes.length - 1; i >= 0; i--) {
        drawImage(imgs.pipe, pipes[i].x, pipes[i].y0, imgs.pipe.width, imgs.pipe.height);
        drawImage(imgs.pipe, pipes[i].x, pipes[i].y1, imgs.pipe.width, imgs.pipe.height);
        pipes[i].x--;
        if (pipes[i].x <= -imgs.pipe.width) {
            pipes.splice(i, 1);
        }
    }

    // Draw cup
    ctx.save();
    rotate(cup.x, cup.y, imgs.cup.width, imgs.cup.height, cup.angle);
    drawImage(imgs.cup, -imgs.cup.width / 2, -imgs.cup.height / 2, imgs.cup.width, imgs.cup.height);
    ctx.restore();
    ctx.restore();
}

function createPipe() {
    var cmh = 100; // Cup max height
    var y0 = Math.max(-(canvas.height - cmh) * Math.random(), -100);
    var y1 = y0 + imgs.pipe.height + 150;
    pipe = {x: 600, y0: y0, y1: y1};
    pipes.push(pipe);
    pipeDelay = 0;
}

function overlap(x, y, w, h, x2, y2, w2, h2) {
    return x < x2 + w2 && x + w > x2 && y < y2 + h2 && y + h > y2;
}

function gameLoop() {
    draw();

    // Check if we overlap with a pipe.
    for (var i = 0; i < pipes.length; i++) {
        var p = pipes[i];
        
        // TODO: check polygons
        // https://stackoverflow.com/questions/10962379/how-to-check-intersection-between-2-rotated-rectangles
        // and rotate rectangle points:
        // https://stackoverflow.com/questions/2259476/rotating-a-point-about-another-point-2d
        if (overlap(cup.x, cup.y, imgs.cup.width, imgs.cup.height, p.x, p.y0, imgs.pipe.width, imgs.pipe.height) ||
            overlap(cup.x, cup.y, imgs.cup.width, imgs.cup.height, p.x, p.y1, imgs.pipe.width, imgs.pipe.height)) {
            console.log("dead");
            break;
        }
    }

    // Move cup
    cup.y += cup.yv;
    cup.yv += 0.2;
    cup.angle += cup.yv;
    if (cup.angle <= -20) {
        cup.angle = -20;
    } else if (cup.angle >= 180) {
        cup.angle = 180;
    }

    // Add move pipes if needed.
    pipeDelay++;
    if (pipes.length <= 10 && pipeDelay == 125) createPipe();
}
