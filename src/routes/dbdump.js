const
  MODEL_NAME = 'DBDump';

const log = require('not-log')(module, `${MODEL_NAME} router`);

exports.getIP = (req) => {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};


const notNode = require('not-node');
const notError = require('not-error').notError;
const query = require('not-filter');
const path = require('path');
const fs = require('fs');

const {
  createDump,
  restoreFromDump,
  removeDump,
  listDumps
} = require('../common/operations.js');

exports.before = (req) => {
  let optionsSchema = this.getModelSchema(MODEL_NAME);
  query.filter.process(req, optionsSchema);
  query.sorter.process(req, optionsSchema);
  req.sorter = {
    id: -1
  };
  query.search.process(req, optionsSchema);
  query.pager.process(req);
};

exports.after = () => {};

function getAppName(){
  return notNode.Application.getEnv('name');
}

function getDateString(){
  return new Date().toISOString().split('.')[0].split(' ').join(':')
}

function createDBDumpFilename(appname, date){
  if (!appname){ appname = getAppName();}
  if (!date){ date = getDateString();}
  return `${appname}.db.dump.${date}.gzip`;
}

function getPathToDumps(){
  return notNode.Application.getEnv('dbDumpsPath');
}

function getFullPathToArchive(appname, date){
  let pathToDir = getPathToDumps();
  return path.join(pathToDir, createDBDumpFilename(appname, date));
}

exports._restore = async(req, res)=>{
  try{
    log.debug(req.body);
    let fname = path.parse(req.body.fname).base;
    let {stdout, stderr} = await restoreFromDump(path.join(getPathToDumps(), fname));
    const timeout = 1000;
    notNode.Application.shutdown(timeout);
    res.status(200);
    res.json( {
      status: 'ok',
      result:{
        fname,
        stdout,
        stderr,
        shutdown: timeout,
        info: `Сервер перезагрузится через ${timeout}мс, страница обновится автоматически`
      }
    });
    res.end();

  }catch(e){
    notNode.Application.report(new notError('db._restore', {
      ip: exports.getIP(req),
      fname: req.body.fname
    }, e));
    res.status(500).json({
      status: 'error',
      error: e.toString()
    });
  }
}

exports._create = async(req, res)=>{
  try{
    let fname = getFullPathToArchive();
    let {stdout, stderr} = await createDump(fname);
    res.status(200);
    res.json({
      status: 'ok',
      result:{
        fname,
        stdout,
        stderr
      }
    });
    res.end();
  }catch(e){
    notNode.Application.report(new notError('db._dump', {
      ip: exports.getIP(req)
    }, e));
    res.status(500).json({
      status: 'error',
      error: e.toString()
    });
  }
}

/**
* Выдает список архивов
*/
exports._listAndCount = async(req, res)=>{
  try{
    let list = await listDumps(getPathToDumps());
    let count = list.length;
    res.status(200);
    res.json({
      status: 'ok',
      result: {
        list,
        count,
        skip: 0,
        page: 0,
        pages: 1
      }
    });
    res.end();
  }catch(e){
    notNode.Application.report(new notError('db._list', {
      ip: exports.getIP(req)
    }, e));
    res.status(500).json({
      status: 'error',
      error: e.toString()
    });
  }
}


/**
* Выдает архив
*/
exports._get = async(req, res)=>{
  try{
    let fname = req.params.fname;
    let details = path.parse(fname);
    if(details.ext !== '.gzip'){
      throw new Error('Wrong archive file extension: ' + details.ext);
    }
    if(details.dir !== '' || details.root !== ''){
      throw new Error('Wrong archive file path: ' + fname);
    }
    const stream = fs.createReadStream(path.join(getPathToDumps(), details.base))
    stream.pipe(res);
  }catch(e){
    notNode.Application.report(new notError('db._get', {
      ip: exports.getIP(req),
      fname: req.body.fname
    }, e));
    res.status(500).json({
      status: 'error',
      error: e.toString()
    });
  }
}


exports._delete = async(req, res)=>{
  try{
    let fname = req.params.fname;
    let details = path.parse(fname);
    if(details.ext !== '.gzip'){
      throw new Error('Wrong archive file extension: ' + details.ext);
    }
    await removeDump(path.join(getPathToDumps(), details.base));
    res.status(200);
    res.json({
      status: 'ok'
    });
    res.end();
  }catch(e){
    notNode.Application.report(new notError('db._remove', {
      ip: exports.getIP(req)
    }, e));
    res.status(500).json({
      status: 'error',
      error: e.toString()
    });
  }
}
