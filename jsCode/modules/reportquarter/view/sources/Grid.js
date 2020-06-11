/**
 * Список отчётов
 * @class App.project.modules.reportquarter.view.sources.Grid
 */
Ext.define('App.project.modules.reportquarter.view.sources.Grid', {
	extend: 'App.project.grid.Panel',
	alias: 'widget.reportquarter-sources-grid',

	'bind': {
		store: '{reportVariants}'
	},

	isPageNavigation: false,

	tbar: [
		{
			xtype: 'common-grid-toolbar'
		}
	],


	columns: [
		{   // Номер строки
			text: '№',
			xtype: 'rownumberer',
			width: 70,
			align: 'center'
		},
		{   // Название плана
			dataIndex: 'report_id_src',
			tpl: '{report_name_src}',
			xtype: 'common-pickercolumn',
			flex: 1,
			sortable: false,
			editor: {
				xtype: 'common-combobox',
				displayField: 'report_name',
				valueField: 'report_id',
				mapping: [
					{
						view: 'report_id_src',
						editor: 'report_id'
					},
					{
						view: 'report_name_src',
						editor: 'report_name'
					}
				],
				pageSize: 20,
				triggerAction: 'all',
				store: {
					type: 'common-store',
					model: 'App.project.modules.reportquarter.model.ReportSourceVar',
					sorters: [
						{
							property: 'report_name',
							direction: 'ASC'
						}
					]
				}
			}
		}
	]
});