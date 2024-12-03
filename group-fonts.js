const fs = require("fs");
const path = require("path");

let inDir = path.join(__dirname, "In");
let outDir = path.join(__dirname, "Out");

function run() {
  if (process.env.INDIR) {
    inDir = path.join(process.env.INDIR);
  }
  if (process.env.OUTDIR) {
    outDir = path.join(process.env.OUTDIR);
  }
  const fonts = getFonts(outDir);
  createFontsDir(fonts, outDir);
  copyFontsToDir(fonts, outDir);
}

function runGroups() {
  const folders = getFolders(inDir);
  for (const folder of folders) {
    const fonts = getFonts(path.join(outDir, folder));
    createFontsDir(fonts, path.join(outDir, folder));
    copyFontsToDir(fonts, path.join(outDir, folder));
  }
}

function createFontsDir(fonts, destination) {
  for (let font of fonts) {
    const fontPath = path.join(destination, font);
    if (!fs.existsSync(fontPath)) {
      fs.mkdirSync(fontPath);
    }
  }
}

function copyFontsToDir(fonts, destination) {
  const fontTypes = ["woff", "woff2", "ttf", "otf"];
  for (let font of fonts) {
    const baseFontPath = path.join(destination, font);
    for (const type of fontTypes) {
      const fontPath = path.join(destination, `${font}.${type}`);
      if (fs.existsSync(fontPath)) {
        switch (type) {
          case "otf":
          case "ttf":
            fs.renameSync(fontPath, path.join(baseFontPath, `${font}.${type}`));
            break;
          default:
            console.log(fontPath);
            fs.renameSync(fontPath, path.join(baseFontPath, `webfont.${type}`));
            break;
        }
      }
    }
  }
}

function getFonts(folder) {
  let fontsPaths = fs.readdirSync(folder);
  const fonts = fontsPaths
    .filter((font) => /(.)+\.(woff|woff2)+/gi.test(font))
    .map((font) => font.replace(/\.[^/.]+$/, ""))
    .filter((value, index, self) => self.indexOf(value) === index);

  return fonts;
}

function getFolders(inDir) {
  const folders = fs
    .readdirSync(inDir)
    .filter((file) => fs.lstatSync(path.join(inDir, file)).isDirectory());
  return folders;
}

module.exports = {
  run: run,
  runGroups: runGroups,
};
