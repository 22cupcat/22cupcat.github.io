//settings
var settings = {
	canvas: {width: 980, height: 560},
	gridSize: 70,
	movement: {
		deltaSpeed: 10,
		friction: 0.1
	},
	player: {
		imgWidth: 66,
		imgHeight: 92,
		boxSize: 45
	},
	bombCountdown: 3000
}

//canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = settings.canvas.width;
canvas.height = settings.canvas.height;

//grid
var gridScale = {row: null, col: null};
gridScale.row = settings.canvas.height / settings.gridSize;
gridScale.col = settings.canvas.width / settings.gridSize;

//images
var imgSrcList = [
	"/bg.png",				//default background image
	"/item/bomb.png",
	"/obs/box1.png",
	"/obs/box2.png",
	"/obs/fence.png",
	"/player/player.png",
	"/tile/grass.png"
];
var imgReady = [];			//images that are loaded will be put here
var imgIndex = {
	background: 0,
	item: {
		bomb: 1
	},
	obstacle: {
		box1: 2,
		box2: 3,
		fence: 4
	},
	player: 5,
	tile: {
		grass: 6
	}
};

//tile
var tileList = [];
addTile("grass", 1, 1);
addTile("grass", 1, 2);
addTile("grass", 1, 3);
addTile("grass", 2, 1);
addTile("grass", 2, 2);
addTile("grass", 2, 3);

//bomb
var bombList = [];

//obstacle
var obsList = [];
addObs("box1", 1, 10, true);
addObs("box1", 2, 8, true);
addObs("box2", 3, 4, true);
addObs("box2", 4, 2, true);
addObs("fence", 4, 4, false);

//map
var map = new MapObj();

//player
var player = {
	posX: 50, posY: 50,
	velX:  0, velY:  0,
	direction: null,
	maxSpeed: 5
}

//key status
var keys = [];


//load images
var loadImgCount = 0;
var loadImgTotal = imgSrcList.length;

for(var i = 0; i < loadImgTotal; i++) {
	var image = new Image();
	image.onload = function() {
		loadImgCount++;
		if(loadImgCount == loadImgTotal)	//finish loading
			renderCanvas();
	};
	image.src = "img" + imgSrcList[i];
	imgReady[i] = image;
}


//render canvas
function renderCanvas() {
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
		var r = getRow(player.posY);
		var c = getCol(player.posX);
		if(!map.haveBomb(r, c)) {
			map.setBomb(r, c);
			bombList.push(new Bomb(r, c));
		}
	}

	player.posX += player.velX;
	player.posY += player.velY;
	player.velX *= settings.movement.friction;
	player.velY *= settings.movement.friction;

	//detect collision
	var offset = settings.player.boxSize / 2 + 1;
	if(map.isCollision(player.posX, player.posY)) {
		switch(player.direction) {
			case "up":
				player.posY = settings.gridSize * getRow(player.posY) + offset;
				player.velY = 0;
				break;
			case "right":
				player.posX = settings.gridSize * (getCol(player.posX) + 1) - offset;
				player.velX = 0;
				break;
			case "down":
				player.posY = settings.gridSize * (getRow(player.posY) + 1) - offset;
				player.velY = 0;
				break;
			case "left":
				player.posX = settings.gridSize * getCol(player.posX) + offset;
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

	window.requestAnimationFrame(renderCanvas);
}

function drawBackground() {
	for(var row = 0; row < gridScale.row; row++)
		for(var col = 0; col < gridScale.col; col++)
			ctx.drawImage(imgReady[imgIndex.background],getColCoord(col), getRowCoord(row));
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
	for(var row = 1; row < gridScale.row; row++) {
		ctx.moveTo(0, getRowCoord(row));
		ctx.lineTo(canvas.width, getRowCoord(row));
	}
	for(var col = 1; col < gridScale.col; col++) {
		ctx.moveTo(getColCoord(col), 0);
		ctx.lineTo(getColCoord(col), canvas.height);
	}
	ctx.lineWidth = 1;
	ctx.setLineDash([5, 5]);
	ctx.strokeStyle = "black";
	ctx.stroke();
}

function drawBomb() {
	for(var i = 0; i < bombList.length; i++) {
		var bomb = bombList[i];
		ctx.drawImage(imgReady[imgIndex.item["bomb"]], getColCoord(bomb.col), getRowCoord(bomb.row));
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
	var boxSize = settings.player.boxSize;
	var x = player.posX;
	var y = player.posY;
	var imgWidth = settings.player.imgWidth;
	var imgHeight = settings.player.imgHeight;

	ctx.drawImage(imgReady[imgIndex["player"]], x - imgWidth / 2, y + boxSize / 2 - imgHeight);
	
	ctx.lineWidth = 2;
	ctx.setLineDash([]);
	ctx.strokeStyle = "brown";
	
	ctx.beginPath();
	ctx.rect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.arc(x, y, 2, 0, 2 * Math.PI);
	ctx.stroke();
}


//event listener
document.body.addEventListener("keydown", function(e) {
	keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
	keys[e.keyCode] = false;
});


//objects
function Tile(type, row, col) {
	this.type = type;
	this.row = row;
	this.col = col;
}

function Bomb(row, col) {
	this.row = row;
	this.col = col;
	var _this = this;
	setTimeout(function () {
		bombList.shift();
		map.delBomb(_this.row, _this.col);
	}, settings.bombCountdown);
}

function Obs(type, row, col, destroyable) {
	this.type = type;
	this.row = row;
	this.col = col;
	this.destroyable = destroyable;
	this.beDestroyed = false;
}

function MapObj() {
	this.map = [];

	//initialize
	for(var row = 0; row < gridScale.row; row++) {
		this.map[row] = [];
		for(var col = 0; col < gridScale.col; col++)
			this.map[row][col] = {passable: true, haveBomb: false};
	}

	//load obstacles
	for(var i = 0; i < obsList.length; i++) {
		var obs = obsList[i];
		if(!obs.beDestroyed)
			this.map[obs.row][obs.col].passable = false;
	}
}

MapObj.prototype.isCollision = function(x, y) {
	var halfBoxSize = settings.player.boxSize / 2;
	if(this.isPassable(x - halfBoxSize, y + halfBoxSize) &&
		this.isPassable(x + halfBoxSize, y + halfBoxSize) &&
		this.isPassable(x + halfBoxSize, y - halfBoxSize) &&
		this.isPassable(x - halfBoxSize, y - halfBoxSize))
		return false;
	return true;
};

MapObj.prototype.isPassable = function(x, y) {
	if(x < 0 || y < 0 || x >= settings.canvas.width || y >= settings.canvas.height)
		return false;
	return this.map[getRow(y)][getCol(x)].passable;
};

MapObj.prototype.haveBomb = function(row, col) {
	return this.map[row][col].haveBomb;
};

MapObj.prototype.setBomb = function(row, col) {
	this.map[row][col].haveBomb = true;
};

MapObj.prototype.delBomb = function(row, col) {
	this.map[row][col].haveBomb = false;
};

//tools
function addTile(type, row, col) {
	tileList.push(new Tile(type, row, col));
}

function addObs(type, row, col, destroyable) {
	obsList.push(new Obs(type, row, col, destroyable));
}

function getRow(y) {
	return (Math.floor(y / settings.gridSize));
}

function getCol(x) {
	return (Math.floor(x / settings.gridSize));
}

function getRowCoord(row) {
	return settings.gridSize * row;
}

function getColCoord(col) {
	return settings.gridSize * col;
}