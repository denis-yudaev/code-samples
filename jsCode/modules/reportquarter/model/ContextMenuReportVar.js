/**
 * Модель "Вариантов отчётов" для комбобокса в контекстном меню
 * @class App.project.modules.reportquarter.model.ContextMenuReportVar
 */
Ext.define('App.project.modules.reportquarter.model.ContextMenuReportVar', {
	extend: 'App.project.modules.reportquarter.model.ReportVar',

	proxy: {
		extraParams: {
			read: {
				object: 'rpt.report',
				method: 'rpt.report_s',
				data: [
					App.common.data.prepare.Condition.$isnn( 'report_name' ),
					App.common.data.prepare.Condition.$eq('kls_code_type_report', 'QUARTER')
				]
			}
		}
	}
});