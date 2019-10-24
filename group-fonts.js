const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'Out');

run();

function run() {
  const fonts = getFonts();
  createFontsDir(fonts);
  copyFontsToDir(fonts);
}

function createFontsDir(fonts) {
    for(let font of fonts) {
        const fontPath = path.join(outDir, font);
        if(!fs.existsSync(fontPath)) {
            fs.mkdirSync(fontPath);
        }
    }
}

function copyFontsToDir(fonts) {
    for(let font of fonts) {
        const fontPath = path.join(outDir, font);

        const woffFontPath = path.join(outDir, `${font}.woff`);
        if(fs.existsSync(woffFontPath)) {
            fs.renameSync(woffFontPath, path.join(fontPath, 'webfont.woff'));
        }

        const woff2FontPath = path.join(outDir, `${font}.woff2`);
        if(fs.existsSync(woff2FontPath)) {
            fs.renameSync(woff2FontPath, path.join(fontPath, 'webfont.woff2'));
        }
    }
}

function getFonts() {
  let fontsPaths = fs.readdirSync(outDir);
  const fonts = fontsPaths.filter(font => /(.)+\.(woff|woff2)+/gi.test(font))
    .map(font => font.replace(/\.[^/.]+$/, ''))
    .filter((value, index, self) => self.indexOf(value) === index);

  return fonts
}

module.exports = {
    run: run
};
