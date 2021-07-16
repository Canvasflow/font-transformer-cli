const fs = require('fs');
const path = require('path');
const { otfToWoff, otfToWoff2, otfToTtf } = require('../otf-to');
describe('Transform otf fonts', () => {
	const fontName = 'ArialMTStd-Light';
	const otfPath = path.join(__dirname, '..', 'In', `${fontName}.otf`);
	const outDir = path.join(__dirname, '..', 'Out');

	it('Transform oft to woff', () => {
		const targetWoffPath = path.join(outDir, `${fontName}.woff`);

		expect(fs.existsSync(otfPath)).toBe(true);
		return otfToWoff(otfPath, outDir).then((woffPath) => {
			expect(targetWoffPath).toBe(woffPath);
			expect(fs.existsSync(woffPath)).toBe(true);
		});
	});
    it('Transform oft to woff2', () => {
		const targetWoff2Path = path.join(outDir, `${fontName}.woff2`);

		expect(fs.existsSync(otfPath)).toBe(true);
		return otfToWoff2(otfPath, outDir).then((woff2Path) => {
			expect(targetWoff2Path).toBe(woff2Path);
			expect(fs.existsSync(woff2Path)).toBe(true);
		});
	});

	it('Transform oft to ttf', () => {
		const targetTtfPath = path.join(outDir, `${fontName}.ttf`);

		expect(fs.existsSync(otfPath)).toBe(true);
		return otfToTtf(otfPath, outDir).then((ttfPath) => {
			expect(targetTtfPath).toBe(ttfPath);
			expect(fs.existsSync(ttfPath)).toBe(true);
		});
	});
});
