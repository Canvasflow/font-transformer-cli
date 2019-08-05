var fs = require('fs');
var path = require('path');
var ttf2woff2 = require('ttf2woff2');
var ttf2woff = require('ttf2woff');

const inDir = path.join(__dirname, 'In');
const outDir = path.join(__dirname, 'Out');

const inType = process.env.IN_TYPE;
const outType = process.env.OUT_TYPE;

function run() {
    console.log(`In type: ${inType}`);
    console.log(`Out type: ${outType}`);
}

// readFonts();

function readFonts() {
    const inDir = path.join(__dirname, 'In');
    const inputs = fs.readdirSync(inDir);
    const fonts = inputs
        .filter(font => /(.)+\.ttf/gi.test(font))
        .map(font => font.replace('.ttf',''));

    for(let font of fonts) {
        createFontFolder(font);
    }
}

function createFontFolder(fontName) {
    const fontNamePath = path.join(__dirname, 'In', `${fontName}.ttf`);
    const outDir = path.join(__dirname, 'Out', fontName);
    if (!fs.existsSync(outDir)){
        fs.mkdirSync(outDir);
    }

    var input = fs.readFileSync(fontNamePath);

    createWoff(outDir, fontName, input);
    createWoff2(outDir, fontName, input);
}

function createWoff(fontPath, name, input) {
    const woffPath = path.join(fontPath, `webfont.woff`);
    
    fs.writeFileSync(woffPath, ttf2woff(input).buffer);
}

function createWoff2(fontPath, name, input) {
    const woff2Path = path.join(fontPath, `webfont.woff2`);

    fs.writeFileSync(woff2Path, ttf2woff2(input));
}

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