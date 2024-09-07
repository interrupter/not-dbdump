import { MODULE_NAME } from "../../const.js";

import Validators from "../common/validators.js";
import WaitPlease from "../common/wait.please.svelte";

import { Frame } from "not-bulma";

const { notCRUD } = Frame;

const MODEL_NAME = "dbdump";

import CRUDActionCreate from "./actions/create.js";
import CRUDActionRestore from "./actions/restore.js";
import CRUDActionGet from "./actions/get.js";
import CRUDActionDelete from "./actions/delete.js";
import CRUDActionList from "not-bulma/src/frame/crud/actions/list.js";

const actions = {
    create: CRUDActionCreate,
    restore: CRUDActionRestore,
    delete: CRUDActionDelete,
    get: CRUDActionGet,
};

class ncDBDump extends notCRUD {
    static get MODULE_NAME() {
        return MODULE_NAME;
    }

    static get MODEL_NAME() {
        return MODEL_NAME;
    }

    static get LABELS() {
        return Object.freeze({
            plural: "Дампы БД",
            single: "Дамп БД",
        });
    }

    constructor(app, params, schemes) {
        super(app, MODEL_NAME, { actions });

        this.setModuleName(ncDBDump.MODULE_NAME);
        this.setModelName(ncDBDump.MODEL_NAME);

        this.setOptions("names", ncDBDump.LABELS);
        this.setOptions("Validators", Validators);
        this.setOptions("params", params);
        this.setOptions("role", "root");
        this.setOptions("urlSchemes", schemes);

        this.setOptions("list", {
            interface: {
                factory: this.getInterface(),
                combined: true,
                combinedAction: "listAndCount",
            },
            pager: {
                size: 1000,
                page: 0,
            },
            sorter: {
                name: -1,
            },
            fields: [
                {
                    path: ":name",
                    title: "Название",
                },
                {
                    path: ":size",
                    title: "Размер",
                },
                {
                    path: ":created",
                    title: "Дата создания",
                },
                {
                    path: ":_id",
                    title: "Действия",
                    type: "button",
                    preprocessor: (value, item) =>
                        CRUDActionList.createActionsButtons(this, value),
                },
            ],
        });
        this.start();
        return this;
    }

    showWait() {
        this.ui.wait = new WaitPlease({
            target: document.body,
        });
    }

    removeWait() {
        if (this.ui.wait) {
            this.ui.wait.$destroy();
        }
    }
}

export default ncDBDump;
