const eBoard = document.querySelector("#board");
const eGameOver = document.querySelector(".game-over");
const eOverlay = document.querySelector(".overlay");
const eTimeStat = document.querySelector(".stats .time .time-writen");
const eMineStat = document.querySelector(".stats .mines .mines-writen");
const eRestartBtn = document.querySelector(".restart");
const eMenuBtn = document.querySelector(".menu-btn");
const eGameStart = document.querySelector("#game-start");
const menuScreen = document.querySelector("#menu");
const gameScreen = document.querySelector("#game");
const eGameSelectRadio = document.querySelectorAll('input[name="game-select"]');
const eCustomiser = document.querySelector("#customiser");
const ePauseMenu = document.querySelector(".Pause-menu");
const eResumeBtn = document.querySelector("#resumeButton");
const ePauseMenuBtn = document.querySelector("#menuButton");
const ePauseBtn = document.querySelector("#restartButton");
const eGameTittle = document.querySelector(".game-title")
const eSetSettings = document.querySelector("#setSettings")
const eSettingsShow = document.querySelector("#settings")
const eVolumeSet = document.querySelector("#volumeSet")
const eMusicSet = document.querySelector("#musicSet")
const eInfoVolume = document.querySelector("#infoVolume")
const eInfoMusic = document.querySelector("#infoMusic")

const click = new Audio('sounds/click.mp3');
const wind = new Audio('sounds/wind.mp3');
const gameOver = new Audio('sounds/you-lose.mp3');
const sliderSound = new Audio('sounds/slider.mp3');
const bigBoom = new Audio('sounds/nuke-bomb.mp3');

let WIDTH = 16;
let HEIGHT = 16;
let MINES = 0.2;
let revealedCells = newMatrix(WIDTH, HEIGHT, false);
let board = [];
let isFirstClick = true;
let totalMines = 0;
let flagsPlaced = 0;
let startTS;
let iTS;
let isPlaying = false
let pauseClick = false
let fail = false
let showSetting = false
let volumeSet = 100;
let musicSet = 100;

const createImgElem = (s) => `<img src='${s}' />`;
const MINE_IMG = createImgElem("./assets/mine.png");
const FLAG_IMG = createImgElem("./assets/flag.png");
const WRONG_FLAG_OVERLAY_IMG = createImgElem("./assets/wrong_flag_overlay.png");

const tittleText = "NSWAPEER"

const NUMBER_COLORS = [
  "0201ff",
  "1c7718",
  "fa0300",
  "00007f",
  "7c0000",
  "038082",
  "010101",
  "828282",
];

const NUMBER_COLORS_TEXT = [
  "#0201ff",
  "#1c7718",
  "#fa0300",
  "#00007f",
  "#7c0000",
  "#038082",
  "#010101",
  "#828282",
];

function generateText(text) {
  const divText = document.createElement('div');
  eGameTittle.appendChild(divText)
  for (let i = 0; i < text.length; i++) {
    const spanText = document.createElement('span');
    spanText.textContent = text[i];
    spanText.id = `span${i}`
    divText.appendChild(spanText);
  }
  return divText.children;
}
function textColorAndTetx() {
  const generateBoard = (generateText(tittleText))
  for (let i = 0; i < tittleText.length; i++) {
    const spanTextColor = document.getElementById(`span${i}`)
    spanTextColor.style.color = NUMBER_COLORS_TEXT[i];
  }
}
textColorAndTetx();


const padNum = (s) => {
  return s.toString().padStart(2, "0");
};

const updateTimeStat = () => {
  eTimeStat.innerHTML = padNum(Math.floor((new Date() - startTS) / 1000));
};

const updateMineStat = () => {
  eMineStat.innerHTML = padNum(totalMines - flagsPlaced);
};

const startGame = (x, y) => {
  fail = false
  isFirstClick = false;
  startTS = new Date();
  iTS = setInterval(updateTimeStat, 1000);
  revealedCells = newMatrix(WIDTH, HEIGHT, false);
  do {
    generateBoard();
  } while (neighborMines(y, x) !== 0 || board[x][y] === true);

  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j < WIDTH; j++) {
      if (!board[i][j]) board[i][j] = neighborMines(j, i);
    }
  }
  updateMineStat();
  updateTimeStat();
};

const restartGame = () => {
  fail = false
  click.play();
  isFirstClick = true;
  board = [];
  totalMines = 0;
  flagsPlaced = 0;
  eTimeStat.innerHTML = "00";
  eMineStat.innerHTML = "00";
  eBoard.textContent = ""
  eGameOver.classList.remove("show");
  eOverlay.classList.remove("show");
};


function pauseGame() {
  if (pauseClick === true) {
    pauseClick = false
    ePauseMenu.style.visibility = 'hidden'
    document.body.style.overflow = "auto";
    return;
  }
  if (pauseClick === false) {
    pauseClick = true
    ePauseMenu.style.visibility = 'visible'
    document.body.style.overflow = "hidden";
    ePauseMenu.style.position = "fixed";
    ePauseMenu.style.top = "50%";
    ePauseMenu.style.left = "50%";
    ePauseMenu.style.transform = "translate(-50%, -50%)";
    return;
  }
}

const loseGame = () => {
  bigBoom.volume = 0.1;
  bigBoom.play();
  bigBoom.currentTime = 0;
  gameOver.volume = 1;
  gameOver.play();
  fail = true
  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j < WIDTH; j++) {
      const isFlag = getCell(i, j).classList.contains("flag");
      const isMine = board[i][j] === true;
      if (isMine && !isFlag) {
        showMine(i, j);
      } else if (!isMine && isFlag) {
        showWrongFlag(i, j);
      }
      if (board[i][j] === true && !getCell(i, j).classList.contains("flag"))
        showMine(i, j);
    }
  }
  eGameOver.classList.add("show");
  eOverlay.classList.add("show");
  clearInterval(iTS);
};

function newMatrix(w, h, v) {
  const matrix = [];
  for (let i = 0; i < h; i++) {
    const row = [];
    for (let j = 0; j < w; j++) {
      row.push(v);
    }
    matrix.push(row);
  }
  return matrix;
}

function getNeighbors() {
  const coords = [];
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (!(i == 0 && j == 0)) {
        coords.push([i, j]);
      }
    }
  }
  return coords;
}

function showMine(x, y) {
  const elem = getCell(x, y);
  elem.innerHTML = MINE_IMG;
  elem.classList.add("mine");
}

function showWrongFlag(x, y) {
  const elem = getCell(x, y);
  elem.innerHTML = FLAG_IMG + WRONG_FLAG_OVERLAY_IMG;
  elem.classList.add("flag", "flag-overlay");
}

function clearCell(x, y) {
  const elem = getCell(x, y);
  elem.innerHTML = "";
  elem.className = "cell";
}

function flagCell(x, y) {
  const elem = getCell(x, y);
  if (elem.classList.contains("flag")) {
    elem.classList.remove("flag");
    elem.innerHTML = "";
    wind.play();
    flagsPlaced--;
  } else {
    elem.classList.add("flag");
    elem.innerHTML = FLAG_IMG;
    wind.play();
    flagsPlaced++;
  }
}

function neighborMines(x, y) {
  const offsets = getNeighbors();
  let mineCount = 0;
  offsets.forEach((o) => {
    const oy = y + o[0];
    const ox = x + o[1];
    if (oy < 0 || ox < 0 || oy >= HEIGHT || ox >= WIDTH) {
      return;
    }
    if (board[oy][ox] === true) {
      mineCount++;
    }
  });
  return mineCount;
}

const createDOM = () => {
  eBoard.textContent = ""
  for (let i = 0; i < HEIGHT; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < WIDTH; j++) {
      let e = document.createElement("div");
      e.classList.add("cell");
      e.setAttribute("y", j);
      e.setAttribute("x", i);

      e.addEventListener("contextmenu", (e) => {
        if (isFirstClick) return;
        e.preventDefault();
        const x = parseInt(e.target.getAttribute("x"));
        const y = parseInt(e.target.getAttribute("y"));
        if (!revealedCells[x][y]) {
          flagCell(x, y);
          updateMineStat();
        }
      });

      e.addEventListener("click", (e) => {
        if (pauseClick === true) return;
        const x = parseInt(e.target.getAttribute("x"));
        const y = parseInt(e.target.getAttribute("y"));

        if (isFirstClick) startGame(x, y);
        if (getCell(x, y).classList.contains("flag")) return;
        revealCell(x, y);
      });

      row.appendChild(e);
    }
    eBoard.appendChild(row);
  }
};

function showCell(x, y) {
  const currentCell = board[x][y];
  if (currentCell === 0) {
    return;
  }
  const elem = getCell(x, y);
  elem.innerHTML = currentCell;
  elem.style.color = `#${NUMBER_COLORS[currentCell - 1]}`;
}

function revealCell(x, y) {
  const currentCell = board[x][y];
  const elem = getCell(x, y);
  if (currentCell === true) {
    loseGame();
    return;
  }
  if (revealedCells[x][y] && !elem.classList.contains("revealed")) {
    const offsets = getNeighbors();
    const allMines = parseInt(elem.innerHTML);
    if (allMines > 0) {
      let mineSum = 0;
      offsets.forEach((o) => {
        const dy = y + o[0];
        const dx = x + o[1];
        if (dy < 0 || dx < 0 || dy >= HEIGHT || dx >= WIDTH) {
          return;
        }
        if (getCell(dx, dy).classList.contains("flag")) {
          mineSum++;
        }
      });
      if (allMines === mineSum) {
        offsets.forEach((o) => {
          const dy = y + o[0];
          const dx = x + o[1];
          if (dy < 0 || dx < 0 || dy >= HEIGHT || dx >= WIDTH) {
            return;
          }
          if (getCell(dx, dy).innerHTML === "") {
            if (board[dx][dy] === true) {
              loseGame();
            } else {
              revealCell(dx, dy);
            }
          }
        });
      }
    }
  }
  showCell(x, y);
  revealedCells[x][y] = true;
  if (currentCell === 0) {
    const offsets = getNeighbors();
    elem.classList.add("revealed");
    revealedCells[x][y] = true;
    offsets.forEach((o) => {
      const dy = y + o[0];
      const dx = x + o[1];
      if (dy < 0 || dx < 0 || dy >= HEIGHT || dx >= WIDTH) {
        return;
      }
      if (revealedCells[dx][dy] === false) {
        revealCell(dx, dy);
      }
    });
  }
}
function volumeChange() {
  click.volume = volumeSet;
  wind.volume = volumeSet;
  gameOver.volume = volumeSet;
  sliderSound.volume = volumeSet;
  bigBoom.volume = volumeSet / 10;
}


function getCell(x, y) {
  return eBoard.children[x].children[y];
}

function generateBoard() {
  board = [];
  totalMines = 0;
  for (let i = 0; i < HEIGHT; i++) {
    const row = [];
    for (let j = 0; j < WIDTH; j++) {
      const isMine = Math.random() < MINES;
      row.push(isMine);
      if (isMine) {
        totalMines++;
      }
    }
    board.push(row);
  }
}
function showSettings() {
  if (showSetting === false) {
    eSetSettings.style.visibility = "visible";
    wind.play();
    showSetting = true
    return;
  }
  if (showSetting === true) {
    eSetSettings.style.visibility = "hidden";
    wind.play();
    showSetting = false
    return;
  }
}

eGameStart.addEventListener("click", () => {
  isPlaying = true;
  console.log(isPlaying);
  click.play();
  const selected = document.querySelector("[name='game-select']:checked")
  WIDTH = selected.getAttribute("data-width")
  HEIGHT = selected.getAttribute("data-height")
  MINES = selected.getAttribute("data-mines")
  gameScreen.classList.remove("hidden")
  menuScreen.classList.add("hidden")
  revealedCells = newMatrix(WIDTH, HEIGHT, false);

  createDOM();
  ePauseBtn.addEventListener("click", () => { restartGame(); createDOM(); pauseGame() });
  eRestartBtn.addEventListener("click", () => { restartGame(); createDOM() });
})

eMenuBtn.addEventListener('click', () => {
  isPlaying = false
  console.log(isPlaying);
  click.play();
  restartGame();
  gameScreen.classList.add("hidden")
  menuScreen.classList.remove("hidden")
  eGameOver.classList.remove("show");
  eOverlay.classList.remove("show");
})
ePauseMenuBtn.addEventListener('click', () => {
  pauseGame();
  isPlaying = false
  console.log(isPlaying);
  click.play();
  restartGame();
  gameScreen.classList.add("hidden")
  menuScreen.classList.remove("hidden")
  eGameOver.classList.remove("show");
  eOverlay.classList.remove("show");
});
eGameSelectRadio.forEach(radio => {
  radio.addEventListener('change', () => {
    click.play();
    if (radio.id === 'custom') {
      eCustomiser.style.visibility = 'visible'
      eGameStart.style.marginTop = "100px";
    } else {
      eCustomiser.style.visibility = 'hidden'
      eGameStart.style.marginTop = "0px";
    }
  })

})

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && isPlaying === true && fail === false) {
    event.preventDefault();
    pauseGame()
  }
});
eResumeBtn.addEventListener('click', () => {
  console.log("elo");
  pauseGame()
})

eSettingsShow.addEventListener("click", () => {
  showSettings()
})

eVolumeSet.addEventListener("input", () => {
  volumeSet = eVolumeSet.value
  if (volumeSet == 0) {
    eInfoVolume.innerHTML = `OFF`
  } else {
    eInfoVolume.innerHTML = `${Math.round(volumeSet * 100)}%`
  }
  volumeChange()
})
eMusicSet.addEventListener("input", () => {
  musicSet = eMusicSet.value
  if (musicSet == 0) {
    eInfoMusic.innerHTML = `OFF`
  } else {
    eInfoMusic.innerHTML = `${Math.round(musicSet * 100)}%`
  }
})