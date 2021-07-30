const fs = require('fs');
const path = require('path');

const Font = require('fonteditor-core').Font;
const woff2 = require('fonteditor-core').woff2;
const util = require('./util');

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
			util.optimize(woffPath)
				.then(() => {
					resolve(woffPath);
				})
				.catch(reject);
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
					util.optimize(woff2Path)
						.then(() => {
							resolve(woff2Path);
						})
						.catch(reject);
				});
			})
			.catch(reject);
	});
}

module.exports = {
	ttfsToWoff: async function (files, outDir) {
		const woffFiles = [];
		for (let filePath of files) {
			woffFiles.push(await ttfToWoff(filePath, outDir));
		}
		return woffFiles;
	},
	ttfsToWoff2: async function (files, outDir) {
		const woffFiles = [];
		for (let filePath of files) {
			woffFiles.push(await ttfToWoff2(filePath, outDir));
		}
		return woffFiles;
	},
	ttfToWoff,
	ttfToWoff2,
};
