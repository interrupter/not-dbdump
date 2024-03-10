const config = require('not-config').createReader();
const child_process = require('child_process');
const fs = require('fs/promises');
const {filesize} = require('filesize');
const path = require('path');

function dumpAction(script, fname) {
  return new Promise((resolve, reject) => {
    let opts = config.get('db.mongoose.options');
    child_process.execFile(
      script, //script to launch
      [
        opts.host, //MONGO_HOST
        opts.db, //MONGO_DB
        opts.user, //MONGO_LOGIN
        opts.pass, //MONGO_PASS
        fname //MONGO_ARCHIVE
      ],
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            stdout,
            stderr
          });
        }
      }
    );
  });
}

function createDump(fname) {
  return dumpAction(path.resolve(__dirname, '../../../.bin/not-dump'), fname);
}

function restoreFromDump(fname) {
  return dumpAction(path.resolve(__dirname, '../../../.bin/not-restore'), fname);
}

async function getFileInfo(path){
  return fs.stat(path);
}

async function listDumps(pathToDumps) {
  const dir = await fs.opendir(pathToDumps);
  let list = [];
  for await (const dirent of dir) {
    if(dirent.isFile() && (path.parse(dirent.name).ext === '.gzip')){
      let fileInfo = await getFileInfo(path.join(pathToDumps, dirent.name));
      list.push({
        name: dirent.name,
        size: filesize(fileInfo.size),
        created: fileInfo.birthtime,
      });
    }
  }
  list.sort((a, b)=>{
    return (new Date(b.created).getTime()) - (new Date(a.created).getTime()) ;
  });

  return list;
}

async function removeDump(fpath){
  await fs.unlink(fpath);
}

module.exports = {
  createDump,
  restoreFromDump,
  dumpAction,
  removeDump,
  listDumps
};
