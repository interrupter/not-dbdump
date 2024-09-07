import ncDBDump from "./ncDBDump.js";

let manifest = {
    router: {
        manifest: [
            {
                paths: ["dbdump/([^/]+)/([^/]+)", "dbdump/([^/]+)", "dbdump"],
                controller: ncDBDump,
            },
        ],
    },
    menu: {
        side: {
            items: [...ncDBDump.getMenu({ section: "system" })],
        },
    },
};

export { manifest };
