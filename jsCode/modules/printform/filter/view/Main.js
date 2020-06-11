/**
 *  Модальное окно с фильтром для печатных форм
 * @class App.project.modules.printform.filter.view.Main
 */
Ext.define( 'App.project.modules.printform.filter.view.Main', {
	extend: 'App.project.modules.printform.filtermodal.view.Window',
	alias:  'widget.printform-filter',

	requires: [
		'App.project.modules.printform.filter.view.FieldContainer'
	],

	config: {
		options:            {},
		oldPlanStore:       null,
		oldPlanExtraParams: null
	},

	resizable:     true,
	resizeHandles: 'e w',
	draggable:     true,
	layout:        'fit',
	width:         470,
	cls:           'project-printform-filter',

	items: [
		{
			xtype:    'form',
			layout:   'column',
			frame:    true,
			width:  '100%',
			title:    false,
			defaults: {
				labelWidth: 170
			},

			items: [

				//  Вариант плана
				{
					xtype:       'fieldset',
					reference:  'planFieldset',
					collapsible: false,
					title:       'План',
					layout:      'anchor',
					cls:    'form-plan-fieldset',

					defaults:    {
						labelWidth: 170,
						anchor:     '100%'
					},

					items: [

					]
				},

				//  Параметры отбора
				{
					xtype:       'fieldset',
					reference:  'mainFieldset',
					hidden: true,
					collapsible: true,
					title:       'Параметры отбора',
					layout:      'anchor',
					cls:    'form-main-fieldset',

					defaults:    {
						labelWidth: 170,
						anchor:     '100%'
					},

					items: [

					]
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
		 *      @param {Object} button кнопка/элемета меню, по которому сработало событие:
		 *      @param {Function} button.filterOptions.showFn  обработчик события "show" окна фильтрации
		 *      @param {Function} button.filterOptions.closeFn  обработчик события "close" окна фильтрации
		 *      @param {Function} button.filterOptions.renderFn обработчик события "render" окна фильтрации
		 *      @param {Ext.menu.Item|Ext.button.Button} button.filterOptions.owner экземпляр нажатой кнопки/пункта
		 *      @param {Array} button.filterOptions.filterParams список параметров фильтрации, которые должны присутствовать в фильтре модального окна
		 *      @param {String} button.filterOptions.title  заголовок окна фильтрации
		 *      @param {Boolean} button.filterOptions.disablePlanSelection  стоит ли отключить стандартный выбор плана для ПФ
		 *      @param {Boolean} button.filterOptions.hidePlanFieldset  стоит ли спрятать блок выбора варианта плана
		 *      @param {Boolean} button.filterOptions.ownerSelector  если кнопка размещена произвольно - можно указать селектор owner'а
		 *
		 * @param {Ext.event.Event} e объект события (при его наличии)
		 * @returns {boolean} false
		 */
		openFilterModal: function(button, e){
			var controller = this.getController() || this.lookupController(),
			    options = button.filterOptions || {},
			    filterWindow;

			options.owner = button;
			options.title = button.filterOptions && button.filterOptions.title || button.text;


			//  если окна с фильтром пока не существует -> создаём его
			if( !controller.getFilterModal() ) {
				filterWindow = Ext.create( 'App.project.modules.printform.filter.view.Main', { options: options || {} } );

				controller.setFilterModal( filterWindow );
			}

			//  устанавливаем на модальном окне фокус
			controller.getFilterModal().focus();

			e && e.stopEvent && e.stopEvent();
			return false;
		}
	},


	closeFn: function(self) {
		var me = this,
		    oldPlanExtraParams = me.getOldPlanExtraParams(),
		    oldPlanStore = me.getOldPlanStore(),
		    options = self.getOptions(),
		    owner = options && options.owner,
		    planComboBeforeloadStoreListener = me.planComboBeforeloadStoreListener;

		oldPlanStore && ( oldPlanStore.getProxy().extraParams = oldPlanExtraParams );
		planComboBeforeloadStoreListener && planComboBeforeloadStoreListener.destroy && planComboBeforeloadStoreListener.destroy();

		owner.requestData && ( delete owner[ 'requestData' ] );

		me.callParent( arguments );
	},


	renderFn: function(self) {
		var me = this,
		    form = self.down('form'),
		    options = self.getOptions(),
		    filterParams = options && options.filterParams,
		    owner = options && options.owner,
		    fieldset = self.down('fieldset[reference=mainFieldset]'),
			panel;

		!owner.requestData && ( owner.requestData = [] );


		if( !(options && options.hidePlanFieldset) )
		{
			//  устанавливаем на кнопку в модальном окне хэндлер, с нажатой ранее кнопки печатного документа
			form.on( 'render', function(form) {
				var ownerPanel = options.ownerSelector ? owner.up('window').down( options.ownerSelector ) : owner.up('tablepanel'),
				planFieldset, planColumn, planYearBegColumn, planComboConfig;


				//  вставляем блок указания варианта плана
				planFieldset = form.down('fieldset[reference=planFieldset]');
				planColumn = ownerPanel.columnManager.getHeaderByDataIndex('plan_var_id');

				planYearBegColumn = Ext.create('App.common.grid.column.Picker', {
					tpl:       '{plan_year_beg}',
					dataIndex: 'plan_year_beg',
					text:      'Год начала планирования',

					//  combobox выбора года
					editor: {
						xtype:         'combo',
						valueField:    'plan_year_beg',
						displayField:  'plan_year_beg',
						triggerAction: 'all',
						allowBlank: true,
						store: null,

						listeners: {
							//  определение исходных данных для комбобокса выбора года
							render: options.disablePlanSelection ?
							        function() {
								        planFieldset.disable();
							        } :
							        function(self) {
								        var planCombo = planColumn && planColumn.getEditor && planColumn.getEditor() || Ext.create( planColumn.initialConfig.editor ),
								            planStore = planCombo.getStore() || planCombo.store,
								            data;

								        me.setOldPlanExtraParams( Ext.clone( planStore.getProxy().extraParams ) );
								        me.setOldPlanStore( planStore );

								        if( planStore )
								        {
									        planStore.load( function(records, operation, success) {
										        data = me.parseYearData( records );
										        self.setStore( self.createStore( data ) );
									        });
								        }
							        }
						},

						createStore: function(data){
							return {
								type:   'store',
								fields: [ { name: 'plan_year_beg' } ],
								data:   data || []
							};
						}

					}

				});


				//  настраиваем комбобокс выбора плана, чтобы он перезагружал стор выпадающего меню
				planComboConfig = Ext.clone( planColumn.initialConfig.editor || planColumn.editor || {} );

				planComboConfig.listeners = planComboConfig.listeners || {};
				planComboConfig.allowBlank = false;
				planComboConfig.listeners.render = function(combo) {
					var picker = combo.getPicker(),
						store = combo.getStore(),
						planValueGetter = ownerPanel.up('window').down().getPlanVarId,
						planValue = planValueGetter && planValueGetter();

					if( planValue ) {
						combo.setValue( planValue );
						store.load();
					}

					//  перед загрузкой стора комбобокса плана - вытягиваем значение года из соседнего комбобокс-контейнера
					me.planComboBeforeloadStoreListener = store.on({
						destroyable: true,
						beforeload: function(store) {
							var extraParams = store.getProxy().getExtraParams(),
							    yearFieldContainer = combo.up('fieldset[reference=planFieldset]').down('printform-filter-fieldcontainer[itemId=plan_year_beg]'),
							    yearValue = yearFieldContainer && yearFieldContainer.getValue(),
							    newCondition = yearValue && yearValue.data,
							    oldCondition;

							if( !newCondition ) {
								return;
							}

							if( extraParams && extraParams.read && ( !extraParams.read.data || !extraParams.read.data.length ) )
							{
								extraParams.read.data = [ newCondition ];
							} else
							{
								oldCondition = Ext.Array.findBy( extraParams.read.data, function(item) { return ( item.name === 'plan_year_beg'); } );

								if( oldCondition ) {
									if(oldCondition.value == newCondition.value) {
										return;
									}

									oldCondition.value = newCondition.value;
								} else {
									extraParams.read.data.push( newCondition );
								}
							}
						}
					});

					picker.on('activate', function(picker) {
						picker.getStore().load();
					});
				};


				planColumn.initialConfig.editor && ( planColumn.initialConfig.editor = planComboConfig ) ||
				planColumn.editor && ( planColumn.editor = planComboConfig );


				planFieldset && planFieldset.add([
					{
						xtype:      'printform-filter-fieldcontainer',
						column: planYearBegColumn,
						allowBlank: true
					},
					{
						xtype:      'printform-filter-fieldcontainer',
						column:     planColumn,
						allowBlank: false
					}
				]);

			});
		}
		else {
			form.down('fieldset[reference=planFieldset]').setHidden( true )
		}

		
		//  если в конфигурации кнопки были указаны необходимые параметры фильтра (filterParams), то соответсвующие
		// им поля будут поочерёдно добавлены на форму фильтра
		if( filterParams && filterParams.length ) {
			filterParams.forEach( function( obj )
			{
				panel = options.ownerSelector ? owner.up('window').down( options.ownerSelector ) : owner.up('tablepanel');

				var column = Ext.clone( panel.columnManager.getHeaderByDataIndex( obj.dataIndex ) ),
					allowBlank = typeof obj.allowBlank === 'boolean' ? obj.allowBlank : true;

				//  для комбобокса структурного классификатора
				if( obj.dataIndex === 'kls_rubrika_struct' ) {
					column.type = 'tree';
				}


				/** Переопределяем признак обязательности заполнения, т.к. для полей, взятых из гриды, этот признак определяется моделью,
				 *  и к фильтру ПФ отношения не имеет. */
				if( column ) {

					column.initialConfig.editor && ( column.initialConfig.editor.allowBlank = allowBlank ) ||
					column.editor && ( column.editor.allowBlank = allowBlank );

					fieldset.add( {
						xtype: 'printform-filter-fieldcontainer',
						column: column,
						allowBlank: allowBlank  //  important!
					} );
				}

			});

			fieldset.setHidden( false );
		}
		

		me.callParent( arguments );
	},

	
	parseYearData: function(records) {
		var data,
		    result = [];

		if( ! ( records && records.length ) ) {
			return [];
		}

		data = Ext.Array.unique(
			  records.map( function(rec) {
				  return rec && rec.data && rec.data.plan_year_beg;
			  } )
		);

		data.forEach( function(value, index) { result[index] = { plan_year_beg: value }; });

		return result;
	},


	handleFilter: function() {
		var me = this,
		    options = me.getOptions(),
		    owner = options && options.owner,
		    handler = owner && owner.handler,
		    form = me.down('form'),
		    fieldContainers = Ext.Array.merge(
		    	  Ext.ComponentQuery.query( 'fieldcontainer[itemId=plan_var_id]', form.down('fieldset[reference=planFieldset]') ),
		    	  Ext.ComponentQuery.query( 'fieldcontainer', form.down('fieldset[reference=mainFieldset]') )
		    ),
		    itemsTotal = fieldContainers.length,
		    itemsLastIndex = itemsTotal - 1,
		    valid = true;

		//  если в фильтре были поля...
		if (itemsTotal) {
			//  для параметров запроса ПФ
			owner.requestData = [];
			//  проверяем все ли обяз. поля заполнены...
			fieldContainers.forEach(function (container, i)
			{
				var field = container.down('field'),
				    value = field.getValue(),
					condition = container.getValue().data;

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

				if( value ) {
					if( owner.requestData && owner.requestData.length ) {
						owner.requestData.forEach( function(item, index) {
							if( item && item.name === condition.name ) {
								Ext.Array.removeAt( owner.requestData, index );
							}
						});
					}

					owner.requestData[ owner.requestData.length ] = condition;
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


	showFn: function(self) {
		//noinspection JSDeprecatedSymbols
		var options = self.getOptions();

		//  прописываем окну титул
		if( options && options.title ) {
			self.setTitle( options.title );
		}
	}


});