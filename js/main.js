"use strict";

var EASY = { SIZE: 4, MINES: 2, name: "EASY", help: 3 };
var MEDIUM = { SIZE: 8, MINES: 8, name: "MEDIUM", help: 3 };
var HARD = { SIZE: 12, MINES: 16, name: "HARD", help: 5 };
// var FUCKINGHARD = { SIZE: 24, MINES: 100, name: "FUCKINGHARD", help: 5 };

const MINE = "💣";
const FLAG = "🚩";
const HEART = "❤";
const HINT = "Hint";
var gIsDecreaseHint = false;
var gIsDecreaseSafe = false;
var gBoard;
var gIsFirstclick = false;
var gIsHint = false;
var gisalreadyhint = false;
var gTimeInterval;
var seconds;
var minutes;
var elLives = document.querySelector("#lives span");
var elRestart = document.querySelector("#restart ");
var elHint = document.querySelector("#hint");
var elSafe = document.querySelector("#safe span");
var elLevel = document.querySelector("#level span");
var elundo = document.querySelector("#undo");
var glives;
var gsaferemain;
var ghintremain;
var gUser;
var gBestPlayer;
var bestUser_serealized;
var selector;
// localStorage.clear();
// localStorage.setItem("bestscore", bestUser_serealized);
var bestUser_deserealized;
var gisSeven;
var gundo;
var gameHistory = [];
var historylives = [];
var gUser_serealized;
var gUser_deserealized;

var gGame = {
  isOn: false,
};
var gLevel = MEDIUM;
function inIt() {
  selector = "bestscore" + gLevel.name;
  bestUser_deserealized = JSON.parse(localStorage.getItem(selector));
  if (bestUser_deserealized) {
    document.getElementById("bestplayername").innerHTML =
      bestUser_deserealized.lastname;
    document.getElementById("bestplayerscore").innerHTML =
      bestUser_deserealized.score;
  }
  elLevel.innerHTML = gLevel.name;
  gUser = {};
  gIsFirstclick = false;
  gisSeven = false;
  elRestart.innerHTML = "Restart";
  ghintremain = gLevel.help;
  elHint.innerHTML = HINT + ":" + ghintremain;
  gsaferemain = gLevel.help;
  elSafe.innerText = gsaferemain;
  clearInterval(gTimeInterval);
  glives = 3;
  setlives(glives);
  // elLives.innerHTML = glives;
  gGame.isOn = true;
  gBoard = createMat(gLevel.SIZE, gLevel.SIZE, createMineSweeperCell);
  renderBoard(gBoard);
  // console.table(gBoard);
  // console.log(gBoard);
  document
    .querySelector("table")
    .addEventListener("contextmenu", function (ev) {
      ev.preventDefault();
    });
  seconds = 0;
  minutes = 0;
  document.querySelector(".timer").innerHTML =
    // (minutes + "").padStart(2, 0) + ":" +
    (seconds + "").padStart(3, 0);
  document.querySelector("button#undo").style.display = "";
  if (gLevel && !gundo) {
    gUser.lastname = prompt("whats your last name?");
  }

  //   console.log(gUser);
  //   alert("select difficulty & insert your name to get started");
}
function setlives(num) {
  var count = 0;
  elLives.innerHTML = "";
  if (num !== 0) {
    while (count < num) {
      elLives.innerHTML += HEART;
      count++;
    }
  }
}
function setDiff(elBtn) {
  var newdiff = elBtn.innerHTML;
  if (newdiff === "EASY") {
    gLevel = EASY;
  } else if (newdiff === "MEDIUM") {
    gLevel = MEDIUM;
  } else if (newdiff === "HARD") {
    gLevel = HARD;
  }
  // else if (newdiff === "FUCKINGHARD") {
  //   gLevel = FUCKINGHARD;
  // }

  inIt();
}
function createMineSweeperCell() {
  return {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false,
  };
}
// render the board to html table
function renderBoard(board) {
  var strHTML = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      // var currCell = board[i][j];
      // if (!currCell.isMine) {
      //   currCell.minesAroundCount = setMinesNegsCount(board, i, j);
      // }
      var cellClass = getClassName({ i: i, j: j }); // cell-0-1

      strHTML +=
        '\t<td class="cell ' +
        cellClass +
        '" oncontextmenu="cellMarked(this,' +
        i +
        "," +
        j +
        ')"' +
        '"  onclick="revealCell(this,' +
        i +
        "," +
        j +
        ')" >\n';

      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }
  var elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

function setMinesNegsCount(mat, rowIdx, colIdx) {
  var count = 0;
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > mat.length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      var currCell = mat[i][j];
      if (currCell.isMine === true) count++;
    }
  }
  return count;
}

function revealCell(elCell, i, j) {
  if (!gUser.lastname) {
    gUser.lastname = prompt("you have to insert last name!");
    return;
  }
  if (!gGame.isOn) return;
  if (gisalreadyhint) return;
  var currCell = gBoard[i][j];
  if (!gIsFirstclick && !gisSeven) {
    setRandomMines(gBoard, elCell, { i, j });
    gameHistory.push(JSON.parse(JSON.stringify(gBoard)));
  }
  if (!gIsHint) {
    expandShown(gBoard, elCell, i, j);
  }
  setTimer();
  if (ghintremain === 1 && gIsHint) {
    elHint.style.display = "none";
  }

  if (gIsHint && ghintremain > 0) {
    hintEffect(gBoard, i, j);
  }
  if (currCell.isMine === false && !gIsHint) {
    currCell.isShown = true;
    elCell.classList.add("shown");
    // elCell.classList.add("num");
    elCell.innerHTML =
      currCell.minesAroundCount > 0 ? currCell.minesAroundCount : "";
  } else if (currCell.isMine === true && !gIsHint) {
    currCell.isShown = true;
    elCell.classList.add("shown");
    elCell.innerHTML = MINE;
    glives--;
    // elLives.innerHTML = glives;
    setlives(glives);
    if (glives < 1 || (gLevel === EASY && glives === 1)) {
      // elLives.innerHTML = glives;
      showMines(gBoard);
      console.log("bobo");
    }
  }
  checkGameOver(gBoard, elCell);
  // console.log("elCell", elCell);
  console.log(gBoard);
  gameHistory.push(JSON.parse(JSON.stringify(gBoard)));
  historylives.push(glives);
}

function hintEffect(mat, rowIdx, colIdx) {
  gisalreadyhint = true;
  gIsDecreaseHint = true;
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > mat.length - 1) continue;

      var checkCell = mat[i][j];
      var location = { i, j };
      if (!checkCell.isMine) {
        checkCell.minesAroundCount = setMinesNegsCount(gBoard, i, j);
      }
      var elCell = document.querySelector("." + getClassName(location));
      if (
        elCell.classList.contains("shown") ||
        elCell.classList.contains("marked")
      )
        continue;
      checkCell.isShown = true;
      //   elCell.classList.add("shown");
      elCell.classList.add("hints");
      if (checkCell.isMine) {
        elCell.innerHTML = MINE;
      } else if (!checkCell.isMine) {
        elCell.innerHTML =
          checkCell.minesAroundCount > 0 ? checkCell.minesAroundCount : "";
      }
    }
  }
  ghintremain--;
  elHint.innerHTML = HINT + ":" + ghintremain;
  setTimeout(() => {
    gisalreadyhint = false;

    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
      if (i < 0 || i > mat.length - 1) continue;
      for (let j = colIdx - 1; j <= colIdx + 1; j++) {
        if (j < 0 || j > mat.length - 1) continue;

        var checkCell = mat[i][j];
        var location = { i, j };
        //   if (!checkCell.isMine) {
        //     checkCell.minesAroundCount = setMinesNegsCount(gBoard, i, j);
        //   }
        var elCell = document.querySelector("." + getClassName(location));
        if (elCell.classList.contains("hints")) {
          checkCell.isShown = false;
          //   elCell.classList.remove("shown");
          elCell.classList.remove("hints");
          elCell.innerHTML = "";
        }
        //   if (checkCell.isMine) {
        //     elCell.innerHTML = MINE;
        //   } else if (!checkCell.isMine) {
        //     elCell.innerHTML =
        //       checkCell.minesAroundCount > 0 ? checkCell.minesAroundCount : "";
        //   }
      }
    }

    gIsHint = false;
    // alert("timesup for hint");
  }, 2000);
}

function renderCell(location, value) {
  var cellSelector = "." + getClassName(location); // '.cell-1-2'
  var elCell = document.querySelector(cellSelector);
  elCell.classList.add("shown");
  if (!gBoard[location.i][location.j].isMine) {
    elCell.innerHTML = value > 0 ? value : "";
  } else {
    elCell.innerHTML = value;
    elCell.classList.add("endgamemines");
  }
}

function setRandomMines(mat, elCell, location) {
  //   var counter = 0;
  //   while (counter < amount) {
  //     var newCoordArr = [];
  //     for (let i = 0; i < mat.length; i++) {
  //       for (let j = 0; j < mat[0].length; j++) {
  //         if (!mat[i][j].isMine) {
  //           newCoordArr.push({ i, j });
  //         }
  //       }
  //     }
  //     // console.log(newCoordArr);
  //     shuffle(newCoordArr);
  //     // console.log(newCoordArr);
  //     var newCoord = drawNum(newCoordArr);
  //     mat[newCoord.i][newCoord.j].isMine = true;
  //     counter++;
  //   }

  var minesCreated = 0;
  while (minesCreated < gLevel.MINES) {
    var randomI = getRandomInt(0, gLevel.SIZE - 1);
    var randomJ = getRandomInt(0, gLevel.SIZE - 1);
    if (
      randomI !== location.i &&
      randomJ !== location.j &&
      !mat[randomI][randomJ].isMine
    ) {
      mat[randomI][randomJ].isMine = true;
      elCell.classList.add("mine");
      elCell.innerHTML = MINE;
      minesCreated++;
    }
  }
}
// tamir:
function setTimer() {
  if (!gIsFirstclick) {
    gIsFirstclick = true;
    gTimeInterval = setInterval(() => {
      seconds += 1;
      //   if (seconds === 60) {
      //     minutes += 1;
      //     seconds = 0;
      //   }
      //   console.log("seconds", seconds);
      document.querySelector(".timer").innerHTML =
        // (minutes + "").padStart(2, 0) + ":" +
        (seconds + "").padStart(3, 0);
    }, 1000);
  }
}
// ori:
// var gsec = -1;
// function setTimer() {
//   if (!gIsFirstclick) {
//     gIsFirstclick = true;
//     function pad(val) {
//       return val > 9 ? val : "0" + val;
//     }
//     setInterval(function () {
//       document.querySelector("#seconds").innerHTML = pad(++gsec % 60);
//       document.querySelector("#minutes").innerHTML = pad(
//         parseInt(gsec / 60, 10) % 60
//       );
//       document.querySelector("#hours").innerHTML = pad(
//         parseInt(gsec / 3600, 10)
//       );
//     }, 1000);
//   }
// }

function cellMarked(elCell, i, j) {
  if (!gGame.isOn) return;
  if (gisalreadyhint) return;
  setTimer();
  //   checkGameOver(gBoard, elCell);

  console.log(this);
  console.log(elCell);
  if (elCell.classList.contains("shown")) return;
  if (elCell.classList.contains("marked")) {
    gBoard[i][j].isMarked = false;
    elCell.classList.remove("marked");
    elCell.innerHTML = "";
  } else {
    gBoard[i][j].isMarked = true;
    elCell.classList.add("marked");
    elCell.innerHTML = FLAG;
    console.log("elCell", elCell);
    console.log("gBoard[i][j]", gBoard[i][j]);
  }
  checkGameOver(gBoard, elCell);
  gameHistory.push(JSON.parse(JSON.stringify(gBoard)));
}
function showMines(mat) {
  elRestart.innerHTML = "🤬";
  // document.querySelector("");
  for (let i = 0; i < mat.length; i++) {
    for (let j = 0; j < mat.length; j++) {
      var currCell = mat[i][j];
      var cellcoord = { i, j };
      var elcell = "." + getClassName(cellcoord);
      if (currCell.isMine) {
        // if (elcell.classList.contains("marked")) {
        //   elcell.classList.remove("marked");
        // }
        renderCell(cellcoord, MINE);
        // elcell.classList.add("endgamemines");
      }
    }
  }

  elundo.style.display = "none";
  gGame.isOn = false;
  clearInterval(gTimeInterval);
  alert("gameover:lost");
}

function expandShown(mat, elCell, rowIdx, colIdx) {
  if (!gGame.isOn) return;
  var currCell = mat[rowIdx][colIdx];
  currCell.isShown = true;
  currCell.minesAroundCount = setMinesNegsCount(mat, rowIdx, colIdx);
  renderCell({ i: rowIdx, j: colIdx }, currCell.minesAroundCount);
  // console.log("rowIdx, colIdx", rowIdx, colIdx);
  // console.log("currCell", currCell);
  if (currCell.minesAroundCount > 0 || currCell.isMine) return;
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > mat.length - 1) continue;

      var checkCell = mat[i][j];
      if (!checkCell.isShown && !checkCell.isMine) {
        expandShown(mat, elCell, i, j);
      }
    }
  }
  checkGameOver(gBoard, elCell);
}

function checkGameOver(mat, elCell) {
  if (gLevel === EASY && glives === 1) {
    elLives.innerHTML = glives - 1;
  }
  var aremarked = 0;
  var isShownCount = 0;
  var numForWin = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
  for (let i = 0; i < mat.length; i++) {
    for (let j = 0; j < mat.length; j++) {
      var currCell = mat[i][j];
      if (currCell.isMine && currCell.isMarked) {
        aremarked++;
        // console.log("aremarked", aremarked);
        // console.log(numForWin);
      } else if (!currCell.isMine && currCell.isShown) {
        isShownCount++;
      }
    }
  }
  if (aremarked === gLevel.MINES && isShownCount === numForWin) {
    elRestart.innerHTML = "😎";
    gGame.isOn = false;
    elundo.style.display = "none";
    clearInterval(gTimeInterval);
    alert("gameover: victory");
    console.log(document.querySelector(".timer").innerHTML);
    gUser.score = seconds;
    // usersBestScore.push(gUser);
    // usersBestScore.sort((a, b) => a - b);
    console.log(gUser);
    console.log(bestUser_deserealized);
    // bestUser_deserealized=JSON.parse(localStorage.getItem("bestscore"))
    if (!bestUser_deserealized || bestUser_deserealized.score > gUser.score) {
      //   gBestPlayer = gUser;

      localStorage.removeItem(selector);
      console.log("localStorage", localStorage.getItem(selector));

      gUser_serealized = JSON.stringify(gUser);
      localStorage.setItem(selector, gUser_serealized);
      console.log("localStorage", localStorage.getItem(selector));
      gUser_deserealized = JSON.parse(localStorage.getItem(selector));
      console.log(gUser_deserealized);
      setnewbest();

      //   bestUser_serealized = JSON.stringify(gBestPlayer);
      //   localStorage.setItem("bestscore", bestUser_serealized);
      //   bestUser_deserealized =
      //   bestUser_deserealized = JSON.parse(localStorage.getItem("bestscore"));

      //   console.log(bestUser_deserealized);
    }
  }
}

// document.getElementById("bestplayername").innerHTML =
//   bestUser_deserealized.lastname;
// document.getElementById("bestplayerscore").innerHTML =
//   bestUser_deserealized.score;
function hint() {
  gIsHint = true;
  if (ghintremain === 0) {
    alert("out of hints");
  }
}
function setnewbest() {
  document.getElementById("bestplayername").innerHTML =
    gUser_deserealized.lastname;
  document.getElementById("bestplayerscore").innerHTML =
    gUser_deserealized.score;
}

function safeClick() {
  gIsDecreaseSafe = true;
  if (gisalreadyhint) return;
  if (gsaferemain === 1) document.querySelector("#safe").style.display = "none";
  if (gsaferemain <= 0) {
    alert("out of safe clicks!");
    return;
  }
  gisalreadyhint = true;
  if (isSafe || gsaferemain === 0) return;
  var isSafe;
  var emptyArr = [];
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard.length; j++) {
      var currCell = gBoard[i][j];
      var location = { i, j };
      if (!currCell.isShown && !currCell.isMine && !isSafe) {
        emptyArr.push(location);
      }
    }
  }
  gsaferemain--;
  elSafe.innerText = gsaferemain;

  shuffle(emptyArr);
  var newcoord = drawNum(emptyArr);
  var elcell = document.querySelector("." + getClassName(newcoord));
  elcell.classList.add("safe");
  isSafe = true;
  setTimeout(() => {
    gisalreadyhint = false;

    elcell.classList.remove("safe");
    isSafe = false;
  }, 2000);
}

// localStorage.setItem(lastname, "Belisha");
// console.log(bestUser_deserealized);

// console.log(localStorage.getItem("bestscore"));
// document.getElementById("result").innerHTML = localStorage.getItem("lastname");
// localStorage.lastname = "Belisha";
// document.getElementById("result").innerHTML = localStorage.lastname;
function sevenBoom() {
  inIt();
  elLevel.innerHTML += " SEVEN BOOM";
  gisSeven = true;
  var count = -1;
  var counStr;
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard.length; j++) {
      var currCell = gBoard[i][j];
      console.log("curcell", currCell);

      var location = { i: i, j: j };
      console.log("location", location);
      var elcell = document.querySelector("." + getClassName(location));
      console.log("elcell", elcell);
      console.log(elcell);
      count++;
      counStr = count + "";
      if (count % 7 === 0 || counStr.includes("7")) {
        currCell.isMine = true;
        // elcell.innerHTML = MINE;
      }
    }
  }
}

// function undoStupid and long() {
//   gameHistory.pop();
//   var gamestateArr = gameHistory[gameHistory.length - 1];
//   for (let i = 0; i < gamestateArr.length; i++) {
//     for (let j = 0; j < gamestateArr[0].length; j++) {
//       var curcell = gamestateArr[i][j];
//       var location = { i: i, j: j };
//       var elcell = document.querySelector("." + getClassName(location));
//       if (curcell.isShown || !elcell.classList.contains("shown")) {
//         elcell.classList.add("");
//       }
//     }
//   }
// }
function undo() {
  gundo = true;
  gGame.isOn = true;
  if (gIsDecreaseSafe && gsaferemain < gLevel.help) {
    gsaferemain = gsaferemain + 1;
    elSafe.innerText = gsaferemain;
    gIsDecreaseSafe = false;
    return;
  }
  if (gIsDecreaseHint && ghintremain < gLevel.help) {
    ghintremain = ghintremain + 1;
    elHint.innerHTML = HINT + ":" + ghintremain;
    gIsDecreaseHint = false;
    return;
  }
  if (gameHistory.length === 2) {
    document.querySelector("button#undo").style.display = "none";
    inIt();
  }
  if (gameHistory.length > 0) {
    gameHistory.pop();
    var gameState = gameHistory[gameHistory.length - 1];
  } else gameState = glives;
  gBoard = JSON.parse(JSON.stringify(gameState));
  console.log("historylives1", historylives);
  glives = historylives.pop();
  console.log("historylives2", historylives);
  var currlivestate = historylives[historylives.length - 1];
  // elLives.innerHTML =
  currlivestate ? setlives(currlivestate) : setlives(3);
  glives = currlivestate ? currlivestate : 3;
  var strHTML = "";
  for (var i = 0; i < gameState.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < gameState[0].length; j++) {
      var currCell = gameState[i][j];
      var gBoardCell = gBoard[i][j];
      var cellClass = getClassName({ i: i, j: j });
      var location = { i: i, j: j };
      var elCell = document.querySelector("." + getClassName(location));
      var innerTd = "";
      // currCell.isShown = true;
      // currCell.isMarked = true;

      if (currCell.isShown && !currCell.isMine) {
        cellClass += " shown";
      } else if (currCell.isMine && currCell.isShown) {
        cellClass += " endgamemines";
        innerTd = MINE;
        // currCell.isShown = true;
      } else if (currCell.isMarked) {
        cellClass += " marked";
        innerTd = FLAG;
      }
      if (currCell.isShown && currCell.minesAroundCount && !currCell.isMine) {
        innerTd = currCell.minesAroundCount;
      }
      // if (!elCell.classList.contains("shown")) {
      //   currCell.isShown = false;
      //   // gBoardCell.isShown = false;
      // }
      // // currCell.isMarked = false;s
      // if (!elCell.classList.contains("marked")) {
      //   currCell.isMarked = false;
      //   // gBoardCell.isMarked = false;
      // }

      // if (!elCell.classList.contains("shown")) {
      //   console.log("hereza");
      //   currCell.isShown = false;
      // }
      strHTML +=
        '\t<td class="cell ' +
        cellClass +
        '" oncontextmenu="cellMarked(this,' +
        i +
        "," +
        j +
        ')"' +
        '"  onclick="revealCell(this,' +
        i +
        "," +
        j +
        ')" >' +
        innerTd +
        "\n";

      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }
  var elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
  console.log("gameState", gameState);
  console.log("gBoard", gBoard);
}
