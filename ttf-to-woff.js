
const fs = require('fs');
const path = require('path');

const ttf2woff2 = require('ttf2woff2');
const ttf2woff = require('ttf2woff');

async function ttfToWoff(file, outDir) {
    const ttfBuffer = fs.readFileSync(file);
    const woffPath = path.join(outDir, `${path.basename(file).replace('.ttf', '')}.woff`);
    fs.writeFileSync(woffPath, ttf2woff(ttfBuffer).buffer);
    return woffPath
}

async function ttfToWoff2(file, outDir) {
    const ttfBuffer = fs.readFileSync(file);
    const woff2Path = path.join(outDir, `${path.basename(file).replace('.ttf', '')}.woff2`);
    fs.writeFileSync(woff2Path, ttf2woff2(ttfBuffer));
    return woff2Path;
}

module.exports = {
    ttfsToWoff: async function(files, outDir) {
        const woffFiles = [];
        for(let filePath of files) {
            woffFiles.push(await ttfToWoff(filePath, outDir));
        }
        return woffFiles;
    },
    ttfsToWoff2: async function(files, outDir) {
        const woffFiles = [];
        for(let filePath of files) {
            woffFiles.push(await ttfToWoff2(filePath, outDir));
        }
        return woffFiles;
    },
    ttfToWoff: ttfToWoff,
    ttfToWoff2: ttfToWoff2
};
