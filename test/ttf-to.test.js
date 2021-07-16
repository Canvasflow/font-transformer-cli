const fs = require('fs');
const path = require('path');
const { ttfToWoff, ttfToWoff2 } = require('../ttf-to');
describe('Transform ttf fonts', () => {
	const fontName = 'BarlowCondensed-Medium';
	const otfPath = path.join(__dirname, '..', 'In', `${fontName}.ttf`);
	const outDir = path.join(__dirname, '..', 'Out');

	it('Transform ttf to woff', () => {
		const targetWoffPath = path.join(outDir, `${fontName}.woff`);

		expect(fs.existsSync(otfPath)).toBe(true);
		return ttfToWoff(otfPath, outDir).then((woffPath) => {
			expect(targetWoffPath).toBe(woffPath);
			expect(fs.existsSync(woffPath)).toBe(true);
		});
	});
	it('Transform ttf to woff2', () => {
		const targetWoff2Path = path.join(outDir, `${fontName}.woff2`);

		expect(fs.existsSync(otfPath)).toBe(true);
		return ttfToWoff2(otfPath, outDir).then((woff2Path) => {
			expect(targetWoff2Path).toBe(woff2Path);
			expect(fs.existsSync(woff2Path)).toBe(true);
		});
	});
});
