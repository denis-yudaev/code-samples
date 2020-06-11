/**
 * Панель инструментов для таблицы
 * @class App.project.modules.reportregion.view.grid.FilterWindowToolbar
 */
Ext.define('App.project.modules.reportregion.view.grid.FilterWindowToolbar', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.reportregion-grid-filterwindow-toolbar',

	requires: [
		'App.project.button.report.OpenRegistry'
	],

	cls: 'new-style-grid-toolbar',

	config: {
		isGeneratorFormToolbar: null
	},

	listeners: {
		render: function(self){
			var apply;

			if( self.getIsGeneratorFormToolbar() ) {
				apply = self.down('[itemId=apply]');
				apply && apply.disable();
			}
		}
	},


	applyHandler: function(self) {
		var me         = self,
		    toolbar = self.up('reportregion-grid-filterwindow-toolbar'),
		    window          = me.up( 'window' ),
		    form = toolbar.getIsGeneratorFormToolbar() ? window.getGeneratorForm() : window.getFilterForm(),
		    stopFilter = false;

		Ext.each( form.items.items, function(fieldContainer, index) {
			if ( !fieldContainer.allowBlank && Ext.isEmpty( fieldContainer.items.items[ 1 ].getValue() ) ) {
				Ext.toastWarning( 'Заполните обязательные поля!', 3000, 'tr' );
				stopFilter = true;
				return false;
			}
		} );

		if ( stopFilter ) {
			return false;
		}

		window.applyToFilter();
	},


	clearHandler: function(self) {
		var me              = self,
		    toolbar = self.up('reportregion-grid-filterwindow-toolbar'),
		    window          = me.up( 'window' ),
		    form = toolbar.getIsGeneratorFormToolbar() ? window.getGeneratorForm() : window.getFilterForm(),
		    fieldcontainers = form.query( 'fieldcontainer' );

		Ext.each( fieldcontainers, function(fieldContainer) {
			window.clearFieldContainer( fieldContainer );
		} );

		window.fireEvent( 'afterClearFilter', me );
	},

	initComponent: function() {
		var me = this;

		me.items = [
			{
				xtype: 'toolbar',
				items: [

					{
						tooltip: 'Применить',
						iconCls: 'x-icon-common-success-medium',
						scale: 'medium',
						itemId: 'apply',
						handler: me.applyHandler
					},
					{
						tooltip: 'Очистить',
						iconCls: 'x-icon-local-clear-medium',
						scale: 'medium',
						itemId: 'clear',
						handler: me.clearHandler
					}
				]
			},

			'-',

			{
				xtype: 'toolbar',
				items: [
					{
						xtype: 'button-report-registry',
						reportRegistryWindowPath: 'App.project.modules.reportregion.view.registry.Window'
					}
				]
			}
		];

		me.callParent( arguments );
	}



});