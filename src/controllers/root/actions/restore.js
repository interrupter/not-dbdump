const ACTION = "restore";
const MODEL_ACTION = "restore";

export default class CRUDActionRestore {
    static getDelay(controller){
        return controller.app.getOptions('modules.dbdump.pageReloadDelay', 1000);
    }

    static async run(controller, [fname] = []) {
        try {
            if (
                confirm(
                    "Вы точно хотите восстановить данные из архива? Текущее состояние БД будет утеряно без возвратно."
                )
            ) {
                controller.showWait();
                await controller
                    .getModel({
                        fname,
                    })[`$${MODEL_ACTION}`]({
                        fname,
                    });
                setTimeout(
                    () => {
                        controller.removeWait();
                        controller.goList()
                    }, 
                    this.getDelay(controller)
                );
            }else{
                controller.goList();
            }            
        } catch (e) {
            controller.removeWait();
            controller.report(e);
            controller.showErrorMessage(e);
            setTimeout(
                () => controller.goList(), 
                this.getDelay(controller)
            );
        }
    }
}
