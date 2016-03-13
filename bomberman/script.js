/**
 * todo:
 * restriction of the number of bombs
 * add player-walking animation
 */

//settings
var settings = {
	canvas: {width: 980, height: 560},
	grid: {size: 70},
	movement: {deltaSpeed: 10, friction: 0.1},
	player: {
		img: {width: 66, height: 92},
		size: 66
	},
	bomb: {countdown: 3000}
}

//canvas
var canvas = document.getElementById("canvas");
    canvas.width = settings.canvas.width;
    canvas.height = settings.canvas.height;
var ctx = canvas.getContext("2d");

//grid
var gridScale = {row: null, col: null};
    gridScale.row = settings.canvas.height / settings.grid.size;
    gridScale.col = settings.canvas.width / settings.grid.size;

//key status
var keys = [];

//images
var imgSrcList = [
	"/player/player.png",
	"/bg.png",				//default background image
	"/item/bomb.png",
	"/obs/box.png",
	"/obs/box2.png",
	"/obs/fence.png",
	"/tile/grass.png"
];
var imgReady = [];			//images that are loaded
var imgIndex = {
	player: 0,
	background: 1,
	bomb: 2,
	obstacle: {
		box: 3,
		box2: 4,
		fence: 5
	},
	tile: {
		grass: 6
	}
};

//obstacle
function obs(type, row, col, destroyable) {	//obstacle object
	this.type = type;
	this.row = row;
	this.col = col;
	this.destroyable = destroyable;
	this.beDestroyed = false;
}

var obsList = [];
    obsList.push(new obs("box", 1, 10, true));
    obsList.push(new obs("box", 2, 8, true));
    obsList.push(new obs("box2", 3, 4, true));
    obsList.push(new obs("box2", 4, 2, true));
    obsList.push(new obs("fence", 4, 4, false));
var isPassableMap = [];
for(var r = 0; r < gridScale.row; r++) {
	isPassableMap[r] = [];
	for(var c = 0; c < gridScale.col; c++)
		isPassableMap[r][c] = true;
}

for(var i = 0; i < obsList.length; i++) {
	var obs = obsList[i];
	if(!obs.beDestroyed)
		isPassableMap[obs.row][obs.col] = false;
}

//tile
function tile(type, row, col) {	//tile object
	this.type = type;
	this.row = row;
	this.col = col;
}
var tileList = [];
    tileList.push(new tile("grass", 1, 1));
    tileList.push(new tile("grass", 1, 2));
    tileList.push(new tile("grass", 1, 3));
    tileList.push(new tile("grass", 2, 1));
    tileList.push(new tile("grass", 2, 2));
    tileList.push(new tile("grass", 2, 3));

//bomb
function bomb(row, col) {
	this.row = row;
	this.col = col;
	setTimeout(function () {
		bombQueue.shift();
		haveBombMap[row][col] = false;
	}, settings.bomb.countdown);
}

var haveBombMap = [];
for(var r = 0; r < gridScale.row; r++) {
	haveBombMap[r] = [];
	for(var c = 0; c < gridScale.col; c++)
		haveBombMap[r][c] = false;
}
var bombQueue = [];

//player
var player = {
	posX: 50,
	posY: 50,
	velX: 0,
	velY: 0,
	direction: null,
	maxSpeed: 5
}


//load images
var loadImgCount = 0;
var loadImgTotal = imgSrcList.length;

for(var i = 0; i < loadImgTotal; i++) {
	var image = new Image();
	image.onload = function() {
		loadImgCount++;
		if(loadImgCount == loadImgTotal)	//finish loading
			render();
	};
	image.src = "img" + imgSrcList[i];
	imgReady[i] = image;
}


//canvas rendering
function render() {
	if(keys[38] && player.velY > -player.maxSpeed) {
		player.direction = "up";
		player.velX = 0;
		player.velY -= settings.movement.deltaSpeed;
	}
	if(keys[39] && player.velX < player.maxSpeed) {
		player.direction = "right";
		player.velX += settings.movement.deltaSpeed;
		player.velY = 0;
	}
	if(keys[40] && player.velY < player.maxSpeed) {
		player.direction = "down";
		player.velX = 0;
		player.velY += settings.movement.deltaSpeed;
	}
	if(keys[37] && player.velX > -player.maxSpeed) {
		player.direction = "left";
		player.velX -= settings.movement.deltaSpeed;
		player.velY = 0;
	}
	if(keys[32]) {	//put a bomb
		var playerCenterRow = getRow(player.posY + settings.player.size / 2);
		var playerCenterCol = getCol(player.posX + settings.player.size / 2);
		if(!haveBomb(playerCenterRow, playerCenterCol)) {
			haveBombMap[playerCenterRow][playerCenterCol] = true;
			bombQueue.push(new bomb(playerCenterRow, playerCenterCol));
		}
	}

	player.posX += player.velX;
	player.posY += player.velY;
	player.velX *= settings.movement.friction;
	player.velY *= settings.movement.friction;

	//collision test
	if(isCollision(player.posX, player.posY)) {
		switch(player.direction) {
			case "up":
				player.posY = settings.grid.size * (getRow(player.posY) + 1);
				player.velY = 0;
				break;
			case "right":
				player.posX = settings.grid.size * getCol(player.posX);
				player.velX = 0;
				break;
			case "down":
				player.posY = settings.grid.size * getRow(player.posY);
				player.velY = 0;
				break;
			case "left":
				player.posX = settings.grid.size * (getCol(player.posX) + 1);
				player.velX = 0;
				break;
		}
	}

	drawBackground();
	drawTile();
	drawGrid();
	drawBomb();
	drawObstacle();
	drawPlayer();

	setTimeout(render, 10);
}

function drawBackground() {
	for(var r = 0; r < gridScale.row; r++)
		for(var c = 0; c < gridScale.col; c++)
			ctx.drawImage(imgReady[imgIndex.background], getColCoord(c), getRowCoord(r));
}

function drawTile() {
	var tileType, x, y;
	for(var i = 0; i < tileList.length; i++) {
		tileType = tileList[i].type;
		x = getRowCoord(tileList[i].col);
		y = getRowCoord(tileList[i].row);
		ctx.drawImage(imgReady[imgIndex.tile[tileType]], x, y);
	}
}

function drawGrid() {
	ctx.beginPath();
	for(var r = 1; r < gridScale.row; r++) {
		ctx.moveTo(0, getRowCoord(r));
		ctx.lineTo(canvas.width, getRowCoord(r));
	}
	for(var c = 1; c < gridScale.col; c++) {
		ctx.moveTo(getColCoord(c), 0);
		ctx.lineTo(getColCoord(c), canvas.height);
	}
	ctx.lineWidth = 1;
	ctx.setLineDash([5, 5]);
	ctx.strokeStyle = "black";
	ctx.stroke();
}

function drawBomb() {
	for(var i = 0; i < bombQueue.length; i++) {
		var bomb = bombQueue[i];
		ctx.drawImage(imgReady[imgIndex["bomb"]], getColCoord(bomb.col), getRowCoord(bomb.row));
	}
}

function drawObstacle() {
	var obsType, x, y;
	for(var i = 0; i < obsList.length; i++) {
		obsType = obsList[i].type;
		x = getRowCoord(obsList[i].col);
		y = getRowCoord(obsList[i].row);
		ctx.drawImage(imgReady[imgIndex.obstacle[obsType]], x, y);
	}
}

function drawPlayer() {
	var imgHeight = settings.player.img.height;
	var playerSize = settings.player.size;

	ctx.beginPath();
	ctx.drawImage(imgReady[imgIndex["player"]], player.posX, player.posY + playerSize - imgHeight);
	ctx.rect(player.posX, player.posY, playerSize, playerSize);
	ctx.lineWidth = 1;
	ctx.setLineDash([]);
	ctx.strokeStyle = "red";
	ctx.stroke();
}


//event listener
document.body.addEventListener("keydown", function(e) {
	keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
	keys[e.keyCode] = false;
});


//tools
function getRow(y) {return (Math.floor(y / settings.grid.size)); }
function getCol(x) {return (Math.floor(x / settings.grid.size)); }
function getRowCoord(row) {return settings.grid.size * row; }
function getColCoord(col) {return settings.grid.size * col; }

function isCollision(x, y) {
	var size = settings.player.size;
	if(isPassable(x, y) && isPassable(x, y + size) && isPassable(x + size, y) && isPassable(x + size, y + size))
		return false;
	return true;
}

function isPassable(x, y) {
	if(x < 0 || y < 0 || x >= settings.canvas.width || y >= settings.canvas.height)
		return false;
	return isPassableMap[getRow(y)][getCol(x)];
}

function haveBomb(row, col) {return haveBombMap[row][col]; }