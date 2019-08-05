const fs = require('fs');
const path = require('path');

const Font = require('fonteditor-core').Font;

const ttf2Woff = require('./ttf-to-woff');

async function otf2Ttf(filepath, outDir) {
    return new Promise((resolve, reject) => {
        const otfBuffer = fs.readFileSync(filepath);
        const font = Font.create(otfBuffer, {
            type: 'otf'
        });

        const ttfBuffer = font.write({
            type: 'ttf'
        });

        const ttfPath = path.join(outDir, `${path.basename(filepath, '.otf')}.ttf`);
        fs.writeFile(ttfPath, ttfBuffer, (err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(ttfPath);
        })
    });
}

async function otfToWoff(file, outDir) {
    const ttfFilepath = await otf2Ttf(file, outDir);
    const woffPath = await ttf2Woff.ttfToWoff(ttfFilepath, outDir);
    fs.unlinkSync(ttfFilepath);
    return woffPath;
}

async function otfToWoff2(file, outDir) {
    const ttfFilepath = await otf2Ttf(file, outDir);
    const woff2Path = ttf2Woff.ttfToWoff2(ttfFilepath, outDir);
    fs.unlinkSync(ttfFilepath);
    return woff2Path;
}

module.exports = {
    otfsToWoff: async function (files, outDir) {
        const woffFiles = [];
        for (let filePath of files) {
            woffFiles.push(await otfToWoff(filePath, outDir));
        }
        return woffFiles;
    },
    otfsToWoff2: async function (files, outDir) {
        const woff2Files = [];
        for (let otfFilePath of files) {
            woff2Files.push(await otfToWoff2(otfFilePath, outDir));
        }
        return woff2Files;
    }
};
