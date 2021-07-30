const fs = require('fs');
const path = require('path');

const Font = require('fonteditor-core').Font;
const woff2 = require('fonteditor-core').woff2;

const util = require('./util');

async function otfToTtf(filepath, outDir) {
	return new Promise((resolve, reject) => {
		const otfBuffer = fs.readFileSync(filepath);
		const font = Font.create(otfBuffer, {
			type: 'otf',
		});

		const ttfBuffer = font.write({
			type: 'ttf',
		});

		const ttfPath = path.join(
			outDir,
			`${path.basename(filepath, '.otf')}.ttf`
		);
		fs.writeFile(ttfPath, ttfBuffer, (err) => {
			if (err) {
				reject(err);
				return;
			}
			fs.copyFileSync(filepath, ttfPath);
			resolve(ttfPath);
		});
	});
}

async function otfToWoff(file, outDir) {
	return new Promise((resolve, reject) => {
		const otfBuffer = fs.readFileSync(file);
		const font = Font.create(otfBuffer, {
			type: 'otf',
		});

		const woffBuffer = font.write({
			type: 'woff',
			hinting: true,
			deflate: null,
		});

		font.optimize();

		let woffPath = path.join(outDir, `${path.basename(file, '.otf')}.woff`);

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

async function otfToWoff2(file, outDir) {
	return new Promise((resolve, reject) => {
		woff2
			.init()
			.then(() => {
				const otfBuffer = fs.readFileSync(file);
				const font = Font.create(otfBuffer, {
					type: 'otf',
					compound2simple: true,
				});

				font.optimize();
				font.compound2simple();

				// sort glyf
				font.sort();

				const woffBuffer = font.write({
					type: 'woff2',
					hinting: true,
					deflate: null,
				});

				const woff2Path = path.join(
					outDir,
					`${path.basename(file, '.otf')}.woff2`
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
	},
	otfToWoff,
	otfToWoff2,
	otfToTtf,
};
