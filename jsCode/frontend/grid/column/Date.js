/**
 *  Колонка даты с дефолтным renderer'ом, отображающим корректное значение ячейки новой строки
 *  Используем:
 * {
		dataIndex: 'attributeName',
		xtype : 'project-datecolumn',
		editor: {
			xtype: 'datefield'
		}
	}
 *
 * @class App.project.grid.column.Date
 */
Ext.define('App.project.grid.column.Date', {
	extend: 'Ext.grid.column.Date',
	alias: 'widget.project-datecolumn',

	emptyCellText: '&nbsp;',


	defaultRenderer: function(value){
		var valueDate = value && ( Ext.typeOf( value ) === 'date' ) ? Ext.util.Format.date( new Date(value), 'Y-m-d' ) : value;
	
		if( value ) {
			value = Ext.util.Format.date( new Date( new Date( valueDate ).getTime() + 43200000 ), this.format );
		}
	
		return value;
	}

});