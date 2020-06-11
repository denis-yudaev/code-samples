/**
 * Унифицированный компонент кнопки c выпадающим списком «Печатные формы»
 * @class App.project.modules.printform.filter.view.Split
 */
Ext.define('App.project.modules.printform.filter.view.Split', {
	extend: 'Ext.button.Split',
	alias: 'widget.printform-filter-splitbutton',

	requires: [
		'App.project.modules.printform.filter.view.Menu'
	],

	text: false,
	tooltip: 'Печатные формы',
	scale:   'medium',
	iconCls: 'fa fa-print fa-print-blue',
	cls: 'project-printform-filter-splitbutton',

	menu: {
		xtype: 'printform-filter-menu',
		mainGroup: [],
		extraGroup: []
	},

	/**
	 * showOnHover - передаём true в конфиге для раскрытия меню при наведении..
	 */

	//  необходимо для дальнейшей передачи валидного хэндлера в окно фильтра печатной формы
	listeners: {
		render: function(self) {
			var controller = self.getController() ||  self.lookupController(),
			    fullSelector = App.project.modules.printform.filter.view.Menu.getItemsSelector() + ', ' +
			                   App.project.modules.printform.filter.view.Menu.getForcedFilterItemsSelector(),
			    items = self.query( fullSelector ),
				handler,
			    handlerTpl = function( menuitem ) {
				    controller && controller[ menuitem.initialConfig.handler ]( menuitem );
			    };

			controller && items.length && items.forEach( function(item) {
				if( typeof item.handler === 'string' ) {
					handler = Ext.Function.pass( handlerTpl, item );
					item.handler = handler;
				}
			});
		}
	},


	/** @private {Function} setMenu */
	setMenu: function (menu, destroyMenu, /* private */ initial) {
		var me = this,
		    oldMenu = me.menu;

		if (oldMenu && !initial) {
			if (destroyMenu !== false && me.destroyMenu) {
				oldMenu.destroy();
			}
			oldMenu.ownerCmp = null;
		}

		if (menu) {
			/**  замена дефолтного компонента меню
			 * принимает только объект конфигурации (массив не пойдёт) {@see App.project.modules.printform.filter.view.Menu}
			 */
			if ( !menu.isComponent ) {
				menu = Ext.ComponentManager.create( Ext.apply( {}, menu, { ownerCmp: me } ), 'printform-filter-menu' );
			}

			menu.ownerCmp = me;

			me.mon(menu, {
				scope: me,
				show: me.onMenuShow,
				hide: me.onMenuHide
			});

			if (!oldMenu && me.getArrowVisible()) {
				me.split = true;
				if (me.rendered) {
					me._addSplitCls();
					me.updateLayout();
				}
			}

			me.menu = menu;
		} else {
			if (me.rendered) {
				me._removeSplitCls();
				me.updateLayout();
			}

			me.split = false;
			me.menu = null;
		}
	},

	initComponent: function(){
		var me = this;

		if( me.initialConfig.showOnHover ) {
			me.on('mouseover', function() {
					  var me = this;
					  if (!me.disabled && !me.hasVisibleMenu()) {
						  me.showMenu();
					  }
				  }
			)
		}

		me.callParent(arguments);
	}

});
