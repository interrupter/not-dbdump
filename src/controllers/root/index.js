import ncDBDump from './ncDBDump.js';

let manifest = {
	router: {
		manifest: [
			{
				paths: ['dbdump\/([^\/]+)\/([^\/]+)', 'dbdump\/([^\/]+)', 'dbdump'],
				controller: ncDBDump
			},
		]
	},
	menu:{
		side: {
			items:[{
				id: 			'system.dbdump',
				section: 	'system',
				title: 		'Дамп БД',
				url: 			'/dbdump'
			}]
		}
	}
};

export {
	manifest
};
