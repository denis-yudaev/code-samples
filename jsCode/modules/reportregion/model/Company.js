/**
 * Исполнитель
 * @class App.project.modules.reportregion.model.Company
 */
Ext.define('App.project.modules.reportregion.model.Company', {
	extend: 'App.common.data.Model',
	idProperty: 'company_id',
	fields: [
		{
			name: 'company_vers',
			type: 'integer'
		},
		{
			name: 'company_namef',
			type: 'string'
		},
		{
			name: 'company_inn',
			type: 'string'
		},
		{
			name: 'company_kpp',
			type: 'string'
		},
		{
			name: 'company_names',
			type: 'string'
		}
	],

	validators: {
		company_names: 'presence'
	},

	proxy: {
		extraParams: {
			read: {
				object: 'org.company',
				method: 'org.company_s',
				data: [
				],
				order: {
					company_names: 'ASC'
				}
			}
		}
	}
});