const ACTION = 'get';
const MODEL_ACTION = 'get';

export default class CRUDActionGet {
  static async run(controller, [fname] = []) {
    try{
      window.location.assign(`/api/dbdump/${MODEL_ACTION}/${fname}`);
      setTimeout(() => controller.goList(), 100);
    }catch(e){
      controller.removeWait();
      controller.report(e);
      controller.showErrorMessage(e);
      setTimeout( () => controller.goList(), 1000);
    }
  }
}
