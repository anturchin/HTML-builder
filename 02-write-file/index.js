const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'stdin-dump.txt');
const writeStream = fs.createWriteStream(filePath, { flags: 'a' });

console.log('Hello, enter the text');

process.stdin.on('data', (data) => {
  const input = data.toString().trim();
  if (input.toLocaleLowerCase() === 'exit') {
    console.log('Goodbye');
    process.exit();
  }
  writeStream.write(input + '\n');
});
