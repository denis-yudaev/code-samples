/**
 * Кнопка обновления данных с сервера
 * @class App.project.override.grid.button.Refresh
 */
Ext.define('App.project.override.grid.button.Refresh', {
	override: 'App.common.grid.button.Refresh',

	/**
	 * @cfg {Boolean} hotKeyText Текст для обозначения соответствующей «горячей клавиши». Отображается во всплывающей подсказке при наведении на кнопку.
	 */
	hotKeyText: 'Alt+R'

});