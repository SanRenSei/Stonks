
const fs = require('fs');

module.exports = () => {
  
  var masterFile = 'import/MASTER_meta.csv';
  var targetFile = 'data/meta.csv';
  
  try {
    fs.accessSync(targetFile, fs.constants.R_OK | fs.constants.W_OK);
    // File exists
    return;
  } catch (err) {
    // File not exists
    fs.copyFileSync(masterFile, targetFile);
  }
  
}
