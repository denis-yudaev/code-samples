/**
 * Источник квартального отчёта
 * @class App.project.modules.reportquarter.model.ReportSource
 */
Ext.define('App.project.modules.reportquarter.model.ReportSource', {
	extend: 'App.common.data.Model',
	idProperty: 'report_source_id',

	fields: [

		{
			name: 'report_id_dst',        //  Отчет
			defaultValue: 0,              //  esemenov: "Здесь при создании новой записи в controller записать id родительской записи"
			type: 'integer',
			critical: true
		},
		{
			name: 'report_id_src',       //  Отчет-источник
			type: 'integer'
		},
		{
			name: 'report_source_vers'   //  Версия строки
		},
		{
			name: 'report_year_end_dst'  //  Год окончания действия отчета
		},
		{
			name: 'report_year_beg_dst'  //  Год начала действия отчета
		},
		{
			name: 'report_year_end_src'  //  Год окончания действия отчета-источника
		},
		{
			name: 'report_name_src',     //  Наименование отчета-источника
			type: 'string'
		},
		{
			name: 'report_name_dst'      //  Наименование отчета
		},
		{
			name: 'report_year_beg_src'  //  Год начала действия отчета-источника
		}

	],

	proxy: {
		extraParams: {
			object: 'rpt.report_source',
			create: {
				method: 'rpt.report_source_i'
			},
			read: {
				method: 'rpt.report_source_s'
			},
			destroy: {
				method: 'rpt.report_source_d'
			}
		}
	}
});