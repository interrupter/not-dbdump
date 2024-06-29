import Validators from "../common/validators.js";
import WaitPlease from "../common/wait.please.svelte";

import { Frame } from "not-bulma";

const { notCRUD } = Frame;

const LABELS = {
    plural: "Дампы БД",
    single: "Дамп БД",
};

const MODEL = "dbdump";

import CRUDActionCreate from "./actions/create.js";
import CRUDActionRestore from "./actions/restore.js";
import CRUDActionGet from "./actions/get.js";
import CRUDActionDelete from "./actions/delete.js";

const actions = {
    create: CRUDActionCreate,
    restore: CRUDActionRestore,
    delete: CRUDActionDelete,
    get: CRUDActionGet,
};

class ncDBDump extends notCRUD {
    constructor(app, params, schemes) {
        super(app, MODEL, { actions });

        this.setModuleName("");
        this.setModelName(MODEL);

        this.setOptions("names", LABELS);
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
                    preprocessor: (value, item) => {
                        return [
                            {
                                action: () =>
                                    this.runAction("get", [item.name]),
                                type: "info",
                                title: "Скачать",
                                size: "small",
                                style: "outlined",
                            },
                            {
                                action: () =>
                                    this.runAction("restore", [item.name]),
                                type: "warning",
                                title: "Восстановить",
                                size: "small",
                                style: "outlined",
                            },
                            {
                                action: () => this.goDelete(item.name),
                                type: "danger",
                                title: "Удалить",
                                size: "small",
                                style: "outlined",
                            },
                        ];
                    },
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
