/**
 * todo:
 * restriction of the number of bombs
 * add player-walking animation
 */

//bomb


var haveBombMap = [];
for(var r = 0; r < gridScale.row; r++) {
	haveBombMap[r] = [];
	for(var c = 0; c < gridScale.col; c++)
		haveBombMap[r][c] = false;
}

function drawBomb() {
	for(var i = 0; i < bombQueue.length; i++) {
		var bomb = bombQueue[i];
		ctx.drawImage(imgReady[imgIndex["bomb"]], getColCoord(bomb.col), getRowCoord(bomb.row));
	}
}

//tools
function haveBomb(row, col) {return haveBombMap[row][col]; }