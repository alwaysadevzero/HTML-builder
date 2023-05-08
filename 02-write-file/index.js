const readline = require('readline');
const path = require('path');
const fs = require('fs');
const {
  stdin: input,
  stdout: output,
} = require('process');


const OUTPUT_FILE = 'output.txt';
const GREETINGS = 'Node REPL \n\nfor exit program press crtl+D :';
const GOODBYE = 'exit program with code: ';


const outputFile = path.resolve(__dirname, OUTPUT_FILE);
const fileWrite = fs.createWriteStream(outputFile, 'utf-8');

const rl = readline.createInterface({ input, output });


console.log(GREETINGS);

rl.on('line', line => { 
  if ( line === 'exit') process.exit();
  fileWrite.write(line + '\n' );
});


process.on('exit', code => {
  fileWrite.close(); rl.close();
  console.log(GOODBYE, code);
});