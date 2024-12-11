const fs = require("fs");
const path = require("path");
const app = require("./app");
const group = require("./group-fonts");
let inDir = path.join(__dirname, "In");
let outDir = path.join(__dirname, "Out");

const { ttc2ttf } = require("./ttc2ttf.js");

// INDIR=/path/to/in OUTDIR=/path/to/out npm run optimize

compile()
  .then(() => console.log("Success"))
  .catch((err) => console.error(err));

async function compile() {
  if (process.env.INDIR) {
    inDir = path.join(process.env.INDIR);
  }
  if (process.env.OUTDIR) {
    outDir = path.join(process.env.OUTDIR);
  }

  if (
    process.argv.length &&
    (process.argv[3] === "--cleanup" || process.argv[2] === "--cleanup")
  ) {
    console.log("cleaning up out folder");
    emptyDir(outDir);
  }

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

async function emptyDir(dirPath) {
  const dirContents = fs.readdirSync(dirPath);
  for (const fileOrDirPath of dirContents) {
    try {
      const fullPath = path.join(dirPath, fileOrDirPath);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (fs.readdirSync(fullPath).length) await emptyDir(fullPath);
        fs.rmdirSync(fullPath);
      } else fs.unlinkSync(fullPath);
    } catch (ex) {
      console.error(ex.message);
    }
  }
}
