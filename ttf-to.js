
const fs = require('fs');
const path = require('path');

const Font = require('fonteditor-core').Font;
const woff2 = require('fonteditor-core').woff2;

async function ttfToWoff(file, outDir) {
    return new Promise((resolve, reject) => {
		const otfBuffer = fs.readFileSync(file);
		const font = Font.create(otfBuffer, {
			type: 'ttf',
		});

		const woffBuffer = font.write({
			type: 'woff',
			hinting: true,
			deflate: null,
			support: { head: {}, hhea: {} },
		});

		const woffPath = path.join(
			outDir,
			`${path.basename(file, '.ttf')}.woff`
		);
		fs.writeFile(woffPath, woffBuffer, (err) => {
			if (err) {
				reject(err);
				return;
			}
			fs.copyFileSync(file, woffPath);
			resolve(woffPath);
		});
	});
}

async function ttfToWoff2(file, outDir) {
    return new Promise((resolve, reject) => {
		woff2
			.init()
			.then(() => {
				const otfBuffer = fs.readFileSync(file);
				const font = Font.create(otfBuffer, {
					type: 'ttf',
				});

				const woffBuffer = font.write({
					type: 'woff2',
					hinting: true,
					deflate: null,
					support: { head: {}, hhea: {} },
				});

				const woff2Path = path.join(
					outDir,
					`${path.basename(file, '.ttf')}.woff2`
				);
				fs.writeFile(woff2Path, woffBuffer, (err) => {
					if (err) {
						reject(err);
						return;
					}
					fs.copyFileSync(file, woff2Path);
					resolve(woff2Path);
				});
			})
			.catch(reject);
	});
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
    ttfToWoff,
    ttfToWoff2
};
