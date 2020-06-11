/**
 * Заказчик
 * @class App.project.modules.reportregion.model.KlsCustomer
 */
Ext.define('App.project.modules.reportregion.model.KlsCustomer', {

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
					App.common.data.prepare.Condition.$eq('qual_code', 'KLS_CUSTOMER'),
					App.common.data.prepare.Condition.$isnn('kls_id_parent')
				],
				order: {
					kls_names: 'ASC'
				}
			}
		}
	}
});