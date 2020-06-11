/**
 * Модальное окно выбора источников отчёта
 * @class App.project.modules.reportquarter.view.sources.Main
 */
Ext.define('App.project.modules.reportquarter.view.sources.Main', {
	extend: 'Ext.window.Window',
	alias: 'widget.reportquarter-sources',
	requires:[
		'App.project.modules.reportquarter.model.ReportSource',
		'App.project.modules.reportquarter.model.ReportVar',
		'App.project.modules.reportquarter.model.ReportSourceVar',

		'App.project.modules.reportquarter.view.sources.MainController',
		'App.project.modules.reportquarter.view.sources.Grid'
	],
	mixins: [
		'App.local.mixin.ApiView'
	],

	viewModel: {
		stores: {
			// Список отчётов
			reportVariants: {
				type: 'common-store',
				autoLoad: false,
				model: 'App.project.modules.reportquarter.model.ReportSource'
			}
		},

		data: {
			reportId: null,
			callbackFn: null
		}
	},

	controller: 'reportquarter-sources-controller',


	title: 'Выбор источников',
	width: 700,
	height: 500,
	modal: true,
	layout: 'fit',
	resizable: false,
	collapsible: false,
	minimizable: false,
	maximizable: true,
	draggable: true,
	alwaysOnTop: 35,

	items: {
		xtype: 'reportquarter-sources-grid',
		overflowY: 'auto'
	}
});