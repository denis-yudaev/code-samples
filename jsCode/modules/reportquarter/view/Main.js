/**
 * Форма ведения квартальных отчётов
 * @class App.project.modules.reportquarter.view.Main
 */
Ext.define('App.project.modules.reportquarter.view.Main', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.reportquarter-main',

	requires: [
		'App.project.modules.reportquarter.view.MainModel',
		'App.project.modules.reportquarter.view.MainController',
		'App.project.modules.reportquarter.view.grid.Filter',
		'App.project.modules.reportquarter.view.grid.Panel',
		'App.project.modules.reportquarter.view.grid.CellContextMenu',
		'App.project.modules.reportquarter.view.registry.Window',
		'App.project.button.report.OpenRegistry',
		'App.project.feature.SummaryGridExt',
		'App.local.form.field.TreeComboBox',
		'App.local.form.field.Year'
	],

	mixins: {
		ctrlControl: 'App.project.mixin.ControllerControl',
		configToState: 'App.local.mixin.ConfigToState'
	},

	bindToState: [
		'reportId',
		'reportName',
		'reportYearBeg'
	],


	config: {
		reportId: null,
		reportName: null,
		reportYearBeg: null,

		//  параметры запроса, параметры будут использоваться при экспорте данных
		exportRequestData: null
	},

	controller: 'reportquarter-main',
	viewModel: 'reportquarter-main',

	layout: 'border',

	items: [
		{	// Фильтр
			region: 'north',
			xtype: 'reportquarter-grid-filter'
		}
	]
});
