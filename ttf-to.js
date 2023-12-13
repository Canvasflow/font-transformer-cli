const fs = require("fs");
const path = require("path");

const Font = require("fonteditor-core").Font;
const woff2 = require("fonteditor-core").woff2;

const util = require("./util");
const constants = require("./constants");

async function ttfToWoff(file, outDir) {
  return new Promise((resolve, reject) => {
    const otfBuffer = fs.readFileSync(file);
    const font = Font.create(otfBuffer, {
      type: "ttf",
    });

    const woffBuffer = font.write({
      type: "woff",
      hinting: true,
      deflate: null,
      support: { head: {}, hhea: {} },
    });

    const woffPath = path.join(outDir, `${path.basename(file, ".ttf")}.woff`);
    fs.writeFile(woffPath, woffBuffer, (err) => {
      if (err) {
        reject(err);
        return;
      }
      fs.copyFileSync(file, woffPath);
      util.optimize(woffPath).then(() => {
        resolve(woffPath);
      });
      // util.optimize(woffPath)
      // 	.then(() => {
      // 		resolve(woffPath);
      // 	})
      // 	.catch(reject);
    });
  });
}

async function ttfToWoff2(file, outDir) {
  return new Promise((resolve, reject) => {
    let woff2Path;
    woff2
      .init()
      .then(() => {
        console.log(`Processing file: "${file}"`);
        const otfBuffer = fs.readFileSync(file);
        const font = Font.create(otfBuffer, {
          type: "ttf",
        });

        const woffBuffer = font.write({
          type: "woff2",
          hinting: true,
          deflate: null,
          support: { head: {}, hhea: {} },
        });

        woff2Path = path.join(outDir, `${path.basename(file, ".ttf")}.woff2`);
        fs.writeFileSync(woff2Path, woffBuffer);
        fs.copyFileSync(file, woff2Path);
        util.optimize(woff2Path).then(() => {
          resolve(woff2Path);
        });
      })
      .then(() => {
        console.log(`Finish processing file: "${file}"`);
        resolve(woff2Path);
      })
      .catch(reject);
  });
}

module.exports = {
  ttfsToWoff: async function (files, outDir) {
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
      promises.push(ttfToWoff(filePath, outDir));
    }
    if (promises.length) {
      for (const f of await Promise.all(promises)) {
        woffFiles.push(f);
      }
      printSeparator();
    }
    return woffFiles;
  },
  ttfsToWoff2: async (files, outDir) => {
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
      promises.push(ttfToWoff2(filePath, outDir));
    }
    if (promises.length) {
      for (const f of await Promise.all(promises)) {
        woff2Files.push(f);
      }
      printSeparator();
    }
    return woff2Files;
  },
  ttfToWoff,
  ttfToWoff2,
};

function printSeparator() {
  console.log(`-------------------------------`);
}
