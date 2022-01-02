const X_CLASS = 'x';
const O_CLASS = 'o';
const WIN_CLASS = 'win-class';

const bord = document.getElementById('bord');
const cells = document.querySelectorAll('[data-cell]');
const messageBox = document.getElementById('messageBox');
const message = document.getElementById('message');
const resetBtn = document.querySelector('[data-reset]');
const dataTypeEl = document.querySelector('[data-type]');
const dataTurn = document.querySelector('[data-turn]');
const dataHistory = document.querySelector('[data-history]');

let scoreHistory = { x: 0, o: 0, draw: 0 };
dataTypeEl.checked = false;

const winComb = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

let origBoard, Xturn, gameOver;
let playWith = dataTypeEl.checked;

//change turn title
function changeTitle(val) {
	dataTurn.innerHTML = `Now '<span style =" color : green;">${val}</span>' trun`;
}

//change game type
function gameType(e) {
	playWith = e.checked ? true : false;
	startGame();
	scoreHistory = { x: 0, o: 0, draw: 0 };
	setScorToHistory(scoreHistory);
}

//set color win/lose/draw cell
function setWinColor(cellIndex) {
	cellIndex.forEach((index) => cells[index].classList.add(WIN_CLASS));
}

// This function for Place "mark" in the cell and check user WIN or LOSS
function placeMark(cellNumber) {
	const className = Xturn ? X_CLASS : O_CLASS;
	let cell = document.querySelector(`[data-cell='${cellNumber}']`);
	cell.classList.add(className);
	origBoard[cell.dataset.cell] = className;
	[win, wonCells] = checkWin(origBoard, className);

	if (win) {
		endGame(className, 'Win');
		setWinColor(wonCells);
	} else if (checkDraw(origBoard)) {
		endGame('', 'draw');
		setWinColor(Array.from(Array(9).keys));
	} else {
		swapTurns();
		setMarkHover();
	}
}

//swap turns
function swapTurns() {
	Xturn = !Xturn;
}

// set current mark hover on the bord cell.
function setMarkHover() {
	bord.classList.remove(X_CLASS);
	bord.classList.remove(O_CLASS);
	let cl = Xturn ? X_CLASS : O_CLASS;
	bord.classList.add(cl);
	changeTitle(cl);
}

//check current player won OR not
function checkWin(flayerbord, currentClass) {
	let machtCombination;

	return [
		winComb.some((combination) => {
			let macht = combination.every((index) => flayerbord[index] == currentClass);

			if (macht) {
				machtCombination = combination;
			}
			return macht;
		}),
		machtCombination,
	];
}

//check current player wraw OR not
function checkDraw(flayerbord) {
	return flayerbord.every((cell) => typeof cell != 'number');
}

//stop game and set few let after game end
function endGame(who, what) {
	message.innerHTML = `${who} ${what}!!`;
	messageBox.classList.add('show');
	gameOver = true;

	if (who !== '') {
		updateStorege(scoreHistory, `${who}`);
	} else {
		updateStorege(scoreHistory, `${what}`);
	}
	setScorToHistory(scoreHistory);
}

//AI area
// get empty cell
function availableCells(plyerBord) {
	return plyerBord.filter((val) => typeof val == 'number');
}

//find best cell
function AI(newBoard, player) {
	//available spots
	let availSpots = availableCells(newBoard);

	if (checkWin(newBoard, X_CLASS)[0]) {
		return { score: -10 };
	} else if (checkWin(newBoard, O_CLASS)[0]) {
		return { score: 10 };
	} else if (availSpots.length === 0) {
		return { score: 0 };
	}

	let moves = [];

	for (let i = 0; i < availSpots.length; i++) {
		let move = {};
		move.index = newBoard[availSpots[i]];
		newBoard[availSpots[i]] = player;

		if (player == O_CLASS) {
			let result = AI(newBoard, X_CLASS);
			move.score = result.score;
		} else {
			let result = AI(newBoard, O_CLASS);
			move.score = result.score;
		}
		newBoard[availSpots[i]] = move.index;
		moves.push(move);
	}

	let bestMove;
	if (player === O_CLASS) {
		let bestScore = -Infinity;

		for (let i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	} else {
		let bestScore = Infinity;

		for (let i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	}

	return moves[bestMove];
}

// this function run for sin
function handleClick(e) {
	const cell = e.target.dataset.cell;
	placeMark(cell);

	if (!gameOver && playWith) {
		//if game over and play with AI
		placeMark(AI(origBoard, O_CLASS).index);
	}
	let avai = availableCells(origBoard);
	if (!gameOver && avai.length == 1) {
		placeMark(avai[0]);
	}
}

// history area
//change score inner text
function setScorToHistory({ x = 0, o = 0, draw = 0 }) {
	dataHistory.innerHTML = `X won: <span style = 'color : green'>${x}</span> | O won: <span style = 'color : green'>${o}</span> | draw: <span style = 'color : green'>${draw}</span>`;
}

//update score value
function updateStorege(objName, tag) {
	objName[tag] += 1;
}

// this function called begining
function startGame() {
	Xturn = true;
	gameOver = false;
	origBoard = Array.from(Array(cells.length).keys());

	cells.forEach((cell) => {
		cell.classList.remove(X_CLASS);
		cell.classList.remove(O_CLASS);
		cell.classList.remove(WIN_CLASS);
		cell.addEventListener('click', handleClick, { once: true });
	});
	messageBox.classList.remove('show');
	setMarkHover();
}

// function call area
startGame();
setScorToHistory(scoreHistory);
resetBtn.addEventListener('click', startGame);
