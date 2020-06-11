/**
 *  Колонка для отображения ценовых значений. По-умолчанию допустимо передавать дробное значение с двумя знаками после запятой.
 *  Используем:
 * {
		dataIndex: 'attributeName',
		xtype : 'project-amountcolumn'
	}
 *
 * @class App.project.grid.column.Price
 */
Ext.define('App.project.grid.column.Price', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.project-pricecolumn',

	emptyCellText: '0.00',
	align: 'right',
	format: '0,000.00',

	editor: {
		xtype: 'numberfield',
		decimalPrecision: 2,
		allowDecimals: true,
		hideTrigger: true,
		minValue: 0
	}
	
});