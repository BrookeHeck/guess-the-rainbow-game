'use strict';

// GLOBAL VARIABLES
let allUserArray;
let globalUserName;
let currentUser;
let currentUserIndex = 0;

const lightModeColors = ['rgb(204, 0, 0)', 'rgb(204, 102, 0)', 'rgb(204, 204, 0)',
  'rgb(0, 204, 0)', 'rgb(0, 0, 204)', 'rgb(102, 0, 204)', 'rgb(255, 51, 153)', 'rgb(96, 96, 96)'];

// gets five random colors with no duplicates from light color mode array
function getColorComboAnswer() {
  let combo = [];
  while(combo.length < 5) {
    let index = Math.floor(Math.random() * lightModeColors.length);
    console.log(combo.includes(lightModeColors[index]));
    if(!combo.includes(lightModeColors[index])) {
      combo.push(lightModeColors[index]);
    }
  }
  return combo;
}

// class to hold User data to be stored in local storage
class User {
  constructor (username, gameBoard, totalGamesWon = 0, winStreak = 0, highestWinStreak = 0, totalGamesPlayed = 0, winAverage = 0) {
    this.username = username;
    this.totalGamesWon = totalGamesWon;
    this.winStreak = winStreak;
    this.highestWinStreak = highestWinStreak;
    this.totalGamesPlayed = totalGamesPlayed;
    this.winAverage = winAverage;
    this.gameBoard = gameBoard;
  }

  updateStats(winner) {
    if(winner) {
      this.totalGamesWon++;
      this.winStreak++;
    }
    this.totalGamesPlayed++;
    this.winAverage = Math.floor((this.totalGamesWon / this.totalGamesPlayed) * 100);
    if(this.highestWinStreak < this.winStreak) {
      this.highestWinStreak = this.winStreak;
    }
  }

  createStatsArr() {
    return [
      `Games Played: ${this.totalGamesPlayed}`,
      `Games Won: ${this.totalGamesWon}`,
      `Win Average: ${this.winAverage}%`,
      `Win Streak: ${this.winStreak}`,
      `Highest Win Streak: ${this.highestWinStreak}`
    ];
  }

  displayUserStats() {
    let winStatsArr = this.createStatsArr();
    let statsDiv = document.querySelector('#statsDiv');
    for(let stat of winStatsArr) {
      let statPar = document.createElement('p');
      statPar.innerHTML = stat;
      console.log(statPar);
      statsDiv.appendChild(statPar);
    }
  }
}

// class will hold the user's gameboard state so it can be rerendered later
// also holds all the functions that make the game work
class GameBoard {
  constructor (correctColorCombo = getColorComboAnswer(), previousGuesses = [], gameCounter = 0) {
    this.correctColorCombo = correctColorCombo;
    this.previousGuesses = previousGuesses;
    this.gameCounter = gameCounter;
  }

  renderBoard() {
    // guessDiv is the 5 x 6 grid that shows previous guesses/right and wrong answers
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

    // colorBoard is the color choices that users can click on
    let colorBoard = document.querySelector('#colorBoard');
    for(let i = 0; i < lightModeColors.length; i++) {
      let colorBox = document.createElement('div');
      colorBox.setAttribute('class', 'colorBox');
      colorBox.style.background =`${lightModeColors[i]}`;
      colorBoard.appendChild(colorBox);
      colorBoard.addEventListener('click', handleColorPick);
    }
  }

  // called after 5 colors are picked, gets colors from the boxes on the board and returns an array of all colors picked
  getGuessArray () {
    let guessCount = this.previousGuesses.length + 1;
    let guessArr = [];
    for(let i = 0; i < 5; i++) {
      let currentElement = document.querySelector(`.guessRow:nth-of-type(${guessCount}) .oneColor:nth-child(${i + 1})`);
      guessArr.push(currentElement.style.background);
    }
    return guessArr;
  }

  // used to store all previous guesses
  addGuess(guessColorArr) {
    this.previousGuesses.push(guessColorArr);
  }

  // compares the users guess to the correct color combo
  // returns an array of comparison values: 1 is correct color & position, 2 is wrong position, 3 is wrong color
  checkGuess() {
    let compareArr = [];
    let currentGuess = this.previousGuesses[this.previousGuesses.length - 1];
    for(let i = 0; i < 5; i++) {
      if (currentGuess[i] === this.correctColorCombo[i]) {
        compareArr.push(1);
      }
      else if (this.correctColorCombo.includes(currentGuess[i])) {
        compareArr.push(2);
      }
      else {
        compareArr.push(3);
      }
    }
    return compareArr;
  }

  // gives a color in the guessDiv a border based on the key value returned from the checkGuess function
  updateBoard(compareArr, counterStart) {
    for(let i = 0; i < compareArr.length; i++) {
      let key = document.querySelectorAll('.guessRow>*')[i + counterStart];
      if(compareArr[i] === 1) {
        key.style.border = 'solid green 5px';
      } else if (compareArr[i] === 2) {
        key.style.border = 'solid lightgrey 5px';
      } else {
        key.style.border = 'solid red 5px';
      }
    }
  }

  // clears the color picker board and puts a message and play again button after the game ends
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

  // when a game state is rerendered this loops through previous guesses to update the board
  addPreviousGuesses() {
    for(let i = 0; i < currentUser.gameBoard.previousGuesses.length; i++) {
      for(let j = 0; j < 5; j++) {
        let currentElement = document.querySelector(`.guessRow:nth-of-type(${i + 1}) .oneColor:nth-child(${j + 1})`);
        console.log(currentElement);
        console.log(currentUser.gameBoard.previousGuesses[i][j]);
        currentElement.style.background = currentUser.gameBoard.previousGuesses[i][j];
      }
    }
  }
}

function handleColorPick(event) {
  if(event.target.className === 'colorBox') {
    let boxArray = document.querySelectorAll('.guessRow>*');
    let color = event.target.style.background;

    boxArray[currentUser.gameBoard.gameCounter].style.background = color;
    currentUser.gameBoard.gameCounter++;

    if(currentUser.gameBoard.gameCounter % 5 === 0) {
      let winner = handleCompleteGuess();
      if(currentUser.gameBoard.gameCounter === 30 || winner) {
        currentUser.updateStats(winner);
        currentUser.displayUserStats();
        currentUser.gameBoard.clear(winner);
        currentUser.gameBoard = new GameBoard();
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


function getLocalStorage() {
  allUserArray = JSON.parse(localStorage.getItem('storedUsers'));
}


function updateLocalStorage() {
  localStorage.clear();
  let stringArray = JSON.stringify(allUserArray);
  localStorage.setItem('storedUsers', stringArray);
}


function getUserName() {
  let userName = document.getElementById('userName');
  let player = document.createElement('input');
  player.type='text';
  player.id='name';
  player.name = 'name';
  let playerLabel = document.createElement('label');
  playerLabel.for='name';
  playerLabel.innerHTML='Enter Username: ';
  let nameButton = document.createElement('button');
  nameButton.type='button';
  nameButton.innerHTML='Enter';
  nameButton.addEventListener('click', () => {
    globalUserName = document.querySelector('#name').value;
    document.querySelector('#userName').innerHTML = '';
    checkIfUserExists();
  });
  userName.appendChild(playerLabel);
  userName.appendChild(player);
  userName.appendChild(nameButton);

}

function checkIfUserExists() {
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
  startGame();
}

function startGame() {
  currentUser.gameBoard.renderBoard();
  currentUser.gameBoard.addPreviousGuesses();
  let startUpdateAt = 0;
  for(let guess of currentUser.gameBoard.previousGuesses) {
    currentUser.gameBoard.updateBoard(currentUser.gameBoard.checkGuess(guess), startUpdateAt);
    startUpdateAt += 5;
  }
}

function createExistingUserObject(existingUser) {
  let existingGame = new GameBoard(existingUser.gameBoard.correctColorCombo, existingUser.gameBoard.previousGuesses, existingUser.gameBoard.gameCounter);

  let existingUserNewObject = new User(globalUserName, existingGame, existingUser.totalGamesWon, existingUser.winStreak, existingUser.highestWinStreak, existingUser.totalGamesPlayed, existingUser.winAverage);
  currentUser = existingUserNewObject;
}

function makeUserForStorage(existingUser) {
  if(existingUser) {
    createExistingUserObject(existingUser);
    allUserArray[currentUserIndex] = currentUser;
  } else if (!existingUser) {
    let newGame = new GameBoard();
    currentUser = new User(globalUserName, newGame);
    allUserArray.push(currentUser);
  }
  updateLocalStorage();
}

getLocalStorage();
getUserName();

