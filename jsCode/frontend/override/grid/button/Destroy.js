/**
 * Кнопка удаления записей из грида
 * @class App.project.override.grid.button.Destroy
 */
Ext.define('App.project.override.grid.button.Destroy', {
	override: 'App.common.grid.button.Destroy',

	/**
	 * @cfg {Boolean} hotKeyText Текст для обозначения соответствующей «горячей клавиши». Отображается во всплывающей подсказке при наведении на кнопку.
	 */
	hotKeyText: 'Delete'

});