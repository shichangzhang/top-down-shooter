window.onload = function(){

// Configurable
var fps = 60;
var board = { width: 800, height: 600 };
var cooldown = 10;

// Constants
var LEFT = 65;
var UP = 87;
var RIGHT = 68;
var DOWN = 83;
var SPACE = 32;

// Global vars
var bullets = [];
var players = [];
var bots = [];

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
        return this.position.x < 0 || this.position.y < 0 || this.position.x > board.width || this.position.y > board.height;
    }
}

class Player {
    width = 32;
    height = 32;
    speed = 10;
    colour = "red";
    reloading = false;
    cooldown = 0;

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

        clamp(this);

        // Reload
        if (this.reloading) {
            if (this.cooldown == 0) {
                this.reloading = false;
            }
            this.cooldown -= 1;
        }

        // Shoot bullet
        if (!this.reloading && this.input.spacePressed) {
            bullets.push(new Bullet(this));
            this.reloading = true;
            this.cooldown = cooldown;
        }
    }
}

class Bot extends Player {
    updateInputs() {
        // Overwrite this for each bot
    }
}

function drawSprite(sprite) {
    ctx.beginPath();
    ctx.rect(sprite.position.x - sprite.width/2, sprite.position.y - sprite.height/2, sprite.width, sprite.height);
    ctx.fillStyle = sprite.colour;
    ctx.fill();
    ctx.closePath();
}

function drawBoard() {
    ctx.beginPath();
    ctx.rect(0, 0, board.width, board.height);
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

// Bots
var botPlayer = new Player();
players.push(botPlayer);
bots.push(botPlayer);
botPlayer.updateInputs = aimBotRandomMover;
botPlayer.colour = "blue";

// Different bot types
function aimBotRandomMover() {
    this.input.spacePressed = true;
    this.input.mouseX = humanPlayer.position.x;
    this.input.mouseY = humanPlayer.position.y;

    if (typeof this.target === 'undefined') {
        this.target = {
            x: Math.floor(Math.random() * board.width),
            y: Math.floor(Math.random() * board.height)
        };
    }

    if (distance(this.position, this.target) < 30) {
        this.target = {
            x: Math.floor(Math.random() * board.width),
            y: Math.floor(Math.random() * board.height)
        };
    }

    var diff = { x: Math.abs(this.target.x - this.position.x), y: Math.abs(this.target.y - this.position.y) };
    this.input.leftPressed = diff.x > 10 && this.position.x > this.target.x;
    this.input.rightPressed = diff.x > 10 && this.position.x < this.target.x;
    this.input.upPressed = diff.y > 10 && this.position.y > this.target.y;
    this.input.downPressed = diff.y > 10 && this.position.y < this.target.y;
};

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

// Bot input update loop
function updateBotInputs() {
    setTimeout(function() {
        requestAnimationFrame(updateBotInputs);
        bots.map(function (bot) { bot.updateInputs(); });
    }, 1000 / fps);
}
updateBotInputs();

// Helper functions
function distance(a, b) {
    return Math.sqrt( (a.x - b.x)**2 + (a.y - b.y)**2);
}

function clamp(sprite) {
    var min = { x: sprite.width/2, y: sprite.height/2 };
    var max = { x: board.width - sprite.width/2, y: board.height - sprite.height/2 };
    sprite.position.x = Math.min(Math.max(min.x, sprite.position.x), max.x);
    sprite.position.y = Math.min(Math.max(min.y, sprite.position.y), max.y);
}

};

