import ncDBDump from "./ncDBDump.js";

let manifest = {
    router: {
        manifest: [ncDBDump.getRoutes()],
    },
    menu: {
        side: {
            items: [...ncDBDump.getMenu({ section: "system" })],
        },
    },
};

export { manifest };
