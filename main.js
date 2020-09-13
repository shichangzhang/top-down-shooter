window.onload = function(){

// Configurable
var fps = 60;
var boardWidth = 800;
var boardHeight = 600;

// Constants
var LEFT = 65;
var UP = 87;
var RIGHT = 68;
var DOWN = 83;
var SPACE = 32;

// Global vars
var bullets = [];
var players = [];

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Class definitions
class InputState {
    leftPressed = false;
    upPressed = false;
    rightPressed = false;
    downPressed = false;
    spacePressed = false;
    mouseX = 0;
    mouseY = 0;
}

class Bullet {
    width = 8;
    height = 8;
    speed = 30;
    colour = "black";

    constructor(player) {
        var velocityX = player.input.mouseX - player.position.x;
        var velocityY = player.input.mouseY - player.position.y;
        var hippopotamus = Math.sqrt( velocityX**2 + velocityY**2);
        velocityX /= hippopotamus;
        velocityY /= hippopotamus;

        this.position = { x: player.position.x, y: player.position.y };
        this.velocity = { x: velocityX * this.speed, y: velocityY * this.speed };
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    isOut() {
        return this.position.x < 0 || this.position.y < 0 || this.position.x > boardWidth || this.position.y > boardHeight;
    }
}

class Player {
    width = 32;
    height = 32;
    speed = 10;
    colour = "red";

    constructor(x = 0, y = 0) {
        this.position = { x: x, y: y };
        this.velocity = { x: x, y: y };
        this.input = new InputState();
    }

    update() {
        this.position.x -= this.input.leftPressed ? this.speed : 0;
        this.position.x += this.input.rightPressed ? this.speed : 0;
        this.position.y -= this.input.upPressed ? this.speed : 0;
        this.position.y += this.input.downPressed ? this.speed : 0;

        this.position.x = Math.min(Math.max(0, this.position.x), boardWidth);
        this.position.y = Math.min(Math.max(0, this.position.y), boardHeight);

        // Shoot bullet
        if (this.input.spacePressed) {
            bullets.push(new Bullet(this));
        }
    }
}

function drawSprite(sprite) {
    ctx.beginPath();
    ctx.rect(sprite.position.x, sprite.position.y, sprite.width, sprite.height);
    ctx.fillStyle = sprite.colour;
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
    players.map(drawSprite);
    bullets.map(drawSprite);
}

// Update functions
function updateSprite(sprite) {
    sprite.update();
}

function isBulletIn(bullet) {
    return !bullet.isOut();
}

function update() {
    players.map(updateSprite);
    bullets.map(updateSprite);
    bullets = bullets.filter(isBulletIn);
}

function gameLoop() {
    setTimeout(function() {
        requestAnimationFrame(gameLoop);
        update();
        draw();
    }, 1000 / fps);
}

// Start game loop
gameLoop();

// Players
var humanPlayer = new Player();
players.push(humanPlayer);

// Controls / Input
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener('mousemove', mouseHandler, false);

function keyDownHandler(e) {
	if(e.keyCode == LEFT) {
		humanPlayer.input.leftPressed = true;
	} 
	else if(e.keyCode == UP) {
		humanPlayer.input.upPressed = true;
	}
	else if(e.keyCode == DOWN) {
		humanPlayer.input.downPressed = true;
	}
	else if(e.keyCode == RIGHT) {
		humanPlayer.input.rightPressed = true;	
	}
	else if(e.keyCode == SPACE) {
		humanPlayer.input.spacePressed = true;
	}
}

function keyUpHandler(e) {
	if(e.keyCode == LEFT) {
		humanPlayer.input.leftPressed = false;
	} 
	else if(e.keyCode == UP) {
		humanPlayer.input.upPressed = false;
	}
	else if(e.keyCode == DOWN) {
		humanPlayer.input.downPressed = false;
	}
	else if(e.keyCode == RIGHT) {
		humanPlayer.input.rightPressed = false;
	}
	else if(e.keyCode == SPACE) {
		humanPlayer.input.spacePressed = false;
	}
}

function mouseHandler(e) {
    var rect = canvas.getBoundingClientRect();
    var mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    humanPlayer.input.mouseX = mouse.x;
    humanPlayer.input.mouseY = mouse.y;
}

};

