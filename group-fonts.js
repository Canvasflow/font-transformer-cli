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
	for (let font of fonts) {
		const fontPath = path.join(outDir, font);
		if (!fs.existsSync(fontPath)) {
			fs.mkdirSync(fontPath);
		}
	}
}

function copyFontsToDir(fonts) {
	const fontTypes = ['woff', 'woff2', 'ttf', 'otf'];
	for (let font of fonts) {
		const baseFontPath = path.join(outDir, font);
		for (const type of fontTypes) {
			const fontPath = path.join(outDir, `${font}.${type}`);
			if (fs.existsSync(fontPath)) {
				switch (type) {
					case 'otf':
					case 'ttf':
						fs.renameSync(
							fontPath,
							path.join(baseFontPath, `${font}.${type}`)
						);
						break;
					default:
						fs.renameSync(
							fontPath,
							path.join(baseFontPath, `webfont.${type}`)
						);
						break;
				}
			}
		}
	}
}

function getFonts() {
	let fontsPaths = fs.readdirSync(outDir);
	const fonts = fontsPaths
		.filter((font) => /(.)+\.(woff|woff2)+/gi.test(font))
		.map((font) => font.replace(/\.[^/.]+$/, ''))
		.filter((value, index, self) => self.indexOf(value) === index);

	return fonts;
}

module.exports = {
	run: run,
};
