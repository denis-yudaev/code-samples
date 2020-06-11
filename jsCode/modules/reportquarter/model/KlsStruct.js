/**
 * ПВ
 * @class App.project.modules.reportquarter.model.KlsStruct
 */
	Ext.define('App.project.modules.reportquarter.model.KlsStruct', {
		extend: 'App.common.data.TreeModel',
		idProperty: 'kls_id',
		fields: [
			{
				name: 'kls_names',
				type: 'string'
			},
			{
				name: 'kls_code',
				type: 'string'
			},
			{
				name: 'kls_rubrika_struct',
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
						App.common.data.prepare.Condition.$eq('qual_code', 'KLS_STRUCT_PV')
					],
					order: {
						kls_rubrika: 'ASC'
					}
				}
			}
		}
});