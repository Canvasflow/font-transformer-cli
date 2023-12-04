const fs = require("fs");
const path = require("path");

const Font = require("fonteditor-core").Font;

const ttf2Woff = require("./ttf-to");
const otf2Woff = require("./otf-to");

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
  const inDir = path.join(__dirname, "In");
  const outDir = path.join(__dirname, "Out");

  const inputFonts = await getPostcripNames(getFonts(inType, inDir));
  let outputFiles = [];
  if (inType === "otf" && outType === "woff") {
    outputFiles = await otf2Woff.otfsToWoff(inputFonts, outDir);
  } else if (inType === "otf" && outType === "woff2") {
    outputFiles = await otf2Woff.otfsToWoff2(inputFonts, outDir);
  } else if (inType === "ttf" && outType === "woff") {
    outputFiles = await ttf2Woff.ttfsToWoff(inputFonts, outDir);
  } else if (inType === "ttf" && outType === "woff2") {
    outputFiles = await ttf2Woff.ttfsToWoff2(inputFonts, outDir);
  }

  for (const font of inputFonts) {
    fs.copyFileSync(font, path.join(outDir, path.basename(font)));
  }

  return outputFiles;
}

function getFonts(extension, inDir) {
  const inputs = fs.readdirSync(inDir);
  const fonts = [];
  for (const input of inputs) {
    if (fs.lstatSync(`${inDir}/${input}`).isDirectory()) {
      fonts.push(...getFolderFonts(inDir, input));
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

function getFolderFonts(path, folder) {
  const inputs = fs.readdirSync(`${path}/${folder}`);
  const fonts = [];
  for (const input of inputs) {
    if (fs.lstatSync(`${path}/${folder}/${input}`).isDirectory()) {
      fonts.push(...getFolderFonts(path, `${folder}/${input}`));
    } else {
      fonts.push(`/${folder}/${input}`);
    }
  }
  return fonts;
}

async function getPostcripNames(inputFiles) {
  for (let index = 0; index < inputFiles.length; index++) {
    let file = inputFiles[index];
    file = file.toLowerCase();
    const font = fs.readFileSync(file);
    const filename = path.parse(file).name;
    const extension = file.split(".").pop();
    console.log("opening file: ", file);
    const fontInfo = getFont(font, extension);
    const postcript = fontInfo.name.postScriptName;
    const newFile = `${path.dirname(file)}/${postcript}.${extension}`;
    if (postcript !== filename) {
      await fs.rename(file, newFile, () => {
        console.log("NEW FILE: ", newFile);
      });
      inputFiles[index] = newFile;
    }
  }
  return inputFiles;
}

function getFont(font, extension) {
  return Font.create(font, {
    type: extension,
    subset: [65, 66],
    hinting: true,
    compound2simple: true,
    inflate: null,
    combinePath: false,
  }).get();
}
module.exports = {
  run: run,
};
