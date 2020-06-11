/**
 *  Колонка для отображения количественных значений. По-умолчанию допустимо передавать дробное значение с одним знаком после запятой.
 *  Используем:
 * {
		dataIndex: 'attributeName',
		xtype : 'project-amountcolumn'
	}
 *
 * @class App.project.grid.column.Amount
 */
Ext.define('App.project.grid.column.Amount', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.project-amountcolumn',

	emptyCellText: '0',
	align: 'right',
	format: '0,000.0',

	editor: {
		xtype: 'numberfield',
		decimalPrecision: 1,
		allowDecimals: true,
		hideTrigger: true,
		minValue: 0
	}

});