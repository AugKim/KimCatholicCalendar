const fs = require('fs');
const file = '/Library/WebServer/Documents/Calendar/Reading/Sunday.js';
let content = fs.readFileSync(file, 'utf8');

// The block for 4070 is: "4070": { ... }
// It ends right before "5010": {
// We will extract it using string manipulation
const startStr = '"4070": {\n';
const endStr = '\n  "5010": {\n';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    let block4070 = content.substring(startIndex, endIndex);
    // Replace "4070": with "4080":
    let block4080 = block4070.replace(/^"4070":/, '"4080":');
    
    // Insert after 4070
    let newContent = content.substring(0, endIndex) + ',\n  ' + block4080 + content.substring(endIndex);
    fs.writeFileSync(file, newContent, 'utf8');
    console.log("Success! Added 4080 block.");
} else {
    console.log("Error: could not find boundaries for 4070 or 5010");
}
