const fs = require('fs');
const path = require('path');

const ttf2Woff = require('./ttf-to');
const otf2Woff = require('./otf-to');

const inType = process.env.IN_TYPE;
const outType = process.env.OUT_TYPE;

run(inType, outType)
	.then((outputFiles) => {
		if (!!inType && !!outType) {
			console.log(`Transform '${inType}' files to '${outType}':`);
			console.log(`--------------------------------------------`);
			for (let file of outputFiles) {
				console.log(file);
			}
			console.log(`--------------------------------------------`);
		}
	})
	.catch((err) => console.error(err));

async function run(inType, outType) {
	if (!inType || !outType) {
		return;
	}
	const inDir = path.join(__dirname, 'In');
	const outDir = path.join(__dirname, 'Out');

	const inputFonts = await getPostcripNames(getFonts(inType, inDir));
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

	for(const font of inputFonts) {
		fs.copyFileSync(font, path.join(outDir, path.basename(font)));
	}

	return outputFiles;
}

function getFonts(extension, inDir) {
	const inputs = fs.readdirSync(inDir);

	return inputs
		.filter((font) => {
			const regexString = `(.)+\.${extension}`;
			return new RegExp(regexString, 'gi').test(font);
		})
		.map((font) => `${path.join(inDir, font)}`);
}

// TODO Implement postcript transformation
async function getPostcripNames(inputFiles) {
	return inputFiles;
}

module.exports = {
	run: run,
};
