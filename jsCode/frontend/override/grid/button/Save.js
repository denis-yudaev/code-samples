/**
 * Кнопка сохранения записей в гриде
 * @class App.project.override.grid.button.Save
 */
Ext.define('App.project.override.grid.button.Save', {
	override: 'App.common.grid.button.Save',

	/**
	 * @cfg {Boolean} hotKeyText Текст для обозначения соответствующей «горячей клавиши». Отображается во всплывающей подсказке при наведении на кнопку.
	 */
	hotKeyText: 'Alt+S'

});