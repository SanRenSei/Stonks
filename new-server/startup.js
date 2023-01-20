const fs = require("fs");

async function startup() {
  var masterFile = "import/MASTER_meta.csv";
  var targetFile = "data/meta.csv";

  try {
    fs.accessSync(targetFile, fs.constants.R_OK | fs.constants.W_OK);
    // File exists
    return;
  } catch (err) {
    // File not exists
    if (!fs.existsSync("data")) {
      fs.mkdirSync("data");
    }
    fs.copyFileSync(masterFile, targetFile);
  }
}

module.exports = { startup };
