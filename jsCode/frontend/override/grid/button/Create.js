/**
 * Кнопка добавления новой записи в гриде
 * @class App.project.override.grid.button.Create
 */
Ext.define('App.project.override.grid.button.Create', {
	override: 'App.common.grid.button.Create',

	/**
	 * @cfg {Boolean} hotKeyText Текст для обозначения соответствующей «горячей клавиши». Отображается во всплывающей подсказке при наведении на кнопку.
	 */
	hotKeyText: 'Atl+Insert'

});