var fs = require('fs');
var path = require('path');

const ttf2Woff = require('./ttf-to-woff');
const otf2Woff = require('./otf-to-woff');

const inDir = path.join(__dirname, 'In');
const outDir = path.join(__dirname, 'Out');

const inType = process.env.IN_TYPE;
const outType = process.env.OUT_TYPE;

run()
    .then((outputFiles) => {
        console.log(`Transform '${inType}' files to '${outType}':`);
        console.log(`--------------------------------------------`);
        for (let file of outputFiles) {
            console.log(file);
        }
        console.log(`--------------------------------------------`);
    })
    .catch(err => console.error(err));

async function run() {
    const inputFonts = getFonts(inType);
    let outputFiles = [];
    if (inType === 'otf' && outType === 'woff') {
        outputFiles = await otf2Woff.otfsToWoff(inputFonts, outDir);
    } else if (inType === 'otf' && outType === 'woff2') {

        outputFiles = await otf2Woff.otfsToWoff2(inputFonts, outDir);
    } else if (inType === 'ttf' && outType === 'woff') {
        outputFiles = await ttf2Woff.ttfsToWoff(inputFonts, outDir);
    } else if (inType === 'ttf' && outType === 'woff2') {
        outputFiles = await ttf2Woff.ttfsToWoff2(inputFonts, outDir);
    }

    return outputFiles;
}

function getFonts(extension) {
    const inputs = fs.readdirSync(inDir);

    return inputs.filter(font => {
        const regexString = `(.)+\.${extension}`;
        return new RegExp(regexString, 'gi').test(font)
    }).map(font => `${path.join(inDir, font)}`);
}
