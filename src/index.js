module.exports = {
    name: require("./const").MODULE_NAME,
    paths: {
        controllers: __dirname + "/controllers",
        routes: __dirname + "/routes",
    },
    InitDBDumpRestoreForTesting: require("./init/initDBDumpRestoreForTesting"),
    InitDBDumpSetup: require("./init/initDBDumpSetup"),
};
