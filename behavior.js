/* Copyright 2014 Gabriel Eugen Vaduva

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
function rectangle(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.isInRect = function(point) {
		if (point.x < this.x || point.x >= this.x + this.width)
			return false;
		if (point.y < this.y || point.y >= this.y + this.height)
			return false;
		return true;
	}
}

function drawTable(ctx, canvas) {
	var w = canvas.width;
	var h = canvas.height;
	
	var line1X = w / 3;
	var line2X = line1X + w / 3;
	var line1Y = h / 3;
	var line2Y = line1Y + h / 3;

	ctx.lineWidth = 3;
	ctx.strokeStyle = "#333333";
	ctx.beginPath();

	// Draw first vertical line
	ctx.moveTo(line1X, 0);
	ctx.lineTo(line1X, h);
	// Draw second vertical line
	ctx.moveTo(line2X, 0);
	ctx.lineTo(line2X, h);
	// Draw first horizontal line
	ctx.moveTo(0, line1Y);
	ctx.lineTo(w, line1Y);
	// Draw second horizontal line
	ctx.moveTo(0, line2Y);
	ctx.lineTo(w, line2Y);

	ctx.closePath();
	ctx.stroke();
}

function getMousePos(canvas, event) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: (event.clientX - rect.left), 
		y: (event.clientY - rect.top)
	};
}

function drawX(ctx, rect) {
	var offset = 30;
	var start = { x: rect.x + offset, y: rect.y + offset };
	var end = { x: rect.x + rect.width - offset, y: rect.y + rect.height - offset };

	ctx.strokeStyle = "#CC3366";
	ctx.beginPath();
	
	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x, end.y);
	ctx.moveTo(end.x, start.y);
	ctx.lineTo(start.x, end.y);
	
	ctx.closePath();
	ctx.stroke();
}

function drawO(ctx, rect) {
	var center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
	var radius = 60;

	ctx.strokeStyle = "#0066CC";
	ctx.beginPath();
	ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);

	ctx.closePath();
	ctx.stroke();
}

function drawEndLine(ctx, start, end) {
	ctx.lineWidth = 10;
	ctx.strokeStyle = "#CC3300";
	var x1, y1;
	var x2, y2;

	if (start.y == end.y) {
		x1 = start.x;
		y1 = start.y + start.height / 2;
		x2 = end.x + end.width;
		y2 = end.y + end.height / 2;
	}
	else if (start.x == end.x) {
		x1 = start.x + start.width / 2;
		y1 = start.y;
		x2 = end.x + end.width / 2;
		y2 = end.y + end.height;
	}
	else if (start.y == end.x) {
		x1 = start.x + start.width;
		y1 = start.y;
		x2 = end.x;
		y2 = end.y + end.height;
	}
	else {
		x1 = start.x; y1 = start.y;
		x2 = end.x + end.width; y2 = end.y + end.height;
	}

	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	ctx.stroke();
}

function toArrayCoordinates(pos, rectangles) {
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			if (rectangles[i][j].isInRect(pos)) {
				return { x: i, y: j };
			}
		}
	}
}

function newGame(table, ctx, canvas, player) {
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++)
			table[i][j] = 0;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);	
	drawTable(ctx, canvas);

	return -player;
}

function checkWin(table) {
	for (var i = 0; i < 3; i++)
		if ((table[i][0] == table[i][1]) && (table[i][1] == table[i][2]) && table[i][1] != 0)
			return { start: { x: i, y: 0 }, end: { x: i, y: 2 } };

	for (var j = 0; j < 3; j++)
		if ((table[0][j] == table[1][j]) && (table[1][j] == table[2][j]) && table[2][j] != 0)
			return { start: { x: 0, y: j }, end: { x: 2, y: j } };

	if ((table[0][0] == table[1][1]) && (table[1][1] == table[2][2]) && table[1][1] != 0)
		return { start: { x: 0, y: 0 }, end: { x: 2, y: 2 } };

	if ((table[0][2] == table[1][1]) && (table[1][1] == table[2][0]) && table[1][1] != 0)
		return { start: { x: 0, y: 2 }, end: { x: 2, y: 0 } };

	return null;
}

function isStalemate(table) {
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++)
			if (table[i][j] == 0) return false;
	}
	return true;
}

function putMessage(msg) {
	$("#console").html(msg);
	$("#history").append("<li>" + msg + "</li>");
}

function main() {
	var player1 = prompt("Player 1: ", "Player 1");
	var player2 = prompt("Player 2: ", "Player 2");
	var players = ["Null Player", player1, player2];
	var canvas = document.getElementById("display");
	var ctx = canvas.getContext("2d");
	// Player 1 == 1; Player 2 == -1
	// Player 1 as X and Player 2 as O
	var player, endgame = false;
	if (Math.random() >= 0.5) player =  1;
	else 					  player = -1;

	$("#console").html(players[((player + 3) % 3)]);
	
	var table = [ [0, 0, 0], [0, 0, 0], [0, 0, 0] ];
	// Width and length of one rectangle
	var wd = canvas.width / 3;
	var ht = canvas.height / 3;

	var rectangles = [ [new rectangle(0, 0, wd, ht), new rectangle(wd, 0, wd, ht), new rectangle(2 * wd, 0, wd, ht)], 
				       [new rectangle(0, ht, wd, ht), new rectangle(wd, ht, wd, ht), new rectangle(2 * wd, ht, wd, ht)],
				       [new rectangle(0, 2 * ht, wd, ht), new rectangle(wd, 2 * ht, wd, ht), new rectangle(2 * wd, 2 * ht, wd, ht)] ];
	
	drawTable(ctx, canvas);

	canvas.onclick = function(event) {
		if (endgame) return;
		var pos = getMousePos(canvas, event);
		var arr = toArrayCoordinates(pos, rectangles);
		var win;
		//console.log(arr.x + " " + arr.y);
		
		if (player == 1 && table[arr.x][arr.y] == 0) {
			drawX(ctx, rectangles[arr.x][arr.y]);
			table[arr.x][arr.y] = player;
			
			win = checkWin(table);
			if (win != null) {
				endgame = true;
				drawEndLine(ctx, rectangles[win.start.x][win.start.y], rectangles[win.end.x][win.end.y]);
				putMessage(player1 + " wins !");
			}
			else if (isStalemate(table)) {
				endgame = true;
				putMessage("No one wins !");
			}

			player *= -1;

			if (endgame) {
				if (confirm("Do you want to play again?")) {
					player = newGame(table, ctx, canvas, -player);
					endgame = false;
				}
			}

		}
		else if (player == -1 && table[arr.x][arr.y] == 0) {
			drawO(ctx, rectangles[arr.x][arr.y]);
			table[arr.x][arr.y] = player;

			win = checkWin(table);
			if (win != null) {
				endgame = true;
				drawEndLine(ctx, rectangles[win.start.x][win.start.y], rectangles[win.end.x][win.end.y]);
				putMessage(player2 + " wins !");
			}
			else if (isStalemate(table)) {
				endgame = true;
				putMessage("No one wins !");
			}

			player *= -1;

			if (endgame) {
				if (confirm("Do you want to play again?")) {
					player = newGame(table, ctx, canvas, -player);
					endgame = false;
				}
			}

		}

		$("#console").html(players[((player + 3) % 3)]);
		
	};
	
}

$(document).ready(main);