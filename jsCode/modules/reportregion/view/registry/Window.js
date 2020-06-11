/**
 * Окно реестра региональных справок
 * @class App.project.modules.reportregion.view.registry.Window
 */
Ext.define('App.project.modules.reportregion.view.registry.Window', {
	extend: 'Ext.window.Window',
	alias: 'widget.reportregion-registry-window',

	requires: [
		'App.project.modules.reportregion.view.registry.ViewController',
		'App.project.modules.reportregion.view.registry.ViewModel',
		'App.project.modules.reportregion.view.registry.Grid',
		'App.project.modules.reportregion.view.registry.Filter'
	],

	controller: 'reportregion-registry-controller',
	viewModel: 'reportregion-registry-viewmodel',

	layout: 'border',

	width: '80%',
	height: '70%',
	title: 'Реестр региональных справок',

	maximizable: false,
	minimizable: false,
	collapsible: false,
	maximized:   false,
	shadow:      false,
	autoShow:    true,
	border:      true,
	frame:       true,
	modal:       true,
	resizable:   true,
	draggable:   true,
	plain:       true,
	alwaysOnTop:   10,

	closable:    true,
	closeAction: 'hide',


	config: {
		parentButton: null
	},


	items: [
		{
			region: 'north',
			xtype: 'reportregion-registry-filter'
		},
		{
			region: 'center',
			xtype:  'reportregion-registry-grid'
		}
	],

	close: function() {
		var owner = this.getConfig('parentButton');

		owner && owner.setRegistryWindow && owner.setRegistryWindow( null );

		this.removeAll();
		this.destroy();
	}

});