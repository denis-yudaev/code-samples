/**
 * Виды работ
 * @class App.project.modules.reportquarter.model.KlsType
 */
Ext.define('App.project.modules.reportquarter.model.KlsType', {

	extend: 'App.common.data.Model',
	idProperty: 'kls_id',
	fields: [
		{
			name: 'kls_names'
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
					App.common.data.prepare.Condition.$eq('qual_code', 'KLS_TYPE_TSK')
				],
				order: {
					kls_names: 'ASC'
				}
			}
		}
	}
});