/**
 * Разделитель пунктов меню
 * @class App.project.menu.Separator
 */
Ext.define('App.project.menu.Separator', {
	extend : 'Ext.menu.Item',
	alias: 'widget.menuitem-separator',

	text: '',
	plain: true,

	cls: 'project-menuitem-separator'
});