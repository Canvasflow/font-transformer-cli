const os = require("os");
const path = require("path");
const fs = require("fs");
const Fontmin = require("fontmin");
async function optimize(filePath) {
  return new Promise((resolve, reject) => {
    if (process.argv.length !== 3 && process.argv[2] !== "--optimize") {
      resolve(filePath);
      return;
    }
    const id = uuidv4();
    const dirPath = path.join(os.tmpdir(), id);
    fs.mkdirSync(dirPath);
    var fontmin = new Fontmin().src(filePath).dest(dirPath);
    fontmin.run(function (err, files) {
      if (err) {
        console.log("****************************************************");
        console.log("Error optimizing file:", filePath);
        console.log("****************************************************");
        resolve(filePath);

        // reject(err);
        // throw err;
      }
      if (files) {
        for (const file of fs.readdirSync(dirPath)) {
          if (path.extname(file) !== path.extname(filePath)) {
            fs.unlinkSync(path.join(dirPath, file));
          } else {
            fs.unlinkSync(filePath);
            fs.renameSync(path.join(dirPath, file), filePath);
          }
        }
        fs.rmdirSync(dirPath);
      }

      resolve(filePath);
    });
  });
}
module.exports = {
  optimize,
};

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
