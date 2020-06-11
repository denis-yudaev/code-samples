/**
 *  Модальное окно с фильтром для печатных форм
 * @class App.project.modules.printform.filtermodal.view.Window
 */
Ext.define( 'App.project.modules.printform.filtermodal.view.Window', {
	extend: 'Ext.window.Window',
	alias:  'widget.printform-filtermodal-window',

	requires: [
		'App.project.modules.printform.filter.view.FieldContainer'
	],

	title:       'Экспорт данных',
	autoShow:    true,
	width:       450,
	minHeight:   140,
	border:      true,
	frame:       true,
	modal:       true,
	autoScroll:  true,
	alwaysOnTop: 50,
	bodyStyle:   {
		padding: '5px'
	},
	closeAction: 'hide',

	config: {
		/**
		 * @namespace {Object} config конфигурация окна
		 * @deprecated {Array} config.filterParams, вместо него используйте {@see {Array} config.options.filterParams}
		 *
		 * @var {Object} config.options  список параметров фильтрации, которые должны присутствовать в форме модального окна фильтра
		 */
		filterParams: [],
		options: {}
	},

	items: [
		{
			xtype:    'form',
			layout:   'column',
			frame:    true,
			title:    false,
			defaults: {
				labelWidth: '50%'
			},

			items: [

				{
					xtype:       'fieldset',
					collapsible: false,
					title:       'Параметры отбора',
					layout:      'anchor',
					defaults:    {
						labelWidth: '50%',
						anchor:     '100%'
					},
					style:       {
						marginBottom: '50px',
						marginTop:    '10px'
					},

					items: []
				},

				{
					xtype:  'button',
					text:   'Сформировать документ',
					itemId: 'export',
					width:  'auto',
					scale:  'medium'
				}

			]
		}
	],


	statics: {
		/**
		 *  Общий статический метод, предназначенный для вызова модального окна фильтрации ПФ.
		 *  Вешается как обработчик события «click» кнопки/элемета выпадающего списка и т.д. По-умолчанию останавливает стандартную обработку клика...
		 *
		 *  В передаваемой кнопке (первый аргумент данного метода) может быть объявлено свойство «filterOptions» с набором пользовательских параметров,
		 *  которые будут использованы в дальнейшем в логике окна фильтрации. Вот некоторые из уже реализованных параметров:
		 *  @param {Object} button кнопка/элемета меню, по которому сработало событие:
		 *      @param {Function} button.filterOptions.showFn  обработчик события "show" окна фильтрации
		 *      @param {Function} button.filterOptions.closeFn  обработчик события "close" окна фильтрации
		 *      @param {Function} button.filterOptions.renderFn обработчик события "render" окна фильтрации
		 *      @param {Ext.menu.Item|Ext.button.Button} button.filterOptions.owner экземпляр нажатой кнопки/пункта
		 *      @param {Array} button.filterOptions.filterParams список параметров фильтрации, которые должны присутствовать в фильтре модального окна
		 *      @param {String} button.filterOptions.title  заголовок окна фильтрации
		 *
		 * @param {Ext.event.Event} e объект события (при его наличии)
		 * @returns {boolean} false
		 */
		openFilterModal: function(button, e){
			var controller = this.getController() || this.lookupController(),
			    options = button.filterOptions || {},
			    filterWindow;

			options.owner = button;

			//  если окна с фильтром пока не существует -> создаём его
			if( !controller.getFilterModal() ) {
				filterWindow = Ext.create( 'App.project.modules.printform.filtermodal.view.Window', { options: options || {} } );

				controller.setFilterModal( filterWindow );
			}

			//  устанавливаем на модальном окне фокус.
			controller.getFilterModal().focus();

			e && e.stopEvent && e.stopEvent();
			return false;
		}
	},


	/**
	 * Метод инициализации, позволяющий передавать пользовательские параметры (options) в конфигурацию созданного компонента.
	 *
	 * @method constructor
	 */
	initComponent: function(){
		var me = this,
		    options = me.getOptions && me.getOptions(),
		    listenerNames = [ 'showFn', 'closeFn', 'renderFn' ];

		if( options )
		{
			listenerNames.forEach( function(name) {
				var eventName = name.replace('Fn', ''),
				    listener;

				//  вешаем обработчики основных событий
				if( options.hasOwnProperty( name ) )
				{
					listener = Ext.clone( options[ name ] );
					Ext.isFunction( listener ) || ( listener = {
						fn: listener,
						scope: me
					} );

					me.on( eventName, listener );
					delete options[ name ];
				} else {
					me.on( eventName, me[ name ] )
				}
			});
		}

		me.callParent( arguments );
	},


	handleFilter: function() {
		var me = this,
		    options = me.getOptions(),
		    owner = options && options.owner,
		    handler = owner && owner.handler,
		    form = me.down('form'),
		    fieldContainers = Ext.ComponentQuery.query( 'fieldcontainer', form ),
		    itemsTotal = fieldContainers.length,
		    itemsLastIndex = itemsTotal - 1,
		    valid = true;

		//  если в фильтре были поля...
		if (itemsTotal) {
			//  проверяем все ли обяз. поля заполнены...
			fieldContainers.forEach(function (container, i)
			{
				var field = container.down('field'),
				    value = field.getValue();

				/**
				 * @desc  Важно! allowBlank, повешанный на само поле, не работает!
				 *  Необходимо указывать allowBlank в поле для его стилизации, как обязательного, И В САМОМ КОНТЕЙНЕРЕ для осуществления проверки.
				 */
				if (field && !container.allowBlank && !value) {
					//  если есть ошибки - цикл остановится
					Ext.toastWarning('Необходимо заполнить все обязательные поля!');
					valid = false;
					return false;
				}

				//  заполенение параметров для запроса ПФ
				if( ! owner.externalParams ) {
					owner.externalParams = {};
				}
				if( owner.externalParams && ! owner.externalParams.params ) {
					owner.externalParams.params = [];
				}

				if( value ) {
					if( owner.externalParams && owner.externalParams.params && owner.externalParams.params.length ) {
						owner.externalParams.params.forEach( function(item, index) {
							if( item && item.name === container.getValue().data.name ) {
								Ext.Array.removeAt( owner.externalParams.params, index );
							}
						});
					}

					owner.externalParams.params.push(container.getValue().data);
				}

				/**
				 *  продолжаем только после последнего прохода цикла, иначе выбранные значения не попадут в параметры запроса...
				 * @important сохраняем данную проверку в конце обработки цикла "fieldContainers.forEach"
				 */
				if ( i === itemsLastIndex ) {
					//  на случай, если хэндлер передан в виде строки
					if( typeof handler === "string" ) {
						handler = owner.lookupController()[ handler ].apply( owner, [ owner ] );
					}

					valid && handler && handler( owner );
				}
			});
		}
	},


	/**  Дефолтные методы обработки ключевых событий модального окна
	 */

	renderFn: function(self) {
		var form = self.down('form'),
		    handler = self.getOptions().owner.handler;

		form.on( 'render', function(form)
		{
			var exportButton = form.down('button[itemId=export]');
			exportButton && handler && exportButton.setHandler( self.handleFilter, self );
		});

	},

	closeFn: function(self) {
		var me = this,
		    owner = me.getOptions().owner,
		    controller = owner.getController() || owner.lookupController();

		controller && controller.setFilterModal( null );

		self.removeAll();
		self.destroy();
	},

	showFn: function(self) {
		//noinspection JSDeprecatedSymbols
		var options = self.getOptions(),
		    filterParams = options && options.filterParams,
		    owner = options && options.owner;

		if( options.title ) {
			self.setTitle( options.title );
		}


		//  если в конфигурации кнопки были указаны необходимые параметры фильтра (filterParams), то соответсвующие
		// им поля будут поочерёдно добавлены на форму фильтра
		if( filterParams && filterParams.length ) { filterParams.forEach(
			  function( obj )
			  {
				  var column = owner.up('grid').columnManager.getHeaderByDataIndex( obj.dataIndex );

				  column.editor = {
					  xtype:         'common-combo',
					  triggerAction: 'all',
					  width:         '100%',

					  displayField: 'kls_names',
					  valueField: 'kls_id',
					  allowBlank: obj.allowBlank,

					  store: {
						  type:     'common-store',
						  model: obj.model,
						  autoLoad: false
					  }
				  };

				  self.down('form fieldset').insert( 0,
						{
							xtype:      'printform-filter-fieldcontainer',
							column:     column,
							allowBlank: obj.allowBlank //  important!
						});

			  }) }

	}

});