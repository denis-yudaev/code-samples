/**
 * Задание
 * @class App.project.modules.reportquarter.model.Task
 */
Ext.define('App.project.modules.reportquarter.model.Task', {
	extend: 'App.common.data.Model',
	idProperty: 'task_id',
	fields: [
		{
			name: 'task_code',
			type: 'string'
		},
		{
			name: 'task_name',
			type: 'string'
		}
	],

	validators: {
		task_code: 'presence'
	},

	proxy: {
		extraParams: {
			object: 'tsk.task',
			read: {
				method: 'tsk.task_s',
				order: {
					task_name: 'ASC'
				}
			}
		}
	}
});