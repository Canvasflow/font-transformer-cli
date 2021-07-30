const fs = require('fs');
const path = require('path');
const { optimize } = require('../util');
describe.skip('Utils', () => {
    const fontName = 'NoeText-Bold';
	const woffPath = path.join(__dirname, '..', 'In', `${fontName}.woff2`);
	it('Transform oft to woff', () => {
		expect(fs.existsSync(woffPath)).toBe(true);
		return optimize(woffPath).then((woffPath) => {
			expect(fs.existsSync(woffPath)).toBe(true);
			
		});
	});
});
