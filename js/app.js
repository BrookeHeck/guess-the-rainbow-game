'use strict';

// GLOBAL VARIABLES
let allUserArray;
let globalUserName;
let currentUser;
let currentUserIndex = 0;
const lightModeColors = ['rgb(204, 0, 0)', 'rgb(204, 102, 0)', 'rgb(204, 204, 0)',
  'rgb(0, 204, 0)', 'rgb(0, 0, 204)', 'rgb(102, 0, 204)', 'rgb(255, 51, 153)', 'rgb(115, 54, 0)'];

const darkModeColors = ['rgb(255, 0, 0)', 'rgb(255, 172, 0)', 'rgb(255, 241, 0)', 'rgb(11, 255, 0)',
  'rgb(0, 246, 255)', 'rgb(176, 38, 255)', 'rgb(255, 110, 199)', 'rgb(173, 81, 0)'];

// gets five random colors with no duplicates from light color mode array
function getColorComboAnswer() {
  let combo = [];
  let currColorArr;
  if(currentUser) {
    currColorArr = currentUser.colorMode === 'light' ? lightModeColors : darkModeColors;
  } else {
    currColorArr = lightModeColors;
  }
  while(combo.length < 5) {
    let index = Math.floor(Math.random() * currColorArr.length);
    if(!combo.includes(currColorArr[index])) {
      combo.push(currColorArr[index]);
    }
  }
  return combo;
}

// class to hold User data to be stored in local storage
class User {
  constructor (username, gameBoard, totalGamesWon = 0, winStreak = 0, highestWinStreak = 0,
    totalGamesPlayed = 0, winAverage = 0, colorMode = 'light') {
    this.username = username;
    this.totalGamesWon = totalGamesWon;
    this.winStreak = winStreak;
    this.highestWinStreak = highestWinStreak;
    this.totalGamesPlayed = totalGamesPlayed;
    this.winAverage = winAverage;
    this.colorMode = colorMode;
    this.gameBoard = gameBoard;
  }

  // updates all the stats once a game is complete
  updateStats(winner) {
    if(winner) {
      this.totalGamesWon++;
      this.winStreak++;
    } else {
      this.winStreak = 0;
    }
    this.totalGamesPlayed++;
    this.winAverage = Math.floor((this.totalGamesWon / this.totalGamesPlayed) * 100);
    if(this.highestWinStreak < this.winStreak) {
      this.highestWinStreak = this.winStreak;
    }
  }

  // it was easier to create an array to loop through to create a stats board
  createStatsArr() {
    return [
      `Games Played: ${this.totalGamesPlayed}`,
      `Games Won: ${this.totalGamesWon}`,
      `Win Average: ${this.winAverage}%`,
      `Win Streak: ${this.winStreak}`,
      `Highest Win Streak: ${this.highestWinStreak}`
    ];
  }

  // loops through stats array to add each stat to a div
  displayUserStats() {
    let winStatsArr = this.createStatsArr();
    let statsDiv = document.querySelector('#statsDiv');
    statsDiv.style.visibility = 'visible';
    let closeButton = document.createElement('button');
    closeButton.innerHTML = 'X';
    closeButton.addEventListener('click', () => {
      statsDiv.innerHTML = '';
      statsDiv.style.visibility = 'hidden';
      let statsButton = document.querySelector('nav img:first-of-type');
      statsButton.addEventListener('click', function handle(event) {
        event.target.removeEventListener('click', handle);
        currentUser.displayUserStats();
      });
    });
    statsDiv.appendChild(closeButton);
    for(let stat of winStatsArr) {
      let statPar = document.createElement('p');
      statPar.innerHTML = stat;
      statsDiv.appendChild(statPar);
    }
  }
}

// class will hold the user's gameboard state so it can be rerendered later
// also holds all the functions with the game logic
class GameBoard {
  constructor (difficultyLevel = 'easy', numGuesses = 6, correctColorCombo = getColorComboAnswer(), previousGuesses = [], gameCounter = 0) {
    this.difficultyLevel = difficultyLevel;
    this.numGuesses = numGuesses;
    this.correctColorCombo = correctColorCombo;
    this.previousGuesses = previousGuesses;
    this.gameCounter = gameCounter;
  }

  renderBoard() {
    // guessDiv is the 5 x 6 grid that shows previous guesses/right and wrong answers
    let guessDiv = document.querySelector('#guessDiv');
    for(let y = 0; y < this.numGuesses; y++) {
      let guessRow = document.createElement('div');
      guessRow.setAttribute('class', 'guessRow');
      guessDiv.appendChild(guessRow);
      for(let x = 0; x < 5; x++) {
        let oneColor = document.createElement('div');
        oneColor.setAttribute('class', 'oneColor');
        guessRow.appendChild(oneColor);
      }
    }

    // use this conditional to render the right amount of colors based on difficulty level
    if(lightModeColors.length === 8 &&
      (this.difficultyLevel === 'medium' || this.difficultyLevel === 'hard')) {
      lightModeColors.push('rgb(0, 128, 128)');
      darkModeColors.push('rgb(179,191,255)');
    } else if (lightModeColors.length === 9 && this.difficultyLevel === 'easy') {
      lightModeColors.pop();
      darkModeColors.pop();
    }

    // figure out which color mode colors to use
    let currColorArr;
    if(currentUser) {
      currColorArr = currentUser.colorMode === 'light' ? lightModeColors : darkModeColors;
    } else {
      currColorArr = lightModeColors;
    }

    // colorBoard is the color choices that users can click on
    let colorBoard = document.querySelector('#colorBoard');
    for(let i = 0; i < lightModeColors.length; i++) {
      let colorBox = document.createElement('div');
      colorBox.setAttribute('class', 'colorBox');
      colorBox.style.background =`${currColorArr[i]}`;
      colorBoard.appendChild(colorBox);
      colorBoard.addEventListener('click', handleColorPick);
    }

    // backspace button allows user to delete previous pick but not entire guess
    let backButton = document.createElement('img');
    backButton.src = './img/icons8-backspace-40.png';
    backButton.alt = 'backspace';
    backButton.addEventListener('click', this.backspace);
    colorBoard.appendChild(backButton);
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
        key.style.outline = 'solid green 4px';
      } else if (compareArr[i] === 2) {
        key.style.outline = 'solid rgb(170,181,167) 4px';
      } else {
        key.style.outline = 'solid red 4px';
      }
    }
  }

  // clears the color picker board and puts a message and play again button after the game ends
  clear (winner) {
    let gameBoardDiv = document.querySelector('#colorBoard');
    gameBoardDiv.innerHTML = '';
    let strMessage = winner ? 'Congrats, You Won!' : 'So Close! Thanks for Playing';
    let winnerPTag = document.createElement('p');
    gameBoardDiv.style.flexDirection = 'column';
    winnerPTag.innerHTML = strMessage;
    gameBoardDiv.appendChild(winnerPTag);

    let playAgainButton = document.createElement('button');
    playAgainButton.innerHTML = 'Play Again?';
    playAgainButton.addEventListener('click', () => {
      this.startAnotherGame(this.difficultyLevel, this.numGuesses);
    });
    gameBoardDiv.appendChild(playAgainButton);
  }

  // when a game state is rerendered this loops through previous guesses to update the board
  addPreviousGuesses() {
    for(let i = 0; i < currentUser.gameBoard.previousGuesses.length; i++) {
      for(let j = 0; j < 5; j++) {
        let currentElement = document.querySelector(`.guessRow:nth-of-type(${i + 1}) .oneColor:nth-child(${j + 1})`);
        currentElement.style.background = currentUser.gameBoard.previousGuesses[i][j];
      }
    }
  }

  // event handler for backspace button
  backspace() {
    if(currentUser.gameBoard.gameCounter % 5 !== 0) {
      let colorBoxes = document.querySelectorAll('.oneColor');
      colorBoxes[currentUser.gameBoard.gameCounter - 1].style.background = 'white';
      currentUser.gameBoard.gameCounter--;
    }
  }

  // changes colors and numbers of guesses based on difficulty level chosen by user
  switchDifficulty(event) {
    let chosenDifficulty = event.target.innerHTML;
    if(lightModeColors.length === 8 && (chosenDifficulty === 'medium' || chosenDifficulty === 'hard')) {
      lightModeColors.push('rgb(0, 128, 128)');
      darkModeColors.push('rgb(179, 191, 255)');
    } else if (lightModeColors.length === 9 && chosenDifficulty === 'easy') {
      lightModeColors.pop();
      darkModeColors.pop();
    }
    this.numGuesses = chosenDifficulty === 'hard' ? 5 : 6;
    this.difficultyLevel = chosenDifficulty;
    currentUser.gameBoard.startAnotherGame(this.difficultyLevel, this.numGuesses);
  }

  // creates a new game board and rerenders it when a user wants to play again or change difficulty
  startAnotherGame(difficulty, guesses) {
    let gameBoardDiv = document.querySelector('#colorBoard');
    currentUser.gameBoard = new GameBoard(difficulty, guesses);
    updateLocalStorage();
    gameBoardDiv.style.flexDirection = 'row';
    gameBoardDiv.innerHTML = '';
    document.querySelector('#guessDiv').innerHTML = '';
    document.querySelector('#statsDiv').innerHTML = '';
    if(currentUser.colorMode === 'dark') {
      currentUser.colorMode = 'light';
      colorModeToggleHandler();
    }
    currentUser.gameBoard.renderBoard();
  }
}

// this is the event listener for the color choices that users can click
function handleColorPick(event) {
  // start by updating the board with users selection
  if(event.target.className === 'colorBox') {
    let boxArray = document.querySelectorAll('.guessRow>*');
    let color = event.target.style.background;

    boxArray[currentUser.gameBoard.gameCounter].style.background = color;
    currentUser.gameBoard.gameCounter++;

    // if the user makes 5 selections the guess must be handled
    if(currentUser.gameBoard.gameCounter % 5 === 0) {
      // handle complete guess will add borders to the guess board and save the previous guess
      let winner = handleCompleteGuess();
      // if they win or run out of guesses, update stats and create a new board for user
      if(currentUser.gameBoard.gameCounter === (currentUser.gameBoard.numGuesses * 5) || winner) {
        currentUser.updateStats(winner);
        currentUser.displayUserStats();
        currentUser.gameBoard.clear(winner);
        // currentUser.gameBoard = new GameBoard();
        updateLocalStorage();
      }
    }
  }
}

// this function takes the guess uses functions from the gameboard class to get the guess,
// add it to an array, check if the guess is right, and update the board accordingly
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

// get the users name from input box
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
    document.querySelector('#displayName').innerHTML = globalUserName;
  });
  userName.appendChild(playerLabel);
  userName.appendChild(player);
  userName.appendChild(nameButton);
}

// use a conditional to see if the user is already in local storage
function checkIfUserExists() {
  if(allUserArray) {
    let isFound = false;
    for(let user in allUserArray) {
      if(allUserArray[user].username === globalUserName) {
        currentUserIndex = user;
        createUserObject(allUserArray[user]);
        isFound = true;
        break;
      }
    }
    if (!isFound) {
      createUserObject(null);
    }
  } else {
    allUserArray = [];
    createUserObject(null);
  }
  startGame();
}

// creates object from an existing user in local storage or makes a new one
function createUserObject(existingUser) {
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

// if the user exists, makes the user object with data from local storage
function createExistingUserObject(existingUser) {
  let existingGame = new GameBoard( existingUser.gameBoard.difficultyLevel,
    existingUser.gameBoard.numGuesses, existingUser.gameBoard.correctColorCombo,
    existingUser.gameBoard.previousGuesses, existingUser.gameBoard.gameCounter);

  let existingUserNewObject = new User(globalUserName, existingGame, existingUser.totalGamesWon, existingUser.winStreak, existingUser.highestWinStreak, existingUser.totalGamesPlayed, existingUser.winAverage, existingUser.colorMode);
  currentUser = existingUserNewObject;
}

// renders the board and if the user had a previous game it will render previous guesses and update the game counter
// also adds event listeners so that user can see their game stats and settings
function startGame() {
  document.querySelector('.navbar-nav').style.visibility = 'visible';
  currentUser.gameBoard.renderBoard();
  if(currentUser.colorMode === 'dark') {
    currentUser.colorMode = 'light';
    colorModeToggleHandler();
  }
  currentUser.gameBoard.addPreviousGuesses();
  let startUpdateAt = 0;
  for(let guess of currentUser.gameBoard.previousGuesses) {
    currentUser.gameBoard.updateBoard(currentUser.gameBoard.checkGuess(guess), startUpdateAt);
    startUpdateAt += 5;
  }
  let statsButton = document.querySelector('nav img:first-of-type');
  statsButton.addEventListener('click', function handle(event) {
    event.target.removeEventListener('click', handle);
    currentUser.displayUserStats();
  });
  let colorModeToggle = document.querySelector('.dropdown-menu li span:first-of-type');
  colorModeToggle.addEventListener('click', colorModeToggleHandler);

  for(let i = 1; i < 6; i+=2) {
    let selectionElement = document.querySelector(`.dropdown-menu li:nth-child(2) span:nth-child(${i})`);
    selectionElement.addEventListener('click', currentUser.gameBoard.switchDifficulty);
  }
}

// start with setting the global variable of user array to what's in local storage
getLocalStorage();
// displays the form to get the user's name
//then the previous functions are used to set up the correct game board and start the game
getUserName();
// start the user off with a light background
toggleHeaderColor(lightModeColors);


// The following code will change settings based on user input

// enable setting to be changed, event listener add to settings button in startGame()
function colorModeToggleHandler() {
  document.querySelector('.dropdown-menu li span:first-of-type').innerHTML = `${currentUser.colorMode} mode`;
  currentUser.colorMode = currentUser.colorMode === 'light' ? 'dark' : 'light';
  let newColorArr = currentUser.colorMode === 'light' ? lightModeColors : darkModeColors;
  let oldColorArr = currentUser.colorMode === 'light' ? darkModeColors : lightModeColors;
  toggleHeaderColor(newColorArr);
  toggleBackgroundColor();
  toggleColorCombo(newColorArr, oldColorArr);
  toggleBoardColors(newColorArr, oldColorArr);
  togglePreviousGuesses(newColorArr, oldColorArr);
}

// toggle the header between light and dark mode colors
function toggleHeaderColor(colorModeArr) {
  let logo = document.querySelector('h1');
  logo.innerHTML = '';
  let counter = 0;
  for (let char of 'Guess the Rainbow') {
    let charSpan = document.createElement('span');
    charSpan.innerHTML = char;
    if(char !== ' ') charSpan.style.color = colorModeArr[counter];
    logo.appendChild(charSpan);
    counter++;
    if(counter === colorModeArr.length) counter = 0;
  }
}

// change the main, nav, and text to opposite color
function toggleBackgroundColor() {
  let navClasses = document.querySelector('.navbar').classList;
  let displayName = document.querySelector('#displayName');
  if(currentUser.colorMode === 'light') {
    navClasses.replace('bg-dark', 'bg-light');
    document.querySelector('main').style.background = 'white';
    displayName.style.color = 'black';
  }
  if (currentUser.colorMode === 'dark') {
    navClasses.replace('bg-light', 'bg-dark');
    document.querySelector('main').style.background = 'black';
    displayName.style.color = 'white';
  }
}

// if the user changes color mode, this will be used to change the rgb colors in the correct combo array
function toggleColorCombo(newColorArr, oldColorArr) {
  for(let correctColor in currentUser.gameBoard.correctColorCombo) {
    for(let colorIndex in oldColorArr) {
      if(currentUser.gameBoard.correctColorCombo[correctColor] === oldColorArr[colorIndex]) {
        currentUser.gameBoard.correctColorCombo[correctColor] = newColorArr[colorIndex];
        break;
      }
    }
  }
}

// changes the boxes already with colors to the opposite color mode
function toggleBoardColors(newColorArr, oldColorArr) {
  let allBoxes = [document.querySelectorAll('.oneColor'), document.querySelectorAll('.colorBox')];
  for(let boxArr of allBoxes) {
    for(let box of boxArr) {
      if(box.style.background !== 'rgb(230, 230, 230)') {
        for(let colorIndex in oldColorArr) {
          if(box.style.background === oldColorArr[colorIndex]) {
            box.style.background = newColorArr[colorIndex];
            break;
          }
        }
      }
    }
  }
}

// loops through the previous guess array and changes them all to dark mode colors
function togglePreviousGuesses(newColorArr, oldColorArr) {
  for(let guessIndex in currentUser.gameBoard.previousGuesses) {
    for(let colorSelected in currentUser.gameBoard.previousGuesses[guessIndex]) {
      for(let oldColorIndex in oldColorArr) {
        if(currentUser.gameBoard.previousGuesses[guessIndex][colorSelected] === oldColorArr[oldColorIndex]) {
          currentUser.gameBoard.previousGuesses[guessIndex][colorSelected] = newColorArr[oldColorIndex];
          break;
        }
      }
    }
  }
}
