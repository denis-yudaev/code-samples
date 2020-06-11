/**
 * Форма ведения региональных отчётов
 * @class App.project.modules.reportregion.view.Main
 */
Ext.define('App.project.modules.reportregion.view.Main', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.reportregion-main',

	requires: [
		'App.project.modules.reportregion.view.MainModel',
		'App.project.modules.reportregion.view.MainController',
		'App.project.modules.reportregion.view.grid.Filter',
		'App.project.modules.reportregion.view.grid.FilterForm',
		'App.project.modules.reportregion.view.grid.Panel',
		'App.project.modules.reportregion.view.registry.Window',
		'App.project.modules.reportregion.view.grid.CellContextMenu',
		'App.project.button.report.OpenRegistry'
	],

	mixins: {
		ctrlControl: 'App.project.mixin.ControllerControl'
	},

	reference: 'mainView',

	publishes: ['reportName', 'reportId', 'reportYearBeg', 'reportYearEnd'],

	config: {
		reportId: null,
		reportName: null,
		reportYearBeg: null,
		reportYearEnd: null,

		//  параметры запроса, параметры будут использоваться при экспорте данных
		exportRequestData: null
	},

	controller: 'reportregion-main',
	viewModel: 'reportregion-main',

	layout: 'border',

	items: [
		{	// Фильтр
			region: 'north',
			xtype: 'reportregion-grid-filter'
		},
		{
			region: 'center',
			xtype: 'reportregion-grid-panel',
			hidden: true
		}
	],


	setReportName: function(value){
		var me = this,
		    el = me.getEl();

		if ( el && value ) {
			el.removeCls( 'has-no-report-name' );
		} else {
			el.removeCls( 'has-no-report-name' );
			el.addCls( 'has-no-report-name' );
		}

		return me.callParent(arguments);
	},


	//  TODO: каждый раз, когда мы заходим на экранную форму - ajax-запросом собираются записи, наименования которых равны `null`, далее, в случае если такие записи были найдены - уходит второй запрос на их удаление. Возможно, это не оптимальная реализация, и в дальнейшем механизм будет доработан, но пока пусть работает так - меня устраивает.
	initComponent: function() {
		var me = this;

		me.purgeTempRecords();

		me.callParent( arguments );
	},


	purgeTempRecords: function()
	{
		//  собираем варианты отчётов с нулевыми наименованиями
		App.common.Ajax.request({
			url: App.constants.API_READ(),
			jsonData: {
				object: 'rpt.report',
				method: 'rpt.report_s',
				data: [
					App.common.data.prepare.Condition.$eq('kls_code_type_report', 'REGION'),
					App.common.data.prepare.Group.$and([
						App.common.data.prepare.Condition.$isn('report_name', 'or'),
						App.common.data.prepare.Condition.$eq('report_name', '', 'or')
					])
				]
			},

			callback: function(options, success, response) {
				var data = success && Ext.JSON.decode( response.responseText, true ),
				    ids;

				//  если временные записи найдены - удаляем их
				if( data && data.success && data.data && data.data.length ) {
					ids = Ext.Array.map( data.data, function(rec) { return { report_id: rec.report_id }; });

					App.common.Ajax.request({
						url: App.constants.API_DESTROY(),
						jsonData: {
							object: 'rpt.report',
							method: 'rpt.report_d',
							data: ids
						}
					});
				}
			}

		});
	}


});
