/**
 *  Компонент меню для кнопки «Печатные формы»
 * @class App.project.modules.printform.filter.view.Menu
 */
Ext.define( 'App.project.modules.printform.filter.view.Menu', {
	extend: 'Ext.menu.Menu',
	alias:  'widget.printform-filter-menu',

	requires: [
		'App.project.modules.printform.filter.view.Main',
		'App.project.menu.Separator',
		'Ext.menu.CheckItem'
	],

	mixins: {
		ctrlControl:   'App.project.mixin.ControllerControl'
	},


	statics: {
		//  селекторы элементов меню, для которых будет вызываться фильтр;
		// указываем в initialConfig'е элемента `filterDisabled` со значением `true`, чтобы отключить функционал для данного элемента...
		getItemsSelector: function(){
			return 'printform-filter-menu [externalParams]:not([filterDisabled=true]):not([forceFilterShow=true]),' +
			       ' printform-filter-menu [filterOptions]:not([filterDisabled=true]):not([forceFilterShow=true])';
		},
		//  селекторы элементов меню, для которых фильтр будет вызываться принудительно всегда
		// для этого указываем в initialConfig'е элемента `forceFilterShow` со значением `true`...
		getForcedFilterItemsSelector: function(){
			return 'printform-filter-menu [externalParams][forceFilterShow=true]:not([filterDisabled=true]),' +
			       ' printform-filter-menu [filterOptions][forceFilterShow=true]:not([filterDisabled=true])';
		}
	},


//  конфигурация элементов отдельных разделов меню
	config: {
		settingsGroup: null,
		mainGroup: null,
		extraGroup: null
	},

	/**
	 *  Допустимые параметры initialConfig'а меню:
	 *
	 * @cfg {string} checkitemText - текст пункта меню с флажком "Вызов окна фильтра перед загрузкой"
	 * @cfg {string} mainGroupText - текст заголовка блока элементов меню "Основные документы"
	 * @cfg {string} extraGroupText - текст заголовка блока элементов меню "Дополнительные документы"
	 */


	initComponent: function() {
		var me = this,
			initConfig = me.initialConfig,
		    //  передаём "пустые" значения, если хотим спрятать блок
			itemGroups = {
				settings: initConfig.settingsGroup || [],  //  по-умолчанию блок отображается
				main: initConfig.mainGroup,
				extra: initConfig.extraGroup
			};

		me.items = [];

		!me._privatesInitiated && me.initPrivates();
		!me._viewControllerInitiated && me.initViewController();

		//  собираем элементы меню
		Ext.Object.each( itemGroups, function( key, array )
		{
			var items = Ext.isObject( array ) ? [ array ] : array,
				generatorMethod = '_create' + Ext.String.capitalize( key ) + 'Group',
				defaultItems = me[ generatorMethod ] && me[ generatorMethod ].call( me ) || [];

			itemGroups[ key ] = Ext.isArray( items ) ? Ext.Array.merge( defaultItems, items ) : [];
			me.items = Ext.Array.merge( me.items, itemGroups[ key ] );
		});

		me.callParent(arguments);
	},


	/**
	 *  Возвращает блок элементов меню "Настройки"
	 * @returns {Array}
	 * @private
	 */
	_createSettingsGroup: function() {
		var me = this,
		    checkitemText = me.initialConfig && me.initialConfig.checkitemText || 'Вызов фильтра перед загрузкой';

		return [

			{   //  заголовок блока «Настройки», с соответствующим текстом
				xtype: 'menuitem-separator',
				text: 'Настройки'
			},

			{   //  Пункт меню с флажком "Вызов окна фильтра перед загрузкой" (текст можно поменять, передав в initialConfig'е `checkitemText`)
				xtype: 'menucheckitem',
				text: checkitemText,
				listeners: {
					checkchange: me.changeFilterRequired
				}
			}

		];
	},


	/**
	 *  Возвращает блок элементов меню "Основные документы", состоящий из заголовка
	 * @returns {Array}
	 * @private
	 */
	_createMainGroup: function() {
		var me = this,
		    mainGroupText = me.initialConfig && me.initialConfig.mainGroupText || 'Основные документы';

		return [
			{   //  заголовок блока «Основные документы» (текст можно изменить свойством initialConfig'а: `mainGroupText`)
				xtype: 'menuitem-separator',
				text: mainGroupText
			}
		];
	},


	/**
	 *  Возвращает блок элементов меню "Дополнительные документы", состоящий из заголовка
	 * @returns {Array}
	 * @private
	 */
	_createExtraGroup: function() {
		var me = this,
		    extraGroupText = me.initialConfig && me.initialConfig.extraGroupText || 'Дополнительные документы';

		return [
			{   //  заголовок блока «Дополнительные документы» (текст можно изменить свойством initialConfig'а: `extraGroupText`)
				xtype: 'menuitem-separator',
				text: extraGroupText
			}
		];
	},


	/**
	 *  Инициализация приватных свойств компонента
	 */
	initPrivates: function() {
		var me = this,
			privateConfig;

		me._privatesInitiated = true;

		//  приватные свойства
		privateConfig = {
			filterRequired: false
		};


		me.changeFilterRequired = function( menuitem, checked, e, opts ) {
			privateConfig.filterRequired = checked;
		};

		me.isFilterRequired = function(){
			return privateConfig.filterRequired;
		};
	},


	/**
	 *  Инициализация контроллера представления
	 */
	initViewController: function() {
		this._viewControllerInitiated = true;

		var me = this,
		    config,
		    control = {};

		control[ App.project.modules.printform.filter.view.Menu.getItemsSelector() ] = {
			click: 'itemClickHandler'
		};
		control[ App.project.modules.printform.filter.view.Menu.getForcedFilterItemsSelector() ] = {
			click: 'forcedItemClickHandler'
		};


		config = {
			filterModal: null,
			getFilterModal: function() {
				return this.initialConfig.filterModal;
			},
			setFilterModal: function( win ) {
				this.initialConfig.filterModal = win;
			},
			//  обработка событий дочерних представлений
			control: control,


			/**
			 * Обработчик кликов по пунктам меню
			 *
			 * @param {Ext.menu.Item} item
			 * @param {Ext.event.Event} event
			 */
			itemClickHandler: function(item, event) {
				if( me.isFilterRequired() ){
					return App.project.modules.printform.filter.view.Main.openFilterModal.apply( me, [ item, event ] );
				}
			},
			/**
			 * Обработчик кликов по пунктам меню с принудительным фильтром
			 *
			 * @param {Ext.menu.Item} item
			 * @param {Ext.event.Event} event
			 */
			forcedItemClickHandler: function(item, event) {
					return App.project.modules.printform.filter.view.Main.openFilterModal.apply( me, [ item, event ] );
			}
		};


		me.controller = Ext.create( 'Ext.app.ViewController', config );
	}


});
