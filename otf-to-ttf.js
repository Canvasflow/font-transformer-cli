const fs = require('fs');
const path = require('path');
const Font = require('fonteditor-core').Font;

async function Otf2Ttf(filepath, outputPath) {
  return new Promise((resolve, reject) => {
    const otfBuffer = fs.readFileSync(filepath);
    const font = Font.create(otfBuffer, {
      type: 'otf'
    });
    
    var ttfBuffer = font.write({
      type: 'woff'
    });
    
    const ttfPath = `${path.basename(filepath, '.otf')}.ttf`;
    fs.writeFile(ttfPath, ttfBuffer, (err) => {
        if(err) {
            reject(err);
            return;
        }

        resolve(ttfPath);
    })
  });
}

Otf2Ttf('BentonSans-Medium.otf', path.join(__dirname, 'Out'))
    .then(file=> console.log(file))
    .catch(err => console.error(err));
