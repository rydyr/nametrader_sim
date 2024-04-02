import fs from 'fs';
import path from 'path';

// Directory containing the JavaScript files
const directoryPath = './game';

// Output file path
const outputFile = './combined.js';

// Files to ignore
const ignore = ['stats.js','eventMessages.js','floorPrices.js','npcNames.js'];

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }

  let combinedContent = '';

  files.forEach(function (file) {
    // Only process JavaScript files
    if (path.extname(file) === '.js' && !ignore.includes(file)) {
      const content = fs.readFileSync(path.join(directoryPath, file), 'utf8');
      combinedContent += `// ${file}\n${content}\n\n`;
    }
  });

  // Write the combined content to the output file
  fs.writeFileSync(outputFile, combinedContent);
  console.log('Files were successfully combined!');
});
