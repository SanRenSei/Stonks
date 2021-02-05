
const fs = require('fs');
const FTP = require('ftp');

module.exports = () => {
  
  var filesDownloaded = 0;
  
  var c = new FTP();
  c.on('ready', function() {
    c.get('SymbolDirectory/nasdaqlisted.txt', function(err, stream) {
      if (err) {
        console.log(err);
      } else {
        stream.pipe(fs.createWriteStream('data/nasdaqlisted.txt'));
      }
      filesDownloaded++;
      if (filesDownloaded == 3) {
        c.end();
      }
    });
    c.get('SymbolDirectory/otherlisted.txt', function(err, stream) {
      if (err) {
        console.log(err);
      } else {
        stream.pipe(fs.createWriteStream('data/otherlisted.txt'));
      }
      filesDownloaded++;
      if (filesDownloaded == 3) {
        c.end();
      }
    });
    c.get('SymbolDirectory/options.txt', function(err, stream) {
      if (err) {
        console.log(err);
      } else {
        stream.pipe(fs.createWriteStream('data/options.txt'));
      }
      filesDownloaded++;
      if (filesDownloaded == 3) {
        c.end();
      }
    });
  });
  c.connect({
    host:'ftp.nasdaqtrader.com'
  });
  c.on('error', (err) => {
    console.log(err);
  });
  
}