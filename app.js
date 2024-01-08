const fs = require("fs");
const path = require("path");

const Font = require("fonteditor-core").Font;

const ttf2Woff = require("./ttf-to");
const otf2Woff = require("./otf-to");

const inType = process.env.IN_TYPE;
const outType = process.env.OUT_TYPE;
const flag = process.env.OPT_GROUPS;

const VALID_EXTENSIONS = new Set(["ttf", "otf"]);

const inDir = path.join(__dirname, "In");
const outDir = path.join(__dirname, "Out");

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
  const fonts = await getFonts(inType, inDir);
  const inputFonts = await getPostcripNames(await getFonts(inType, inDir));
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
  console.log(pathName, fonts);
  return fonts;
}

function moveFont(filepath, location, fileName) {
  fs.copyFileSync(path.join(location, filepath), path.join(location, fileName));
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
      removeEmptyFolders(filePath);
    }
  }
}

async function getPostcripNames(inputFiles) {
  console.log(inputFiles);
  for (let index = 0; index < inputFiles.length; index++) {
    let file = inputFiles[index];
    // file = file.toLowerCase();
    const font = fs.readFileSync(file);
    const filename = path.parse(file).name;
    let extension = file.split(".").pop();
    extension = extension.toLowerCase();
    console.log("opening file: ", file);
    const fontInfo = getFont(font, extension);

    if (fontInfo) {
      const postcript = fontInfo.name.postScriptName;
      console.log("poscript", postcript);
      const newFile = `${path.dirname(file)}/${postcript}.${extension}`;
      if (postcript !== filename) {
        console.log(
          "RENAMED FILE (different postscript name): ",
          `${path.dirname(file)}/${postcript}.${extension}`,
        );
        fs.renameSync(file, newFile);
        inputFiles[index] = newFile;
      } else if (file.split(".").pop() !== extension) {
        console.log("RENAMED FILE (extension in uppercase): ");
        fs.renameSync(file, newFile);
        inputFiles[index] = newFile;
      }
    } else {
      inputFiles = inputFiles.filter((value) => {
        return value !== file;
      });
      if (!fs.existsSync(path.join(inDir, "A-ERROR"))) {
        fs.mkdirSync(path.join(inDir, "A-ERROR"));
      }

      if (flag) {
        const folderName = path.basename(path.dirname(file));
        const inDirError = path.join(inDir, "A-ERROR");
        if (!fs.existsSync(path.join(inDirError, folderName))) {
          fs.mkdirSync(path.join(inDirError, folderName));
        }

        fs.renameSync(
          file,
          path.join(
            path.join(inDirError, folderName),
            `${filename}.${extension}`,
          ),
        );
      } else {
        if (!fs.existsSync(path.join(inDir, "A-ERROR"))) {
          fs.mkdirSync(path.join(inDir, "A-ERROR"));
        }
        fs.renameSync(
          file,
          path.join(path.join(inDir, "A-ERROR"), `${filename}.${extension}`),
        );
      }
    }
  }
  return inputFiles;
}

function isEmpty(path) {
  return fs.readdirSync(path).length === 0;
}

function getFont(font, extension) {
  try {
    return Font.create(font, {
      type: extension,
      subset: [65, 66],
      hinting: true,
      compound2simple: true,
      inflate: null,
      combinePath: false,
    }).get();
  } catch (e) {
    console.log("Invalid font: ", e);
    return null;
  }
}
module.exports = {
  run: run,
};
