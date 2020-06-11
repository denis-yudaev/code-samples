/**
 *  Колонка для указания года, со стандартными параметрами конфигурации
 *  Используем:
 * {
		dataIndex: 'attributeName',
		xtype : 'project-yearcolumn'
	}
 *
 * @class App.project.grid.column.Year
 */
Ext.define('App.project.grid.column.Year', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.project-yearcolumn',

	requires: [
		'App.local.form.field.Year'
	],

	align: 'center',
	flex: 0,
	width: 100,
	editor: {
		xtype: 'local-field-year'
	}

});