//global settings
var settings = {
	canvas: {width: 980, height: 560},
	grid: {size: 70},
	player: {width: 66, height: 92},
	deltaSpeed: 5,
	friction: 0.85
};

//canvas
var canvas = document.getElementById("canvas");
    canvas.width = settings.canvas.width;
    canvas.height = settings.canvas.height;
var ctx = canvas.getContext("2d");

//grid
var gridScale = {row: null, col: null};
    gridScale.row = settings.canvas.height / settings.grid.size;
    gridScale.col = settings.canvas.width / settings.grid.size;

//images
var imgToLoad = [
	"/player/player.png",
	"/tile/default.png",	//default tile image
	"/tile/box.png",
	"/tile/box2.png",
	"/tile/fence.png"
];
var imgReady = [];			//images that are loaded
var imgIndex = {
	player: 0,
	defaultTile: 1,
	box: 2,
	box2: 3,
	fence: 4
};

//map
var map = [];

//obstacles
function obs(a, b, c, d) {	//obstacle object
	this.row = a;
	this.col = b;
	this.canEliminate = c;
	this.eliminated = false;
	this.imgSrc = d;
}
var obsList = [];
obsList.push(new obs(2, 5, true, "box"));
obsList.push(new obs(2, 6, true, "box"));
obsList.push(new obs(3, 3, true, "box2"));
obsList.push(new obs(4, 3, true, "box2"));
obsList.push(new obs(5, 2, false, "fence"));

//player
var keys = [];

/**
 * initialize map
 */
for(var r = 0; r < gridScale.row; r++) {
	map[r] = [];
	for(var c = 0; c < gridScale.col; c++)
		map[r][c] = "empty";
}

//load obstacles data
for(var i = 0; i < obsList.length; i++) {
	var o = obsList[i];
	if(!o.eliminated)
		map[o.row][o.col] = "obstacle";
}

/**
 * load images
 */
var loadImgCount = 0;
var loadImgTotal = imgToLoad.length;

for(var i = 0; i < loadImgTotal; i++) {
	var img = new Image();
	img.onload = function() {
		loadImgCount++;
		if(loadImgCount == loadImgTotal) {
			updatePlayer();
		}
	};
	img.src = "img" + imgToLoad[i];
	imgReady[i] = img;
}

/**
 * functions related to drawing
 */
function draw() {
	drawDefaultTile();
	drawGrid();
	//drawOtherTile();
	drawObs();
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
	ctx.lineWidth = 0.5;
	ctx.setLineDash([2, 2]);
	ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
	ctx.stroke();
}

function drawDefaultTile() {
	for(var r = 0; r < gridScale.row; r++)
		for(var c = 0; c < gridScale.col; c++)
			ctx.drawImage(imgReady[imgIndex.defaultTile], getColCoord(c), getRowCoord(r));
}

function drawObs() {
	var src, x, y;
	for(var i = 0; i < obsList.length; i++) {
		src = obsList[i].imgSrc;
		x = getRowCoord(obsList[i].col);
		y = getRowCoord(obsList[i].row);
		ctx.drawImage(imgReady[imgIndex[src]], x, y);
	}
}

/**
 * player movement
 */
var player = {
	x: 50, y: 50,
	velY: 0, velX: 0,
	direction: null,
	maxSpeed: 5
}

function updatePlayer() {
	if(keys[38] && player.velY > -player.maxSpeed) {	//key up
		player.velX = 0;
		player.velY -= settings.deltaSpeed;
		player.direction = "up";
	}
	if(keys[39] && player.velX < player.maxSpeed) {		//key right
		player.velX += settings.deltaSpeed;
		player.velY = 0;
		player.direction = "right";
	}
	if(keys[40] && player.velY < player.maxSpeed) {		//key down
		player.velX = 0;
		player.velY += settings.deltaSpeed;
		player.direction = "down";
	}
	if(keys[37] && player.velX > -player.maxSpeed) {	//key left
		player.velX -= settings.deltaSpeed;
		player.velY = 0;
		player.direction = "left";
	}

	player.velX *= settings.friction;
	player.velY *= settings.friction;
	player.x += player.velX;
	player.y += player.velY;

	//collision test
	if(isObstacle(player.x, player.y)) {
		if(player.direction == "left") {
			player.x = settings.grid.size * (getCol(player.x) + 1);
			player.velX = 0;
		}
		if(player.direction == "up") {
			player.y = settings.grid.size * (getRow(player.y) + 1);
			player.velY = 0;
		}
		log("collision: top-left");
	}
	if(isObstacle(player.x + settings.grid.size - 1, player.y)) {
		if(player.direction == "right") {
			player.x = settings.grid.size * (getCol(player.x)) + 0.99;
			player.velX = 0;
		}
		if(player.direction == "up") {
			player.y = settings.grid.size * (getRow(player.y) + 1);
			player.velY = 0;
		}
		log("collision: top-right");
	}
	if(isObstacle(player.x, player.y + settings.grid.size - 1)) {
		if(player.direction == "left") {
			player.x = settings.grid.size * (getCol(player.x) + 1);
			player.velX = 0;
		}
		if(player.direction == "down") {
			player.y = settings.grid.size * (getRow(player.y)) + 0.99;
			player.velY = 0;
		}
		log("collision: bottom-left");
	}
	if(isObstacle(player.x + settings.grid.size - 1, player.y + settings.grid.size - 1)) {
		if(player.direction == "right") {
			player.x = settings.grid.size * (getCol(player.x)) + 0.99;
			player.velX = 0;
		}
		if(player.direction == "down") {
			player.y = settings.grid.size * (getRow(player.y)) + 0.99;
			player.velY = 0;
		}
		log("collision: bottom-right");
	}

	//border test
	if(player.x + settings.grid.size >= settings.canvas.width) {
		player.x = settings.canvas.width - settings.grid.size;
		player.velX = 0;
		log("boundery: right");
	}
	else if(player.x <= 0) {
		player.x = 0;
		player.velX = 0;
		log("boundery: left");
	}
	if(player.y + settings.grid.size >= settings.canvas.height) {
		player.y = settings.canvas.height - settings.grid.size;
		player.velY = 0;
		log("boundery: bottom");
	}
	else if(player.y <= 0) {
		player.y = 0;
		player.velY = 0;
		log("boundery: top");
	}

	//draw environment
	draw();

	//draw player
	ctx.beginPath();
	ctx.rect(player.x, player.y, settings.grid.size, settings.grid.size);
	ctx.lineWidth = 1;
	ctx.setLineDash([]);
	ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
	ctx.stroke();
	ctx.drawImage(imgReady[imgIndex["player"]],
		player.x + (settings.grid.size - settings.player.width) / 2,
		player.y + settings.grid.size - settings.player.height);

	setTimeout(updatePlayer, 10);
}

//key handler
document.body.addEventListener("keydown", function(e) {
	keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
	keys[e.keyCode] = false;
});

/**
 * tools
 */
function log(str) {
	document.getElementById("log").innerHTML = str;
}
function getRow(y) {
    var row = Math.floor(y / settings.grid.size);
    if(row < 0) return 0;
    if(row > gridScale.row) return (gridScale.row - 1);
    return row;
}
 function getCol(x) {
    var col = Math.floor(x / settings.grid.size);
    if(col < 0) return 0;
    if(col > gridScale.col) return (gridScale.col - 1);
    return col;
}
function getRowCoord(row) {return settings.grid.size * row; }
function getColCoord(col) {return settings.grid.size * col; }
function isObstacle(x, y) {
	if(x <= 0 || y <= 0 || x >= settings.canvas.width || y >= settings.canvas.height)
		return false;
	var row = Math.floor(y / settings.grid.size);
	var col = Math.floor(x / settings.grid.size);
	if(map[row][col] == "obstacle")
		return true;
}