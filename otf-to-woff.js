var Font = require("fonteditor-core").Font;
var fs = require("fs");
var buffer = fs.readFileSync("BentonSans-Medium.otf");
var font = Font.create(buffer, {
  type: 'otf', // support ttf,woff,eot,otf,svg
  inflate: null
});

var buffer = font.write({
  type: 'woff', // support ttf,woff,eot,otf,svg
  deflate: null
});
fs.writeFileSync('BentonSans-Medium.woff', buffer);


console.log(`Succesffuly run`);