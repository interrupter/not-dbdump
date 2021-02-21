module.exports = {
	model: 'dbdump',
	url: '/api/:modelName',
	fields: {},
	actions:{
		listAndCount:{
			method: 'get',
			postFix: '/:actionName',
			rules: [{ root: true }]
		},
		get:{
			method: 'get',
			data: ['record'],
			postFix: '/:actionName/:record[fname]',
			rules: [{ root: true }]
		},
		delete:{
			method: 'delete',
			data: ['record'],
			postFix: '/:actionName/:record[fname]',
			rules: [{ root: true }]
		},
		create:{
			method: 'get',
			postFix: '/:actionName',
			rules: [{ root: true }]
		},
		restore:{
			method: 'put',
			data: ['record'],
			postFix: '/:actionName/:record[fname]',
			rules: [{ root: true }]
		}
	}
};
