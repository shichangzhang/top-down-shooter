window.onload = function(){

// Configurable
var fps = 60;
var board = { width: 800, height: 600 };
var cooldown = 10;
var gameLength = 10; // seconds
var timer = gameLength * fps;
var winningScore = 10;

// Constants
var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var SPACE = 32;
var ROTATE_C = 88;
var ROTATE_AC = 90;

// Global vars
var gameOver = false;
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
    rotateClockwise = false;
    rotateAnticlockwise = false;
    mouseX = 0;
    mouseY = 0;
}

class Bullet {
    radius = 4;
    speed = 30;
    colour = "black";

    constructor(player) {
        var velocityX = -Math.sin(player.direction * (Math.PI/180));
        var velocityY = Math.cos(player.direction * (Math.PI/180));

        this.position = { x: player.position.x, y: player.position.y };
        this.velocity = { x: velocityX * this.speed, y: velocityY * this.speed };
        this.shooter = player;
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
    name = "No name";
    radius = 16;
    speed = 10;
    rotationSpeed = 3;
    colour = "red";
    reloading = false;
    cooldown = 0;
    score = 0;
    // set 0 as straight down, 90 as straight left (i.e. ticks up clockwise, 0-360)
    direction = 30;

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
        
        this.direction += this.input.rotateClockwise ? this.rotationSpeed : 0;
        this.direction -= this.input.rotateAnticlockwise ? this.rotationSpeed : 0;

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
    let rotRad = (sprite.direction*Math.PI/180) + Math.PI/2;
    ctx.fillStyle = sprite.colour;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.arc(sprite.position.x, sprite.position.y, sprite.radius, rotRad + Math.PI/4, rotRad - Math.PI/4);
    ctx.quadraticCurveTo(
        sprite.position.x - sprite.radius*Math.cos(rotRad), 
        sprite.position.y - sprite.radius*Math.sin(rotRad), 
        sprite.position.x + sprite.radius*Math.cos(rotRad), 
        sprite.position.y + sprite.radius*Math.sin(rotRad));
    ctx.quadraticCurveTo(
        sprite.position.x - sprite.radius*Math.cos(rotRad), 
        sprite.position.y - sprite.radius*Math.sin(rotRad), 
        sprite.position.x + sprite.radius*Math.cos(rotRad + Math.PI/4), 
        sprite.position.y + sprite.radius*Math.sin(rotRad + Math.PI/4));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawBullet(sprite) {
    ctx.beginPath();
    ctx.arc(sprite.position.x, sprite.position.y, sprite.radius, 0, Math.PI*2);
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
    bullets.map(drawBullet);
}

// Collision
function detectCollisions() {
    for (var i = 0; i < players.length; i++) {
        for (var j = 0; j < bullets.length; j++) {
            if (collides(players[i], bullets[j])) {
                console.log(players[i].name, "got shot by", bullets[j].shooter.name);
                bullets[i].shooter.score += 1;
            }
        }
    }
}

// Check if game is over
function checkGameOver() {
    if (timer <= 0) {
        gameOver = true;
    }
    if (players.filter(function(player) { return player.score >= winningScore; }).length > 0) {
        gameOver = true;
    }
    timer--;
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
        checkGameOver();
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
            detectCollisions();
            update();
            draw();
        }
    }, 1000 / fps);
}

// Start game loop
gameLoop();

// Players
var humanPlayer = new Player();
humanPlayer.name = "You";
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
    // set bot direction
    let deltaX = this.position.x - humanPlayer.position.x;
    let deltaY = this.position.y - humanPlayer.position.y;
    let hypotenuse = Math.sqrt(deltaX**2 + deltaY**2);
    if (deltaY > 0) {
        this.direction = (Math.PI - Math.asin(deltaX/hypotenuse)) * (180/Math.PI);
    } else {
        this.direction = Math.asin(deltaX/hypotenuse) * (180/Math.PI);
    }

    

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
    else if(e.keyCode == ROTATE_C) {
        humanPlayer.input.rotateClockwise = true;
    }
    else if(e.keyCode == ROTATE_AC) {
        humanPlayer.input.rotateAnticlockwise = true;
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
    else if(e.keyCode == ROTATE_C) {
        humanPlayer.input.rotateClockwise = false;
    }
    else if(e.keyCode == ROTATE_AC) {
        humanPlayer.input.rotateAnticlockwise = false;
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
    var min = { x: sprite.radius, y: sprite.radius };
    var max = { x: board.width - sprite.radius, y: board.height - sprite.radius };
    sprite.position.x = Math.min(Math.max(min.x, sprite.position.x), max.x);
    sprite.position.y = Math.min(Math.max(min.y, sprite.position.y), max.y);
}

function collides(a, b) {
    return distance(a.position, b.position) < (a.radius + b.radius);
}

// UI
function uiLoop() {
    setTimeout(function() {
        requestAnimationFrame(uiLoop);
        document.getElementById("scoreboard").innerHTML = "Your score: " + humanPlayer.score + "<br>" + "Bot score: " + botPlayer.score;
    }, 1000 / 20);
}
uiLoop();

};

