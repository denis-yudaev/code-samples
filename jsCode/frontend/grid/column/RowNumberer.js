/**
 *  Колонка таблицы с дефолтным оформленнием под проект, реализующая нумерацию строк
 *  Не требует предварительного включения в `requires`!
 *  Используем:
 *  {
		xtype : 'project-rownumberer'
	}
 *
 * @class App.project.grid.column.RowNumberer
 */
Ext.define('App.project.grid.column.RowNumberer', {
	extend: 'Ext.grid.column.RowNumberer',
	alias: 'widget.project-rownumberer',

	text: '№',

	width: 35,

	editor: false,

	fixed: true,

	flex: 0,

	tdCls: 'x-not-editable-cell',

	align: 'center'

});
