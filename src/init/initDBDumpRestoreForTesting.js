const logger = require("not-log")(module, "init test db from file");
const Env = require("not-node/src/env");
const path = require("path");
const {
    restoreFromDump,
    listDumps,
    testDumpIsAvailable,
} = require("../common/operations");

module.exports = class InitDBDumpRestoreForTesting {
    static isTestRestorationEnabled(config) {
        return config.get("modules.dbdump.test");
    }

    static getPathToDumps() {
        return Env.get("dbDumpsPath");
    }

    static dumpNameToPath(name) {
        return path.join(InitDBDumpRestoreForTesting.getPathToDumps(), name);
    }

    static isTesting() {
        return process.env.NODE_ENV === "test";
    }

    static async checkTestDumpAvailability() {
        const availableDumps = await listDumps(
            InitDBDumpRestoreForTesting.getPathToDumps()
        );
        return testDumpIsAvailable(availableDumps);
    }

    static async getTestDumpPath(configProp) {
        if (typeof configProp === "string") {
            return InitDBDumpRestoreForTesting.dumpNameToPath(configProp);
        } else {
            const testDump =
                await InitDBDumpRestoreForTesting.checkTestDumpAvailability();
            if (!testDump) {
                return;
            }
            return InitDBDumpRestoreForTesting.dumpNameToPath(testDump.name);
        }
    }

    async run({ config }) {
        try {
            if (!InitDBDumpRestoreForTesting.isTesting()) {
                return;
            }
            logger?.log(
                `Test environment detected, checking if restoration from test dump enabled.`
            );
            const enabled =
                InitDBDumpRestoreForTesting.isTestRestorationEnabled(config);
            if (!enabled) {
                logger?.log(`Initializing DB from dump for testing: disabled`);
                return;
            }
            logger?.log(`Initializing DB from dump for testing: enabled`);
            const pathToDump =
                await InitDBDumpRestoreForTesting.getTestDumpPath(enabled);
            logger?.log(`Initializing DB from dump for testing: ${pathToDump}`);
            const result = await restoreFromDump(pathToDump);
            logger?.debug(result.stdout);
            logger?.debug(result.stderr);
            logger?.log(`DB initialization from test dump finished.`);
        } catch (e) {
            logger?.error(e);
        }
    }
};
