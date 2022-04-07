const ACTION = 'delete';
const MODEL_ACTION = 'delete';

export default class CRUDActionDelete {
  static async run(controller, [fname] = []) {
    try{
      if (confirm('Вы точно хотите безвозвратно удалить архив в данными?')) {
        controller.showWait();
        await controller.getModel({
            fname
          })[`$${MODEL_ACTION}`]({
            fname
          });
        controller.removeWait();
      }
      controller.goList();
    }catch(e){
      controller.removeWait();
      controller.report(e);
      controller.showErrorMessage(e);
      setTimeout( () => controller.goList(), 1000);
    }
  }
}
