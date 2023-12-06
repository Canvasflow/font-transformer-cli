const app = require("./app");
const group = require("./group-fonts");

compile()
  .then(() => console.log("Success"))
  .catch((err) => console.error(err));

async function compile() {
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
    await group.run();
    return;
  }
  await group.runGroups();
}
