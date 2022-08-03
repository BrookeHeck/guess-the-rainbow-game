'use strict';

// GLOBAL VARIABLES
// User Array from local storage, current user
let currentUser = new User();

// USER CONSTRUCTOR and PROTOTYPES
/* DONE: create User constructor with these properties:
    username:
    totalGamesWon:
    winStreak:
    highestWinStreak:
    GameBoard: (it's an object)
  */
function User(username, totalGamesWon = 0, winStreak = 0, highestWinStreak = 0)
{
  this.username = username;
  this.totalGamesWon = totalGamesWon;
  this.winStreak = winStreak;
  this.highestWinStreak = highestWinStreak;
  this.GameBoard = new GameBoard();
}

// Prototype functions for user
// TODO: create function to update properties of User object's stats
User.prototype.updateStats = function() {

}

// GAME BOARD CONSTRUCTOR and PROTOTYPES
function GameBoard(colorArray = generateRandomColors(), correctOrderArr = getCorrectOrder(), previousGuesses = [], gameCounter = 0) {
  // color array holds 6 possible random colors, correct answer holds the random word
  // previous guess holds an array of user guesses
  // ['hsl(x, x, x)', 'hsl(x, x, x)', 'hsl(x, x, x)', 'hsl(x, x, x)'];
  this.colorArray = colorArray;
  this.correctOrderArr = correctOrderArr;
  this.previousGuesses = previousGuesses;
  this.gameCounter = gameCounter;
}

// prototype functions for GameBoard
// push the guess onto the game board object guess array
GameBoard.prototype.addGuess = function(guessColorArr) {
  this.previousGuesses.push(guessColorArr);
};

// window into the dom, create grid for guesses and create another grid for keyboard
// // TODO: add event listeners to keyboard so the guess is added to the game board guesses array, checked, and board update
GameBoard.prototype.renderBoard = function() {
  // guess div is the window into the dom
  let guessDiv = document.querySelector('#guessDiv');

  for(let y = 0; y < 6; y++) {
    // word div will create a row that will hold boxes for each letter
    let guessRow = document.createElement('div');
    guessRow.setAttribute('class', 'guessRow');
    guessDiv.appendChild(guessRow);
    for(let x = 0; x < 5; x++) {
      // oneColor box will hold the letter that the user chooses
      // once I make an event handler I will add a event listener
      let oneColor = document.createElement('div');
      oneColor.setAttribute('class', 'oneColor');
      guessRow.appendChild(oneColor);
    }
  }

  // this loop will create six boxes that hold the colors that the user can click
  // this will need an event listener too, but i'm gonna wait til we have an event handler
  let colorBoard = document.querySelector('#colorBoard');
  for(let i = 0; i < 6; i++) {
    let colorBox = document.createElement('div');
    colorBox.setAttribute('class', 'colorBox');
    colorBox.style.background =`${this.colorArray[i]}`;
    colorBoard.appendChild(colorBox);
    colorBoard.addEventListener('click', handleColorPick);
  }
};

// let enter = document.createElement('div');
//   enter.setAttribute('id', 'enterButton');
//   enter.addEventListener('click', handleGuess);
//   colorBoard.appendChild(enter);


// i just made a game board to test if it actually rendered, it works so far :)
let testGame = new GameBoard(['red', 'green', 'blue', 'black', 'purple', 'orange'], '', ['wrong']);
testGame.renderBoard();

// this function will get the guess from the game board
GameBoard.prototype.getGuessArray = function() {
  // guess count will tell me what row I need to grab from the board
  let guessCount = this.previousGuesses.length + 1;
  let guessArr = [];
  for(let i = 0; i < 5; i++) {
    // current element is the individual box in that row that i need to get the color from
    let currentElement = document.querySelector(`.guessRow:nth-of-type(${guessCount}) .oneColor:nth-child(${i})`);
    // add that color to the array
    guessArr.push(currentElement.style.background);
  }
  return guessArr;
};


GameBoard.prototype.checkGuess = function() {
  // i made array to tell me if this position guess is right, wrong, or somewhere else in the array
  // key: 1 = correct!, 2 = not in the right spot, 3 = wrong
  let compareArr = [];
  // current guess is the last guess added to the previous guess array
  let currentGuess = this.previousGuesses[this.previousGuesses.length - 1];
  for(let i = 0; i < 5; i++) {
    if (currentGuess[i] === this.correctAnswer[i]) {
      compareArr.push(1);
    } else if (this.correctAnswer.includes(currentGuess[i])) {
      compareArr.push(2);
    } else {
      compareArr.push(3);
    }
  }
  // i return this array so that it can be used to update the board
  return compareArr;
};


GameBoard.prototype.updateBoard = function (intArr) {
  // i used the guess count to figure out which row i need to update
  let guessCount = this.previousGuesses.length;
  // then I'm gonna loop through that int array from the check guess function
  // based on the key in the check guess function i'll change the border
  for(let int of intArr) {
    let key = document.querySelector(`.guessRow:nth-of-type(${guessCount}) .oneColor:nth-child(${int})`);
    if(int === 1) {
      key.style.border = 'solid green 5px';
    } else if (int === 2) {
      key.style.border = 'solid grey 5px';
    } else {
      key.style.border = 'solid red 5px';
    }
  }
};

GameBoard.prototype.renderStatsDisplay = function() {

};


// this function 'zeroes' /ut the game board display for a new game this also could be called in the event handler when the game ends, clear the game board and display stats for the current user
GameBoard.prototype.clear = function() {

};


// HELPER FUNCTIONS

function handleColorPick(event) {
  let boxArray = document.querySelectorAll('.guessRow>*');
  let color = event.target.style.background;
  boxArray[currentUser.GameBoard.gameCounter].style.background = color;
  currentUser.GameBoard.gameCounter++;
}

// call this function in the game board constructor when a new game is started
function getCorrectOrder() {
  // generate a random number between 0 and dictionary word array length minus one
  // get the word stored in the array at that randomly generated index
  // return this word
}

// call this function in the game board constructor when a new game is started
function generateRandomColors() {
  // make an empty array to store hsl strings
  // get random number for hue
  // put that number into string literal to make hsl string
  // push color string onto array
  // return array
}

function handleGuess() {
  let guess = currentUser.GameBoard.getGuessArray();
  currentUser.GameBoard.addGuess(guess);
  currentUser.GameBoard.checkGuess();
  currentUser.GameBoard.updateBoard();
}

// i was thinking this could be called on page load
function driver() {
  // getLocalStorage to initialize global variables
  // prompt user to enter name
  // take that string and pass it to getUser to see if user exists or not

  // conditional

  // if user array in local storage is null
  // call store dictionary word
  // create a user array save it as the local variable
  // call the create new user function and save the user object as the current user and push it to user array

  // if user array exists, but user is a new user
  // call the create new user function, save it as current user, and push it to user array

  // if user exists already
  // set the current user variable to that object from the array
  

  // render the gameboard that is stored in the User object
}


// traverse through userObjects array
// if user's name exists in any object's name property, return that object
// if doesn't exist it will return null
function getUser(username) {
  
}

// this function will get variables out of local storage set initialize the user object array global variables
function getLocalStorage() {

}

// in the drive conditional, call this when a new user must be created
// it will create a new user object with the user's name
// return the object so that it can be stored as current user and pushed onto the user array
// credit: https://bobbyhadz.com/blog/javascript-read-file-into-array#:~:text=Use%20the%20fs.,get%20an%20array%20of%20strings.
function createNewUser(username) {
  
}

// this function will be called to create a new gameboard object
// this will be a helper function used inside of the User constructor function to create a game board object and set it equal to the Users game board
// this function should return the new game board object
function createGameBoard() {
  
}

// this function is called multiple times throughout the application, anytime the User object is changed or updated, we need to update that object in the global, update the global user array, and then set the array in local storage to be the updated global array
function updateLocalStorage() {

}
