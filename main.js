window.onload = function(){

// Configurable
var fps = 60;
var boardWidth = 800;
var boardHeight = 600;
var playerWidth = 32;
var playerHeight = 32;
var bulletWidth = 8;
var bulletHeight = 8;
var playerSpeed = 10;
var bulletSpeed = 30;

// Controls
var LEFT = 65;
var UP = 87;
var RIGHT = 68;
var DOWN = 83;
var SPACE = 32;
var leftPressed = false;
var upPressed = false;
var rightPressed = false;
var downPressed = false;
var spacePressed = false;
var mouseX = 0;
var mouseY = 0;

// Player vars
var playerX = 0;
var playerY = 0;

// Bullets
var bullets = [];

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Class definitions
class Bullet {
    constructor() {
        var velocityX = mouseX - playerX;
        var velocityY = mouseY - playerY;
        var hippopotamus = Math.sqrt( velocityX**2 + velocityY**2);
        velocityX /= hippopotamus;
        velocityY /= hippopotamus;

        this.position = { x: playerX, y: playerY };
        this.velocity = { x: velocityX * bulletSpeed, y: velocityY * bulletSpeed };
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    isOut() {
        return this.position.x < 0 || this.position.y < 0 || this.position.x > boardWidth || this.position.y > boardHeight;
    }
}

function drawBullet(bullet) {
    ctx.beginPath();
    ctx.rect(bullet.position.x, bullet.position.y, bulletWidth, bulletHeight);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
}

function drawPlayer() {
    ctx.beginPath();
    ctx.rect(playerX, playerY, playerWidth, playerHeight);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}

function drawBoard() {
    ctx.beginPath();
    ctx.rect(0, 0, boardWidth, boardHeight);
    ctx.fillStyle = "#BBADA0";
    ctx.fill();
    ctx.closePath();
}

function draw() {
    drawBoard();
    drawPlayer();
    bullets.map(drawBullet);
}

// Update functions
function updatePlayer() {
    playerX -= leftPressed ? playerSpeed : 0;
    playerX += rightPressed ? playerSpeed : 0;
    playerY -= upPressed ? playerSpeed : 0;
    playerY += downPressed ? playerSpeed : 0;

    playerX = Math.min(Math.max(0, playerX), boardWidth);
    playerY = Math.min(Math.max(0, playerY), boardHeight);

    // Shoot bullet
    if (spacePressed) {
        bullets.push(new Bullet());
    }
}

function updateBullet(bullet) {
    bullet.update();
}

function isBulletIn(bullet) {
    return !bullet.isOut();
}

function update() {
    updatePlayer();
    bullets.map(updateBullet);
    bullets = bullets.filter(isBulletIn);
}

function gameLoop() {
    setTimeout(function() {
        requestAnimationFrame(gameLoop);
        update();
        draw();
    }, 1000 / fps);
}

gameLoop();

// Controls / Input
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener('mousemove', mouseHandler, false);

function keyDownHandler(e) {
	if(e.keyCode == LEFT) {
		leftPressed = true;
	} 
	else if(e.keyCode == UP) {
		upPressed = true;
	}
	else if(e.keyCode == DOWN) {
		downPressed = true;
	}
	else if(e.keyCode == RIGHT) {
		rightPressed = true;	
	}
	else if(e.keyCode == SPACE) {
		spacePressed = true;
	}
}

function keyUpHandler(e) {
	if(e.keyCode == LEFT) {
		leftPressed = false;
	} 
	else if(e.keyCode == UP) {
		upPressed = false;
	}
	else if(e.keyCode == DOWN) {
		downPressed = false;
	}
	else if(e.keyCode == RIGHT) {
		rightPressed = false;
	}
	else if(e.keyCode == SPACE) {
		spacePressed = false;
	}
}

function mouseHandler(e) {
    var rect = canvas.getBoundingClientRect();
    var mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    mouseX = mouse.x;
    mouseY = mouse.y;
}

};

