const fs = require("fs");
const path = require("path");

const Font = require("fonteditor-core").Font;

const ttf2Woff = require("./ttf-to");
const otf2Woff = require("./otf-to");

const inType = process.env.IN_TYPE;
const outType = process.env.OUT_TYPE;
const flag = process.env.OPT_GROUPS;

const VALID_EXTENSIONS = new Set(["ttf", "otf"]);

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

  const params = {
    inDir,
    outDir,
    outType,
    inType,
  };

  if (flag) {
    return await fontsByPublication(params);
  }

  const fonts = await processFonts(params);
  cleanupFolder(inDir, VALID_EXTENSIONS);
  return fonts;
}

async function fontsByPublication(params) {
  const { inDir, outType, outDir, inType } = params;
  const publications = fs
    .readdirSync(inDir)
    .filter((file) => fs.lstatSync(path.join(inDir, file)).isDirectory());

  let results = [];

  for (const publication of publications) {
    const inPublicationPath = path.join(inDir, publication);
    const outPublicationPath = path.join(outDir, publication);

    if (!fs.existsSync(outPublicationPath)) {
      fs.mkdirSync(outPublicationPath);
    }

    const response = await processFonts({
      inDir: inPublicationPath,
      outType,
      outDir: outPublicationPath,
      inType,
    });

    results = results.concat(response);
  }

  return results;
}

async function processFonts({ inDir, outDir, outType, inType }) {
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
    if (fs.lstatSync(path.join(inDir, input)).isDirectory()) {
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

function getFolderFonts(pathName, folder) {
  const inputs = fs.readdirSync(path.join(pathName, folder));
  const location = path.join(pathName, folder);
  const fonts = [];
  for (const input of inputs) {
    const fileName = path.basename(path.join(location, input));
    if (fs.lstatSync(path.join(location, input)).isDirectory()) {
      getFolderFonts(pathName, path.join(folder, input));
    } else {
      if (!flag) {
        moveFont(path.join(folder, input), pathName, fileName);
        fonts.push(fileName);
      } else {
        fonts.push(path.join(folder, input));
      }
    }
  }
  return fonts;
}

function moveFont(filepath, location, fileName) {
  fs.copyFileSync(path.join(location, filepath), path.join(filepath, fileName));
  fs.rmSync(path.join(location, filepath));
}

function cleanupFolder(dir, validExtensions) {
  const inputs = fs.readdirSync(dir);
  for (const input of inputs) {
    const filePath = path.join(dir, input);
    if (fs.lstatSync(filePath).isDirectory()) {
      cleanupFolder(filePath, validExtensions);
    } else {
      const extension = input.split(".").pop();
      if (!validExtensions.has(extension)) {
        fs.rmSync(filePath);
      }
    }
  }
  removeEmptyFolders(dir);
}

function removeEmptyFolders(dir) {
  const inputs = fs.readdirSync(dir);
  for (const input of inputs) {
    const filePath = path.join(dir, input);
    if (fs.lstatSync(filePath).isDirectory()) {
      if (isEmpty(filePath)) {
        fs.rmdirSync(filePath);
        continue;
      }
      removeFolders(filePath);
    }
  }
}

async function getPostcripNames(inputFiles) {
  console.log(inputFiles);
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

function isEmpty(path) {
  return fs.readdirSync(path).length === 0;
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
