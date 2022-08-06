'use strict';

// GLOBAL VARIABLES
let allUserArray;
let globalUserName;
let currentUser;
let currentUserIndex = 0;

// class to hold User data to be stored in local storage
class User {
  User(username, gameBoard, totalGamesWon = 0, winStreak = 0, highestWinStreak = 0) {
    this.username = username;
    this.totalGamesWon = totalGamesWon;
    this.winStreak = winStreak;
    this.highestWinStreak = highestWinStreak;
    this.gameBoard = gameBoard;
  }
}

// class to hold the gameboard of
class GameBoard {
  GameBoard(colorArray, correctOrderArr, previousGuesses = [], gameCounter = 0) {
    this.colorArray = colorArray;
    this.previousGuesses = previousGuesses;
    this.correctOrderArr = correctOrderArr;
    this.gameCounter = gameCounter;
  }

  addGuess(guessColorArr) {
    this.previousGuesses.push(guessColorArr);
  }

  renderBoard() {
    let guessDiv = document.querySelector('#guessDiv');
    for(let y = 0; y < 6; y++) {
      let guessRow = document.createElement('div');
      guessRow.setAttribute('class', 'guessRow');
      guessDiv.appendChild(guessRow);
      for(let x = 0; x < 5; x++) {
        let oneColor = document.createElement('div');
        oneColor.setAttribute('class', 'oneColor');
        guessRow.appendChild(oneColor);
      }
    }
    let colorBoard = document.querySelector('#colorBoard');
    for(let i = 0; i < currentUser.gameBoard.colorArray.length; i++) {
      let colorBox = document.createElement('div');
      colorBox.setAttribute('class', 'colorBox');
      colorBox.style.background =`${currentUser.gameBoard.colorArray[i]}`;
      colorBoard.appendChild(colorBox);
      colorBoard.addEventListener('click', handleColorPick);
    }
  }

  getGuessArray () {
    let guessCount = this.previousGuesses.length + 1;
    let guessArr = [];
    for(let i = 0; i < 5; i++) {
      let currentElement = document.querySelector(`.guessRow:nth-of-type(${guessCount}) .oneColor:nth-child(${i + 1})`);
      guessArr.push(getHSLString(currentElement));
    }
    return guessArr;
  }

  checkGuess() {
    let compareArr = [];
    let currentGuess = this.previousGuesses[this.previousGuesses.length - 1];
    for(let i = 0; i < 5; i++) {
      if (currentGuess[i] === this.correctOrderArr[i]) {
        compareArr.push(1);
      }
      else if (this.correctOrderArr.includes(currentGuess[i])) {
        compareArr.push(2);
      }
      else {
        compareArr.push(3);
      }
    }
    return compareArr;
  }

  updateBoard(compareArr, counterStart) {
    for(let i = 0; i < compareArr.length; i++) {
      let key = document.querySelectorAll('.guessRow>*')[i + counterStart];
      if(compareArr[i] === 1) {
        key.style.border = 'solid green 5px';
      } else if (compareArr[i] === 2) {
        key.style.border = 'solid yellow 5px';
      } else {
        key.style.border = 'solid red 5px';
      }
    }
  }

  clear (winner) {
    let gameBoard = document.querySelector('#colorBoard');
    gameBoard.innerHTML = '';
    let strMessage = winner ? 'Congrats, You Won!' : 'So Close! Thanks for Playing';
    let winnerPTag = document.createElement('p');
    winnerPTag.innerHTML = strMessage;
    gameBoard.style.flexDirection = 'column';
    gameBoard.appendChild(winnerPTag);
    let playAgainButton = document.createElement('button');
    playAgainButton.innerHTML = 'Play Again?';
    playAgainButton.addEventListener('click', () => {
      location.reload();
    });
    gameBoard.appendChild(playAgainButton);
  }
}

function addPreviousGuesses() {
  for(let i = 0; i < currentUser.gameBoard.previousGuesses.length; i++) {
    for(let j = 0; j < 5; j++) {
      let currentElement = document.querySelector(`.guessRow:nth-of-type(${i + 1}) .oneColor:nth-child(${j + 1})`);
      console.log(currentElement);
      console.log(currentUser.gameBoard.previousGuesses[i][j]);
      currentElement.style.background = currentUser.gameBoard.previousGuesses[i][j];
    }
  }
}

function getHSLString(e) {
  let boardArr = document.querySelectorAll('.colorBox');
  let pickedIndex = -1;
  for(let i = 0; i < boardArr.length; i++) {
    if (boardArr[i].style.background === e.style.background) {
      pickedIndex = i;
      break;
    }
  }
  return currentUser.gameBoard.colorArray[pickedIndex];
}

function handleColorPick(event) {
  if(event.target.className === 'colorBox') {
    let boxArray = document.querySelectorAll('.guessRow>*');
    let color = getHSLString(event.target);

    boxArray[currentUser.gameBoard.gameCounter].style.background = color;
    currentUser.gameBoard.gameCounter++;

    if(currentUser.gameBoard.gameCounter % 5 === 0) {
      let winner = handleCompleteGuess();
      if(currentUser.gameBoard.gameCounter === 30 || winner) {
        if(winner) {
          currentUser.updateStats;
        } else {
          currentUser.updateStats;
        }
        currentUser.gameBoard.clear(winner);
        let newColArr = generateRandomColors();
        let newColCombo = getCorrectOrder(newColArr);
        currentUser.gameBoard = new GameBoard(newColArr, newColCombo);
        updateLocalStorage();
      }
    }
  }
}


function handleCompleteGuess() {
  let winner = false;
  let guess = currentUser.gameBoard.getGuessArray();
  currentUser.gameBoard.addGuess(guess);
  let compareArr = currentUser.gameBoard.checkGuess();
  if(compareArr[0] === 1 && compareArr[1] === 1 && compareArr[2] === 1 && compareArr[3] === 1 && compareArr[4] === 1) {
    winner = true;
  }
  currentUser.gameBoard.updateBoard(compareArr, currentUser.gameBoard.gameCounter - 5);
  updateLocalStorage();
  return winner;
}

function getCorrectOrder(colorArray) {
  let winningCombo = [];
  while(winningCombo.length < 5) {
    let randColor = getRandomNumber(0, (colorArray.length-1));
    if (!winningCombo.includes(colorArray[randColor])) {
      winningCombo.push(colorArray[randColor]);
    }
  }
  return winningCombo;
}

function generateRandomColors() {
  let redHues = {
    minRange: -10,
    maxRange: 5
  };
  let orangeHues = {
    minRange: 20,
    maxRange: 44
  };
  let yellowsHues = {
    minRange: 52,
    maxRange: 61
  };
  let greenHues = {
    minRange: 71,
    maxRange: 143
  };
  let cyanHues = {
    minRange: 163,
    maxRange: 186
  };
  let blueHues = {
    minRange: 185,
    maxRange: 237
  };
  let violetHues = {
    minRange: 245,
    maxRange: 287
  };
  let magentaHues = {
    minRange: 296,
    maxRange: 327
  };
  let hueObjectsArray = [
    redHues,
    orangeHues,
    yellowsHues,
    greenHues,
    cyanHues,
    blueHues,
    violetHues,
    magentaHues
  ];


  let hslArray = [];
  for (let i = 0; i < hueObjectsArray.length; i++) {
    let randomHue = getARandomColorInRange(hueObjectsArray[i]);
    let randomSaturation = getRandomNumber(65, 85);
    let randomLightness = getRandomNumber(50, 60);
    hslArray.push(`hsl(${randomHue},${randomSaturation}%,${randomLightness}%)`);

  }
  return hslArray;
}

function getARandomColorInRange(colorObject) {
  let hueInRange = getRandomNumber(colorObject.minRange, colorObject.maxRange);
  return hueInRange;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

getLocalStorage();
createNewUser();


function checkIfUserExists() {
  let startGame = false;
  if(allUserArray) {
    let isFound = false;
    for(let user in allUserArray) {
      if(allUserArray[user].username === globalUserName) {
        currentUserIndex = user;
        makeUserForStorage(allUserArray[user]);
        isFound = true;
        break;
      }
    }
    if (!isFound) {
      makeUserForStorage(null);
    }
  } else {
    allUserArray = [];
    makeUserForStorage(null);
  }
  startGame = true;
  if(startGame) {
    currentUser.gameBoard.renderBoard();
    addPreviousGuesses();
    let startUpdateAt = 0;
    for(let guess of currentUser.gameBoard.previousGuesses) {
      currentUser.gameBoard.updateBoard(currentUser.gameBoard.checkGuess(guess), startUpdateAt);
      startUpdateAt += 5;
    }
  }
}


function makeUserForStorage(existingUser) {
  if(existingUser) {
    let existingGame = new GameBoard(existingUser.gameBoard.colorArray, existingUser.gameBoard.correctOrderArr, existingUser.gameBoard.previousGuesses, existingUser.gameBoard.gameCounter);
    let existingUserNewObject = new User(globalUserName, existingGame);
    currentUser = existingUserNewObject;
    allUserArray[currentUserIndex] = existingUserNewObject;
  } else if (!existingUser) {
    let newColorArray = generateRandomColors();
    let newCombo = getCorrectOrder(newColorArray);
    let newGame = new GameBoard(newColorArray, newCombo);
    currentUser = new User(globalUserName, newGame);
    allUserArray.push(currentUser);
  }
  updateLocalStorage();
}

function getUser() {
  let name = document.getElementById('name');
  globalUserName = name.value;
  let userForm = document.querySelector('#userName');
  userForm.innerHTML = '';
}


function getLocalStorage() {
  allUserArray = JSON.parse(localStorage.getItem('storedUsers'));
}

function createNewUser() {
  let userName = document.getElementById('userName');
  let player = document.createElement('input');
  player.type='text';
  player.id='name';
  player.name = 'name';
  let playerLabel = document.createElement('label');
  playerLabel.for='name';
  playerLabel.innerHTML='Please enter your name.';
  let nameButton = document.createElement('button');
  nameButton.type='button';
  nameButton.innerHTML='Submit';
  nameButton.addEventListener('click', () => {
    getUser();
    checkIfUserExists();
  });
  userName.appendChild(playerLabel);
  userName.appendChild(player);
  userName.appendChild(nameButton);

}

function updateLocalStorage() {
  localStorage.clear();
  let stringArray = JSON.stringify(allUserArray);
  localStorage.setItem('storedUsers', stringArray);
}

