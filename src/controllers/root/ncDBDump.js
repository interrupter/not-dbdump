import Validators from '../common/validators.js';
import WaitPlease from '../common/wait.please.svelte';
import {
  ncCRUD
} from 'not-bulma';

const LABELS = {
  plural: 'Дампы БД',
  single: 'Дамп БД',
};

const MODEL = 'dbdump';

class ncDBDump extends ncCRUD {
  constructor(app, params, schemes) {
    super(app, MODEL);
    this.setModuleName('');
    this.setModelName(MODEL);
    this.setOptions('names', LABELS);
    this.setOptions('Validators', Validators);
    this.setOptions('params', params);
    this.setOptions('role', 'root');
    this.setOptions('urlSchemes', schemes);
    this.setOptions('list', {
      interface: {
        factory: this.getModel(),
          combined: true,
          combinedAction: 'listAndCount'
      },
      pager: {
        size: 1000,
        page: 0
      },
      sorter: {
        name: -1
      },
      fields: [{
        path: ':name',
        title: 'Название'
      }, {
        path: ':size',
        title: 'Размер'
      }, {
        path: ':created',
        title: 'Дата создания'
      }, {
        path: ':_id',
        title: 'Действия',
        type: 'button',
        preprocessor: (value, item) => {
          return [{
              action: this.runGet.bind(this, [item.name]),
              type: 'info',
              title: 'Скачать',
              size: 'small',
              style: 'outlined'
            },
            {
              action: this.runRestore.bind(this, [item.name]),
              type: 'warning',
              title: 'Восстановить',
              size: 'small',
              style: 'outlined'
            },
            {
              action: this.goDelete.bind(this, item.name),
              type: 'danger',
              title: 'Удалить',
              size: 'small',
              style: 'outlined'
            }
          ];
        },
      }]
    });
    this.start();
    return this;
  }

  runCreate() {
    this.showWait();
    this.getModel()({}).$create()
      .then(() => {
        this.removeWait();
        this.goList()
      })
      .catch(this.error);
  }

  runRestore([fname]) {
    if (confirm('Вы точно хотите восстановить данные из архива? Текущее состояние БД будет утеряно без возвратно.')) {
      this.showWait();
      this.getModel()({
          fname
        }).$restore({
          fname
        })
        .then(() => {
          this.removeWait();
          this.goList()
        })
        .catch(this.error);
    } else {
      this.goList()
    }
  }

  runDelete([fname]) {
    if (confirm('Вы точно хотите безвозвратно удалить архив в данными?')) {
      this.showWait();
      this.getModel()({
          fname
        }).$delete({
          fname
        })
        .then(() => {
          this.removeWait();
          this.goList();
        })
        .catch(this.error);
    } else {
      this.goList()
    }
  }

  runGet([fname]) {
    window.location.assign(`/api/dbdump/get/${fname}`);
    setTimeout(() => this.goList(), 100);
  }

  showWait() {
    this.ui.wait = new WaitPlease({
      target: document.body
    });
  }

  removeWait() {
    if (this.ui.wait) {
      this.ui.wait.$destroy();
    }
  }

}

export default ncDBDump;
