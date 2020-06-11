/**
 * Кнопка отмены изменений в гриде
 * @class App.project.override.grid.button.Cancel
 */
Ext.define('App.project.override.grid.button.Cancel', {
	override: 'App.common.grid.button.Cancel',

	/**
	 * @cfg {Boolean} hotKeyText Текст для обозначения соответствующей «горячей клавиши». Отображается во всплывающей подсказке при наведении на кнопку.
	 */
	hotKeyText: 'Atl+C'

});