const app = require('./app');
const group = require('./group-fonts');

compile()
    .then(()=> console.log('Success'))
    .catch(err => console.error(err));

async function compile() {
    const transform = [
        {
            in: 'ttf',
            out: 'woff2'
        },
        {
            in: 'otf',
            out: 'woff2'
        }
    ];

    for(const item of transform) {
        const inType = item.in;
        const outType = item.out;

        const outputFiles = await app.run(inType, outType);
        console.log(`Transform '${inType}' files to '${outType}':`);
        console.log(`--------------------------------------------`);
        for (let file of outputFiles) {
            console.log(file);
        }
        console.log(`--------------------------------------------`);
    }

    await group.run()
}