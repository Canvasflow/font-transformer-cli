const fs = require("fs");
const path = require("path");
const app = require("./app");
const group = require("./group-fonts");
const inDir = path.join(process.env.INDIR) || path.join(__dirname, "In");
const { ttc2ttf } = require("./ttc2ttf.js");

// INDIR=/Users/josejuan2412/Projects/INTEST OUTDIR=/Users/josejuan2412/Projects/OUTTEST  npm run optimize

compile()
  .then(() => console.log("Success"))
  .catch((err) => console.error(err));

async function compile() {
  const ttcFiles = await getFonts("ttc", inDir);
  for (const ttc of ttcFiles) {
    // console.log("PROCESS .TTC FILE BEFORE OPTIMIZE: ", ttc);
    await ttc2ttf(ttc, `${inDir}`);
  }

  const transform = [
    {
      in: "ttf",
      out: "woff2",
    },
    {
      in: "otf",
      out: "woff2",
    },
  ];

  const flag = process.env.OPT_GROUPS;

  for (const item of transform) {
    const inType = item.in;
    const outType = item.out;
    console.log(`Transform '${inType}' files to '${outType}':`);
    console.log(`--------------------------------------------`);
    const outputFiles = await app.run(inType, outType);

    for (let file of outputFiles) {
      console.log(file);
    }
    console.log(`--------------------------------------------`);
  }
  if (!flag) {
    console.log("without flag");
    await group.run();
    return;
  }
  await group.runGroups();
}

async function getFonts(extension, inDir) {
  const inputs = fs.readdirSync(inDir);
  const fonts = [];
  for (const input of inputs) {
    if (fs.lstatSync(path.join(inDir, input)).isDirectory()) {
      const folder = await getFolderFonts(inDir, input);
      fonts.push(...folder);
    } else {
      fonts.push(input);
    }
  }
  return fonts
    .filter((font) => {
      const regexString = `(.)+\.${extension}`;
      return new RegExp(regexString, "gi").test(font);
    })
    .map((font) => `${path.join(inDir, font)}`);
}
