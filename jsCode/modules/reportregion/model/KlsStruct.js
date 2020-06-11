/**
 * ПВ
 * @class App.project.modules.reportregion.model.KlsStruct
 */
	Ext.define('App.project.modules.reportregion.model.KlsStruct', {

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
					App.common.data.prepare.Condition.$eq('qual_code', 'KLS_STRUCT_PV')
				],
				order: {
					kls_rubrika: 'ASC'
				}
			}
		}
	}
});