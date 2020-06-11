/**
 * Модель "Способ размещения" для комбобокса фильтра ПФ
 * @class App.project.modules.reportquarter.model.KlsTypePlacing
 */
Ext.define('App.project.modules.reportquarter.model.KlsTypePlacing', {
	extend: 'App.common.data.TreeModel',
	idProperty: 'kls_id',
	fields: [
		{
			name: 'kls_names',
			type: 'string'
		},
		{
			name: 'kls_rubrika',
			type: 'string'
		},
		{
			name: 'kls_id_parent',
			type: 'string'
		},
		{
			name: 'kls_code',
			type: 'string'
		}
	],

	validators: {
		kls_names: 'presence'
	},

	proxy: {
		extraParams: {
			read: {
				object: 'kls.kls',
				method: 'kls.kls_s',
				data: [
					App.common.data.prepare.Condition.$eq('qual_code', 'KLS_TYPE_PLC')
				],
				order: {
					kls_names: 'ASC'
				}
			}
		}
	}
});