/**
 * Модель "Классификатор единицы измерения"
 * @class App.project.modules.reportquarter.model.KlsMeasure
 */
Ext.define('App.project.modules.reportquarter.model.KlsMeasure', {
	extend: 'App.common.data.Model',
	idProperty: 'kls_id',
	fields: [
		{
			name: 'kls_names',
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
					App.common.data.prepare.Condition.$eq('qual_code', 'KLS_MEASURE')
				],
				order: {
					kls_names: 'ASC'
				}
			}
		}
	}
});