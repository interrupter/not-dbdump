const ACTION = 'create';
const MODEL_ACTION = 'create';

export default class CRUDActionCreate {
  static async run(controller, params = []) {
    try{
      controller.showWait();
      await controller.getModel({})[`$${MODEL_ACTION}`]()
      controller.removeWait();
      controller.goList()
    }catch(e){
      controller.removeWait();
      controller.report(e);
      controller.showErrorMessage(e);
      setTimeout(() => controller.goList(), 1000);
    }
  }
}
