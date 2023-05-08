const fs = require('fs');
const path = require('path');

const INPUT_FILE = 'text.txt';

const file = path.resolve(__dirname, INPUT_FILE);
const fileRead = fs.createReadStream(file, 'utf-8');

fileRead.on('data', chunk => console.log(chunk));