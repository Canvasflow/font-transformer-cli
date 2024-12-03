const util = require("util");
const exec = util.promisify(require("child_process").exec);

(async () => {
  try {
    const { stdout } = await exec("npm run optimize");
    console.log(`stdout: ${stdout}`);
  } catch (e) {
    console.error(e);
  }
})();
