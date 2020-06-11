/**
 * Модель для комбобокса "Вариант плана ГОЗ"
 * @class App.project.modules.reportquarter.model.PlanVar
 */
Ext.define('App.project.modules.reportquarter.model.PlanVar', {
	extend: 'App.common.data.Model',

	idProperty: 'plan_var_id',
	fields: [
		{
			name: 'plan_var_names',
			type: 'string'
		},
		{
			name: 'plan_year_beg'
		},
		{
			name: 'plan_year_end'
		}
	],

	validators: {
		plan_var_names: 'presence'
	},

	proxy: {
		extraParams: {
			read: {
				object: 'pln.plan_var',
				method: 'pln.plan_var_s',
				metaData: 'pln.plan_var_s_main',
				data: [
					App.common.data.prepare.Condition.$eq('kls_code_type', 'GOZ')
				],
				order: {
					plan_year_beg: 'ASC'
				}
			}
		}
	}
});