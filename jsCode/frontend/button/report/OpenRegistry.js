/**
 * Кнопка перехода в реестр отчётов
 * @class App.project.button.report.OpenRegistry
 */
Ext.define('App.project.button.report.OpenRegistry', {

	extend: 'App.common.grid.button.AbstractButton',
	alias: 'widget.button-report-registry',

	text: 'Реестр',
	iconCls : 'fa fa-list-alt',
	cls: 'report-registry-button',

	config: {
		registryWindow: null,
		reportRegistryWindowPath: null
	},

	/**
	 * Открывает окно реестра
	 *
	 * @param {Ext.button.Button} button
	 * @param {Ext.event.Event} e
	 * @return {Boolean} false
	 */
	handler: function( button, e ) {
		var registryWindow = button.getRegistryWindow(),
		    registryWindowPath;

		if( !registryWindow ) {
			//  если окна с реестром пока не существует -> создаём его
			registryWindowPath = button.getReportRegistryWindowPath();
			registryWindow = Ext.create( registryWindowPath, {
				parentButton: button
			} );

			button.setRegistryWindow( registryWindow );
		}

		//  устанавливаем на модальном окне фокус
		registryWindow.focus();

		e.stopEvent();
		return false;
	}

});