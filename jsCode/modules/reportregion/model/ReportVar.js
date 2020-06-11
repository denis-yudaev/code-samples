/**
 * Модель варианта отчёта для комбобокса
 * @class App.project.modules.reportregion.model.ReportVar
 */
Ext.define('App.project.modules.reportregion.model.ReportVar', {
	extend: 'App.common.data.Model',
	idProperty: 'report_id',

	fields: [
		{
			name: 'report_name'
		}
	],

	validators: {
		report_name: 'presence'
	},

	proxy: {
		extraParams: {
			read: {
				object: 'rpt.report',
				method: 'rpt.report_s',
				data: [
					App.common.data.prepare.Condition.$eq('kls_code_type_report', 'REGION')
				]
			}
		}
	}
});