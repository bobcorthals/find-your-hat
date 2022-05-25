const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

// add chars for tracing previous steps of pathChar
const arrowUp = '↑';
const arrowDown = '↓';
const arrowRight = '→';
const arrowLeft = '←';

class Field {
  constructor(field) {
    this.field = field;
    this.positionX = 0;
    this.positionY = 0;

    // user will always start at (0, 0)
    this.currentPosition = [0, 0];
    
    // counter to keep track of moves
    this.counter = 0;
  }

  runGame() {
    // track status game for while loop
    let gameRunning = true;

    while (gameRunning) {

      // initialize (this.counter === 0) or update (this.counter > 0) field
      console.clear();
      this.print();

      // ask directions
      this.askDirections();

      // add move to counter
      this.counter += 1;

      // check implications move
      if (this.outOfBounds()) {
          // log failure, print last field, show coordinates where user movesd outside the field
          console.clear();
          this.print();
          console.log(`Oh no! You moved outside the field at (${this.positionX}, ${this.positionY})! Better luck next time.`);

          // end game
          gameRunning = false;
          
          // push result info to Score.score
          return { type: 'out-of-bounds', counter: this.counter, dimensions: [this.field[0].length, this.field.length] };
      } else if (this.fell()) {
          // log failure, print last field, show coordinates where user entered the hole
          console.clear();
          this.print();
          console.log(`You fell into a hole at (${this.positionX}, ${this.positionY})! That's game over, I'm afraid.`)

          // end game
          gameRunning = false;

          // push result info to Score.score
          return { type: 'hole', counter: this.counter, dimensions: [this.field[0].length, this.field.length]};
      } else if (this.found()) {
         // log success, print last field, include counter moves
          console.clear();
          this.print();
          console.log(`Hurray. You found your hat in ${this.counter} ${this.counter > 1? 'moves':'move'}! Call all your friends to celebrate!`);
          
          // end game
          gameRunning = false;
          
          // push result info to Score.score
          return { type: 'success', counter: this.counter, dimensions: [this.field[0].length, this.field.length] };
      }

      // regular move: simply continue and set pathChar to new pos
      gameRunning = true;
      this.field[this.positionY][this.positionX] = pathCharacter;
      
    }      
  }

  // ask user for directions
  askDirections() {
    
    // !imp: set response to lower case
    const answer = prompt('Where to, my friend? (U)p, (D)own, (L)eft, (R)ight, or (Q)uit ').toLowerCase();
    
    // eval response
    switch (answer) {

      // for case ['u', 'd', 'l', 'r'] retrieve previous position pathChar and turn into appropriate arrow char, then update posX/Y for pathChar
      case 'u':
        this.position = [this.positionX, this.positionY];
        this.field[this.positionY][this.positionX] = arrowUp;
        this.positionY -= 1;
        break;
      case 'd' :
        this.position = [this.positionX, this.positionY];
        this.field[this.positionY][this.positionX] = arrowDown;
        this.positionY += 1;
        break;
      case 'l' :
        this.position = [this.positionX, this.positionY];
        this.field[this.positionY][this.positionX] = arrowLeft;
        this.positionX -= 1;
        break;
      case 'r' :
        this.position = [this.positionX, this.positionY];
        this.field[this.positionY][this.positionX] = arrowRight;
        this.positionX += 1;
        break;

      // user wants to quit
      case 'q' :
        // exit interaction and print results
        console.log('See you next time!');

        // get results
        showResults(myScore);
        return process.exit();

      default:
        // failed to capture case; ask for directions again
        console.log('Invalid input. Please try again');
        return this.askDirections();
    }
  }

  // checks for implication move pathChar

  outOfBounds() {
    // if posX/Y === -1 or === length respective axis, then out of bounds: return True
    return ((this.positionX === -1 || this.positionX === this.field[0].length) || (this.positionY === -1 || this.positionY === this.field.length));
  }
  
  found() {
    // true if new location contains 'hat'
    return this.field[this.positionY][this.positionX] === hat;
  }

  fell() {
    // true if new location contains 'hole'
    return this.field[this.positionY][this.positionX] === hole;
  }

  // used to print field to user
  print() {
    const display = 
      `${this.counter > 0? `Move processed: \n`:`Best of luck to you! Here's your field: \n`}` + 
      '\n\t\t' + this.field.map((item) => item.join(' ')).join('\n\t\t') + '\n';
    console.log(display);
  }

  // generate field for user
  static generateField = (y, x, holes) => {

    // y = length of y-axis, x = length of x-axis, holes = int holes to include

    // set up array with only fieldChars
    let newField = Array(y).fill().map(() => Array(x).fill(fieldCharacter));

    // helperFunction to create random coordinates for 'holes' and 'hat'
    const randomize = (y, x) => {
      // genereate rand int (0 - x/y-length-1)
      const positionY = Math.floor(Math.random()*y);
      const positionX = Math.floor(Math.random()*x);
      return { positionY: positionY, positionX: positionX};
    }
  
    // user always starts at (0, 0)
    newField[0][0] = pathCharacter;

    // increment holes by 1 to include 'hat' for last iteration
    for (let _ = 0; _ < holes + 1; _++) {
  
      // variable used as condition for while loop 
      let result = 0;
      let positionY, positionX;
  
      while (result === 0) {
  
        // destructuring return randomizer
        ({ positionY , positionX } = randomize(y, x));
  
        // check if random coordinates contain a fieldCharacter
        // i.e. try again, if coordinates already contain a 'hole' or 'user' (0, 0)
        if (newField[positionY][positionX] === fieldCharacter) {
  
          // assign a 'hole' for all iterations except the last
          if (_ < holes) {
            newField[positionY][positionX] = hole;
          }
          // assign the 'hat' on the last iteration
          if (_ === holes) {
            newField[positionY][positionX] = hat;
          }
          
          // exit while loop and move on to next iteration of _
          result +=1;
        }
      }
    }

    // newField successfully populated, return
    return newField;

  }

}

// class for keeping scores user
class Score {
  constructor() {
    // array with obj per game, like: { type: str, counter: int, dimensions: [ int (X-axis), int (Y-axis) ] }
    this.score = [];
     // array with starttime per game
     this.start = [];
    // array with endtime per game
     this.end = [];
  }

  // getters & setters for score, start & end
  get score() {
     return this._score;
  }

  set score(newScore) {
    this._score = newScore;
  }

  get start() {
    return this._start;
  }

  set start(newStart) {
    this._start = newStart;
  }

  get end() {
    return this._end;
  }

  set end(newEnd) {
  this._end = newEnd;
  }
}

// prompt at start
const startGame = () => {
  
  // !imp: set response to lower case
  const answer = prompt(`Want to start a game? (Y)es, (N)o `).toLowerCase();

  // eval response
  switch (answer) {
    case 'y':
      // clear console, if 'yes', and ask user for input for x, y
      console.clear();
      console.log(`Great! Let's build a field together:`);

      // generate example Fields and questions about dimensions
      return getParams();
    case 'n':
      // exit interaction and print results
      console.log(`Suit yourself! Maybe next time!`);
      showResults(myScore);
      return process.exit();
    default:
      // inval input; restart function
      console.log(`What's that? Can't hear you properly...`);
      return startGame();
  }
}

// range(4,11) to check if coordinates from input are in bounds: min axis length === 4, max === 10
// !imp: inputs will be strings, hence 'map(String)'
const arr = [...Array(11).keys()].slice(4).map(String);

// helperFunctionPrompt, get input for length x-axis
const processInputX = () => {

  // example field to let user know what input we want
  const exampleX = [
    [ '░', '░', '░', '░' ],
    [ '░', '░', '░', '░' ],
    [ '░', '░', '░', '░' ],
    [ '░', '░', '░', '░' ],
    [ ' ', ' ', '→', 'x' ]
  ];

  // prompt for width
  const promptX = () => {
    // !imp: set resonpse to lower case (for 'Q')
    return prompt(`First, let's determine the width of the field. Min: 4, max: 10, or (Q)uit: `).toLowerCase();
  }

  // print example to help the user understand what input to provide
  console.log(printDisplay(exampleX));

  // assign input
  let answerX = promptX();
  let x;

  // eval input
  switch (true) {

    // input should be within array defined above
    case arr.includes(answerX):
      // !imp: input will be String, so convert to Number
      x = parseInt(answerX);
      console.clear();
      console.log(`Awesome! Let's have a look at the other dimension:`);
      return x;
    case answerX === 'q':
      // exit interaction and print results
      console.log(`Leaving already? What a shame. Well, maybe we'll meet another time! `);
      showResults(myScore);
      return process.exit();
    default:
      // incorrect input, repeat prompt
      console.clear();
      console.log(`That's impossible, I'm afraid. Please try again... `);
      return processInputX();
  }
}

// helperFunctionPrompt, get input for y
const processInputY = () => {

  // similar to processInputX with minor variations (e.g. adjusted example, adjusted logs)

  const exampleY = [
    [ 'y ↑', '░', '░', '░', '░' ],
    [ '   ', '░', '░', '░', '░' ],
    [ '   ', '░', '░', '░', '░' ],
    [ '   ', '░', '░', '░', '░' ],
  ];

  const promptY = () => {
    return prompt('Can we get a value for the length as well? Min: 4, max: 10, or (Q)uit): ').toLowerCase();
  }

  console.log(printDisplay(exampleY));

  const answerY = promptY();
  let y;

  switch (true) {
    case arr.includes(answerY):
      y = parseInt(answerY);
      return y;
    case answerY === 'q':
      // exit interaction and print results
      console.log(`Leaving already? What a shame. Well, maybe we'll meet another time! `);
      showResults(myScore);
      return process.exit();
    default:
      console.clear();
      console.log(`That's impossible, I'm afraid. Please try again... `);
      return processInputY();
  }
}

// helperFunction to display examples x, y 
const printDisplay = (example) => { 
  const display = '\n\t\t' + example.map((item) => item.join(' ')).join('\n\t\t') + '\n';
  return display;
}

// prompt new game, basic variation on startGame()
const tryAgain = () => {

  // !imp: set response to lower case
  const answer = prompt('Do you want to try your luck again? Y(es)/N(o): ').toLowerCase();

  // eval input
  switch (answer) {
    case 'y':
      console.clear();
      console.log(`Excellent. Great to have you back! Let's build another field together: `);
      // generate example Fields and questions about dimensions
      return getParams();
    case 'n':
      // exit interaction and print results
      console.clear();
      console.log(`Sorry to see you go! Before you do, check out your results! `);
      showResults(myScore);
      return process.exit();
    default:
      // invalid input
      console.log(`You seem to be talking in riddles, my friend!`)
      return tryAgain();
  }
}

// get params from user
const getParams = () => {
  
  // get value for x from user
  const x = processInputX();

  // get value for y from user
  const y = processInputY();

  // calculate amount of holes for field based on dimensions and factor (1/9 used, round up)
  const hole = Math.ceil( x * y * (1/9));
  console.clear();
  console.log(`Brilliant! Setting up a field for you with some ${hole} holes!`);

  // enter countdown and pipe through params for field, last param is used for counting down (e.g. 3 seconds)
  return countDownConstructor(y, x, hole, 3);
}

// input countdown
const countDownInput = (val) => {
  // proceed with simple count
  console.log(`\t\t\t${val}`);
  return;
}

// mock countdown
const countDownConstructor = (y, x, hole, count) => {
  console.log('\nStarting in...');
  for (let i = count; i > 0; i--) {
    setTimeout(countDownInput, (count-i)*1000, i);
  }
  // the actual callback function
  setTimeout(makeNewField, (count)*1000, { y: y, x: x, hole: hole}); // pipe through params
  return;
}

// create new instance of Field with params provided by user
const makeNewField = ((val) => {

  // destructuring obj received from countDownConstructor
  const { y, x, hole } = val;

  // create new instance
  const myField = new Field(Field.generateField(y, x, hole));

  // push starttime of game
  myScore.start.push(Date.now());

  // start the actual game, and capture return
    // expect return like: { type: 'out-of-bounds', counter: this.counter, dimensions: [this.field[0].length, this.field.length] } 
  const resultGame = myField.runGame();

  // once finished, push endtime of game
  myScore.end.push(Date.now());

  // push result of game
  myScore.score.push(resultGame);

  // suggest another game
  return tryAgain();
})

const showResults = (myScore) => {

  // create obj to store results
  const results = { outOfBounds: 0, hole: 0, success: 0, dimensions: [], counter: [], seconds: []};
  let difference_ms;

  // loop through score info, and assign results to respective groups
    // for wins, also push time (converted to seconds) and dimensions of field
  for (let i = 0; i < myScore.score.length; i++) {

    // specified cases refer to result of game
    switch (myScore.score[i].type) {
      case 'out-of-bounds':
        results.outOfBounds +=1;
        break;
      case 'hole':
        results.hole +=1;
        break;
      case 'success':
        results.success +=1;

        // push amount of moves per win
        results.counter.push(myScore.score[i].counter);

        // push dimension string for the field, like '(x, y)'
        results.dimensions.push(`(${myScore.score[i].dimensions[0]}, ${myScore.score[i].dimensions[1]})`);

        // calc difference between endtime and starttime, convert to seconds and push
        difference_ms = myScore.end[i]-myScore.start[i];
        results.seconds.push(Math.round( difference_ms / 100 ) / 10 );
        break;
    }
  }

  // string for general results
  const stringResults = [
    `\n##########################\n`,
    `Games played: ${myScore.score.length}`,
    `- Moved out of bounds: ${results.outOfBounds}`,
    `- Fell in a hole: ${results.hole}`,
    `- Found your hat: ${results.success}`,
  ].join('\n');

  // create strings for each win
  const stringCounter = results.counter.map((item, index) => {
    return `  - Win ${index+1} (field: ${results.dimensions[index]}): ${item} ${item > 1? 'moves':'move'} in ${results.seconds[index]} seconds`;
  }).join('\n');

  // log results
  if (stringCounter.length > 0) {
    console.log(stringResults + '\n' + stringCounter + '\n\n##########################\n');
  } else {
    console.log(stringResults + '\n\n##########################\n');
  }
}

// start interaction with user
  // create a Score instance
const myScore = new Score();
startGame(); // call prompt