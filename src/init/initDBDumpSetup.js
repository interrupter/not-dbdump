const fs = require("fs/promises");
const path = require("path");

const logger = require("not-log")(module, "init db from file");
const Env = require("not-node/src/env");

const {
    restoreFromDump,
    listDumps,
    setupDumpIsAvailable,
    markNameAsRestored,
} = require("../common/operations");

module.exports = class InitDBDumpSetup {
    static isSetupRestorationEnabled(config) {
        return config.get("modules.dbdump.setup");
    }

    static getPathToDumps() {
        return Env.get("dbDumpsPath");
    }

    static dumpNameToPath(name) {
        return path.join(InitDBDumpSetup.getPathToDumps(), name);
    }

    static async checkSetupDumpAvailability({ config }) {
        const availableDumps = await listDumps(
            InitDBDumpSetup.getPathToDumps()
        );
        return setupDumpIsAvailable(availableDumps);
    }

    static async markDumpAsUsedAndMove(dump) {
        const oldName = dump.name;
        const newName = markNameAsRestored(dump.name);
        await fs.rename(
            InitDBDumpSetup.dumpNameToPath(oldName),
            InitDBDumpSetup.dumpNameToPath(newName)
        );
        return newName;
    }

    async run({ config }) {
        try {
            const setupDump = await InitDBDumpSetup.checkSetupDumpAvailability(
                config
            );
            if (setupDump) {
                logger?.log(`Initializing DB from dump: `, setupDump.name);
                const result = await restoreFromDump(
                    InitDBDumpSetup.dumpNameToPath(setupDump.name)
                );
                const usedDump = await InitDBDumpSetup.markDumpAsUsedAndMove(
                    setupDump
                );
                logger?.debug(result.stdout);
                logger?.debug(result.stderr);
                logger?.log(
                    `DB initialization from setup dump finished, setup dump renamed to: ${usedDump}`
                );
            } else {
                logger?.debug(`No unused setup dump has been found`);
            }
        } catch (e) {
            logger?.error(e);
        }
    }
};
