import fs from 'fs';
import ftp from 'basic-ftp';

const nasdaqFTPer = async () => {

  const client = new ftp.Client();
  try {
    await client.access({
      host:'ftp.nasdaqtrader.com'
    });
    console.log(await client.list());
    await client.downloadTo('data/nasdaqlisted.txt', 'SymbolDirectory/nasdaqlisted.txt');
    await client.downloadTo('data/otherlisted.txt', 'SymbolDirectory/otherlisted.txt');
    await client.downloadTo('data/options.txt', 'SymbolDirectory/options.txt');
  } catch (e) {
    console.log(e);
  }
  client.close();
}

export default nasdaqFTPer;