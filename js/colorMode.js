'use strict';

const colors = ['rgb(204, 0, 0)', 'rgb(204, 102, 0)', 'rgb(204, 204, 0)',
  'rgb(0, 204, 0)', 'rgb(0, 0, 204)', 'rgb(102, 0, 204)', 'rgb(255, 51, 153)', 'rgb(96, 96, 96)'];

function changeHeaderColor() {
  let logo = document.querySelector('h1');
  let counter = 0;
  for (let char of 'Guess the Rainbow') {
    let charSpan = document.createElement('span');
    charSpan.innerHTML = char;
    if(char !== ' ') charSpan.style.color = colors[counter];
    logo.appendChild(charSpan);
    counter++;
    if(counter === colors.length) counter = 0;
  }
}

changeHeaderColor();
