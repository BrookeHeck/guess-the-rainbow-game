'use strict';

const lightColors = ['rgb(204, 0, 0)', 'rgb(204, 102, 0)', 'rgb(204, 204, 0)', 'rgb(0, 204, 0)', 'rgb(0, 0, 204)', 'rgb(102, 0, 204)', 'rgb(255, 51, 153)', 'rgb(96, 96, 96)'];

const darkColors = ['rgb(210,39,48)', 'rgb(255,173,0)', 'rgb(224,231,34)', 'rgb(68,214,44)', 'rgb(77, 77, 255)', 'rgb(199,36,177)', 'rgb(219,62,177)', 'rgb(136,139,141)'];

function changeHeaderColor(colorMode) {
  let logo = document.querySelector('h1');
  let counter = 0;
  for (let char of 'Guess the Rainbow') {
    let charSpan = document.createElement('span');
    charSpan.innerHTML = char;
    if(char !== ' ') charSpan.style.color = colorMode[counter];
    logo.appendChild(charSpan);
    counter++;
    if(counter === colorMode.length) counter = 0;
  }
}
changeHeaderColor(darkColors);

function toggleColorMode(colorMode) {
  let header = document.querySelector('.navbar');
  let classes = header.classList;
  classes.replace('bg-light', 'bg-dark');
  header.classList = classes;

  let main = document.querySelector('main');
  main.style.background = 'black';

  let label = document.querySelector('label');
  label.style.color = 'white';
}
toggleColorMode(darkColors);

function updateBoardColors(colorMode) {
  let guessBoxes = document.querySelectorAll('.oneColor');
  let colorBoxes = document.querySelectorAll('.colorBox');

  for(let guess of guessBoxes) {
    if(guess.style.background !== 'rgb(255, 255, 255)') {
      
    }
  }
}

function updateUserCorrectCombo() {

}
