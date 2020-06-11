/**
 * Окно реестра вариантов отчетов
 * @class App.project.modules.reportquarter.view.registry.Window
 */
Ext.define('App.project.modules.reportquarter.view.registry.Window', {
	extend: 'Ext.window.Window',
	alias: 'widget.reportquarter-registry-window',

	requires: [
		'App.project.modules.reportquarter.view.registry.ViewController',
		'App.project.modules.reportquarter.view.registry.ViewModel',
		'App.project.modules.reportquarter.view.registry.Grid'
	],

	controller: 'reportquarter-registry-controller',
	viewModel: 'reportquarter-registry-viewmodel',

	layout: {
		type: 'fit',
		padding: 5
	},

	width: '80%',
	height: '70%',
	title: 'Реестр вариантов отчетов',

	maximizable: false,
	minimizable: false,
	collapsible: false,
	maximized:   false,
	shadow:      false,
	autoShow:    true,
	border:      true,
	frame:       true,
	modal: true,
	alwaysOnTop: 8,
	resizable:   true,
	draggable:   true,
	plain:       true,

	closable:    true,
	closeAction: 'hide',


	config: {
		parentButton: null
	},


	items: [
		{
			region: 'center',
			xtype:  'reportquarter-registry-grid'
		}
	],


	close: function(self) {
		var owner = this.getConfig('parentButton');

		owner && owner.setRegistryWindow && owner.setRegistryWindow( null );

		this.removeAll();
		this.destroy();
	}



});