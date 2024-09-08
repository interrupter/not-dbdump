const config = require("not-config").createReader();
const child_process = require("child_process");
const fs = require("fs/promises");
const { filesize } = require("filesize");
const path = require("path");

const {
    SETUP_DUMP_NAME_TEST_REG,
    DUMP_FILE_EXT,
    RESTORED_DUMP_FILE_NAME_MARK,
} = require("../const");

function dumpAction(script, fname) {
    return new Promise((resolve, reject) => {
        const opts = config.get("db.mongoose.options");
        child_process.execFile(
            script, //script to launch
            [
                opts.host, //MONGO_HOST
                opts.db, //MONGO_DB
                opts.user, //MONGO_LOGIN
                opts.pass, //MONGO_PASS
                fname, //MONGO_ARCHIVE
            ],
            (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        stdout,
                        stderr,
                    });
                }
            }
        );
    });
}

function createDump(fname) {
    return dumpAction(path.resolve(__dirname, "../../../.bin/not-dump"), fname);
}

function restoreFromDump(fname) {
    return dumpAction(
        path.resolve(__dirname, "../../../.bin/not-restore"),
        fname
    );
}

async function getFileInfo(path) {
    return fs.stat(path);
}

async function listDumps(pathToDumps) {
    const dir = await fs.opendir(pathToDumps);
    let list = [];
    for await (const dirent of dir) {
        if (dirent.isFile() && path.parse(dirent.name).ext === DUMP_FILE_EXT) {
            let fileInfo = await getFileInfo(
                path.join(pathToDumps, dirent.name)
            );
            list.push({
                name: dirent.name,
                size: filesize(fileInfo.size),
                created: fileInfo.birthtime,
            });
        }
    }
    list.sort((a, b) => {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
    });
    return list;
}

/**
 * Test items of list. If some item has name of setup dump - returns this item
 *
 * @param {Array<Object>} list
 * @return {false | Object}
 */
function setupDumpIsAvailable(list) {
    return list.find((element) => isSetup(element.name));
}

function isSetup(name) {
    return SETUP_DUMP_NAME_TEST_REG.test(name);
}

/**
 * changes file name from file_name.gzip to file_name-restored.gzip
 *
 * @param {string} name
 * @return {string}
 */
function markNameAsRestored(name) {
    const parts = path.parse(name);
    return `${parts.name}${RESTORED_DUMP_FILE_NAME_MARK}${parts.ext}`;
}

/**
 * Removes files by full path, returns 0 if ok and Error if exception occured
 *
 * @param {string} fpath
 * @return {Promise<0|Error>}
 */
async function removeDump(fpath) {
    try {
        await fs.unlink(fpath);
        return 0;
    } catch (e) {
        return e;
    }
}

module.exports = {
    createDump,
    restoreFromDump,
    dumpAction,
    removeDump,
    listDumps,
    setupDumpIsAvailable,
    markNameAsRestored,
    isSetup,
};
