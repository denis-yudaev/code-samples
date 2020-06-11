/**
 * Модель варианта отчёта для комбобокса
 * @class App.project.modules.reportquarter.model.ReportVar
 */
Ext.define('App.project.modules.reportquarter.model.ReportVar', {
	extend: 'App.common.data.Model',
	idProperty: 'report_id',

	fields: [
		{
			name: 'report_name'
		}
	],

	proxy: {
		extraParams: {
			read: {
				object: 'rpt.report',
				method: 'rpt.report_s',
				data: [
					App.common.data.prepare.Condition.$eq('kls_code_type_report', 'QUARTER')
				]
			}
		}
	}
});