const fs = require("fs");
const path = require("path");

const Font = require("fonteditor-core").Font;
const woff2 = require("fonteditor-core").woff2;

const util = require("./util");
const constants = require("./constants");

async function otfToTtf(filepath, outDir) {
  return new Promise((resolve, reject) => {
    const otfBuffer = fs.readFileSync(filepath);
    const font = Font.create(otfBuffer, {
      type: "otf",
    });

    const ttfBuffer = font.write({
      type: "ttf",
    });

    const ttfPath = path.join(outDir, `${path.basename(filepath, ".otf")}.ttf`);
    fs.writeFile(ttfPath, ttfBuffer, (err) => {
      if (err) {
        reject(err);
        return;
      }
      fs.copyFileSync(filepath, ttfPath);
      resolve(ttfPath);
    });
  });
}

async function otfToWoff(file, outDir) {
  return new Promise((resolve, reject) => {
    const otfBuffer = fs.readFileSync(file);
    const font = Font.create(otfBuffer, {
      type: "otf",
    });

    const woffBuffer = font.write({
      type: "woff",
      hinting: true,
      deflate: null,
    });

    font.optimize();

    let woffPath = path.join(outDir, `${path.basename(file, ".otf")}.woff`);

    fs.writeFile(woffPath, woffBuffer, (err) => {
      if (err) {
        reject(err);
        return;
      }
      fs.copyFileSync(file, woffPath);
      return util.optimize(woffPath);
      // .then(() => {
      // 	resolve(woffPath);
      // })
      // .catch(reject);
    });
  });
}

async function otfToWoff2(file, outDir) {
  return new Promise((resolve, reject) => {
    woff2
      .init()
      .then(() => {
        console.log(`Processing file: "${file}"`);
        const otfBuffer = fs.readFileSync(file);
        const font = Font.create(otfBuffer, {
          type: "otf",
          compound2simple: true,
        });

        font.optimize();
        font.compound2simple();

        // sort glyf
        font.sort();

        const woffBuffer = font.write({
          type: "woff2",
          hinting: true,
          deflate: null,
        });

        const woff2Path = path.join(
          outDir,
          `${path.basename(file, ".otf")}.woff2`,
        );
        fs.writeFile(woff2Path, woffBuffer, (err) => {
          if (err) {
            reject(err);
            return;
          }
          fs.copyFileSync(file, woff2Path);
          return util.optimize(woff2Path);
          //   util.then(() => {
          //     console.log(`Finish processing file: "${file}"`);
          //     resolve(woff2Path);
          //   });
          // .catch(reject);
        });
      })
      .catch(reject);
  });
}

module.exports = {
  otfsToWoff: async function (files, outDir) {
    const woffFiles = [];
    let promises = [];
    for (const filePath of files) {
      if (promises.length === constants.GROUPING_MAX) {
        for (const f of await Promise.all(promises)) {
          woffFiles.push(f);
        }
        printSeparator();
        promises = [];
      }
      promises.push(otfToWoff(filePath, outDir));
    }
    if (promises.length) {
      for (const f of await Promise.all(promises)) {
        woffFiles.push(f);
      }
      printSeparator();
    }
    return woffFiles;
  },
  otfsToWoff2: async function (files, outDir) {
    const woff2Files = [];
    let promises = [];
    for (const filePath of files) {
      if (promises.length === constants.GROUPING_MAX) {
        for (const f of await Promise.all(promises)) {
          woff2Files.push(f);
        }
        printSeparator();
        promises = [];
      }
      promises.push(otfToWoff2(filePath, outDir));
    }
    if (promises.length) {
      for (const f of await Promise.all(promises)) {
        woff2Files.push(f);
      }
      printSeparator();
    }
    return woff2Files;
  },
  otfToWoff,
  otfToWoff2,
  otfToTtf,
};

function printSeparator() {
  console.log(`-------------------------------`);
}
