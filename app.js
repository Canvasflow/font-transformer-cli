var fs = require('fs');
var path = require('path');
var ttf2woff2 = require('ttf2woff2');
var ttf2woff = require('ttf2woff');

readFonts();

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
    const woffPath = path.join(fontPath, `${name}.woff`);
    
    fs.writeFileSync(woffPath, ttf2woff(input).buffer);
}

function createWoff2(fontPath, name, input) {
    const woff2Path = path.join(fontPath, `${name}.woff2`);

    fs.writeFileSync(woff2Path, ttf2woff2(input));
}