/**
 * Форма создания нового варианта справки в окне фильтра ЭФ
 * @class App.project.modules.reportregion.view.grid.FilterForm
 */
Ext.define('App.project.modules.reportregion.view.grid.FilterForm', {
	extend: 'App.common.form.Panel',
	requires: [
		'App.project.modules.filter.view.FieldContainer'
	],

	alias: 'widget.reportregion-grid-filterform',

	cls: 'project-filterform',

	url: App.constants.API_CREATE,
	method: 'POST',
	clientValidation: true,

	layout: {
		type: 'vbox',
		align: 'begin',
		pack: 'start'
	},

	bodyPadding: '5px',
	border: false,
	title: false,

	fieldDefaults: {
		flex: 1,
		msgTarget: 'side',
		labelWidth: 150,
		padding: 0,
		marginTop: '10px'
	},

	defaults: {
		labelStyle: 'padding-left: 5px; padding-top: 0; vertical-align: middle;',
		inputStyle: 'min-height: 24px;'
	},


	viewModel: {

		formulas: {
			reportRecord: {
				'bind': {
					bindTo: '{phantomRecord}',
					deep: true
				},
				'get': function(record) {
					if ( !record ) {
						record = new App.project.modules.reportregion.model.Report( {
							report_name: null,
							kls_code_type_report: 'REGION'
						} );

						this.set( 'phantomRecord', record );
					}

					return record;
				}
			}
		},

		data: {
			phantomRecord: null
		}
	},


	items: [

		{
			xtype: 'filter-fieldcontainer',
			allowBlank: false,
			column: {
				dataIndex: 'report_year_beg',
				text: 'Год начала отчета',
				editor: {
					xtype: 'numberfield',
					name: 'report_year_beg',
					allowBlank: false,
					decimalPrecision: 0,
					'bind': '{reportRecord.report_year_beg}',
					minValue: App.constants.MIN_YEAR,
					maxValue: App.constants.MAX_YEAR,

					listeners: {
						spin: function(self, dir) {
							self.value || self.setValue( new Date().getFullYear() );
						}
					}
				}
			}
		},

		{
			xtype: 'filter-fieldcontainer',
			allowBlank: true,
			column: {
				dataIndex: 'report_year_end',
				text: 'Год окончания отчета',
				editor: {
					name: 'report_year_end',
					xtype: 'numberfield',
					decimalPrecision: 0,
					'bind': '{reportRecord.report_year_end}',
					minValue: App.constants.MIN_YEAR,
					maxValue: App.constants.MAX_YEAR,

					listeners: {
						spin: function(self, dir) {
							self.value || self.setValue( new Date().getFullYear() );
						}
					}
				}
			}
		},

		{
			xtype: 'filter-fieldcontainer',
			allowBlank: true,
			column: {
				xtype: 'common-pickercolumn',
				dataIndex: 'arr_kls_id_type',
				text: 'Вид работ',
				tpl: '{[ ( values.report_kls_names_type_all ) ? values.report_kls_names_type_all : values.kls_names_type_all ]}',
				variableRowHeight: true,
				editor: {
					name: 'arr_kls_id_type',
					xtype: 'common-tagfield',
					valueField: 'kls_id',
					displayField: 'kls_names',
					forceSelection: false,
					queryCaching: false,
					store: {
						type: 'common-store',
						model: 'App.project.modules.reportregion.model.KlsType'
					}
				}
			}
		},

		{
			xtype: 'filter-fieldcontainer',
			allowBlank: true,
			column: {
				xtype: 'common-pickercolumn',
				dataIndex: 'arr_kls_id_allowance',
				text: 'Довольствующий орган',
				tpl: '{[ ( values.report_kls_names_allowance_all ) ? values.report_kls_names_allowance_all : values.kls_names_allowance_all ]}',
				variableRowHeight: true,
				editor: {
					name: 'arr_kls_id_allowance',
					xtype: 'common-tagfield',
					valueField: 'kls_id',
					displayField: 'kls_names',
					forceSelection: false,
					queryCaching: false,
					store: {
						type: 'common-store',
						model: 'App.project.modules.reportregion.model.KlsAllowance'
					}
				}
			}
		},

		{
			xtype: 'filter-fieldcontainer',
			allowBlank: true,
			column: {
				xtype: 'common-pickercolumn',
				dataIndex: 'arr_kls_id_customer',
				text: 'Заказывающий орган',
				tpl: '{[ ( values.report_kls_names_customer_all ) ? values.report_kls_names_customer_all : values.kls_names_customer_all ]}',
				variableRowHeight: true,
				editor: {
					name: 'arr_kls_id_customer',
					xtype: 'common-tagfield',
					valueField: 'kls_id',
					displayField: 'kls_names',
					forceSelection: false,
					queryCaching: false,
					store: {
						type: 'common-store',
						model: 'App.project.modules.reportregion.model.KlsCustomer'
					}
				}
			}
		},

		{
			xtype: 'filter-fieldcontainer',
			allowBlank: true,
			column: {
				xtype: 'common-pickercolumn',
				dataIndex: 'arr_company_id',
				text: 'Исполнитель',
				tpl: '{[ ( values.report_names_company_all ) ? values.report_names_company_all : values.names_company_all ]}',
				variableRowHeight: true,
				editor: {
					name: 'arr_company_id',
					xtype: 'common-tagfield',
					valueField: 'company_id',
					displayField: 'company_names',
					forceSelection: false,
					queryCaching: false,
					store: {
						type: 'common-store',
						model: 'App.project.modules.reportregion.model.Company'
					}
				}
			}
		},

		{
			xtype: 'filter-fieldcontainer',
			allowBlank: true,
			column: {
				xtype: 'common-pickercolumn',
				dataIndex: 'arr_kls_id_okato',
				text: 'ОКАТО',
				tpl: '{[ ( values.report_kls_names_okato_all ) ? values.report_kls_names_okato_all : values.kls_names_okato_all ]}',
				variableRowHeight: true,
				editor: {
					name: 'arr_kls_id_okato',
					xtype: 'common-tagfield',
					valueField: 'kls_id',
					displayField: 'kls_names',
					forceSelection: false,
					queryCaching: false,
					store: {
						type: 'common-store',
						model: 'App.project.modules.reportregion.model.KlsOkato'
					}
				}
			}
		},

		{
			xtype: 'filter-fieldcontainer',
			allowBlank: true,
			column: {
				xtype: 'common-pickercolumn',
				dataIndex: 'arr_kls_id_struct',
				'bind': '{reportRecord.arr_kls_id_struct}',
				text: 'Раздел ПВ',
				tpl: '{[ ( values.report_kls_names_struct_all ) ? values.report_kls_names_struct_all : values.kls_names_struct_all ]}',
				variableRowHeight: true,
				editor: {
					name: 'arr_kls_id_struct',
					xtype: 'common-tagfield',
					valueField: 'kls_id',
					displayField: 'kls_names',
					forceSelection: false,
					queryCaching: false,
					store: {
						type: 'common-store',
						model: 'App.project.modules.reportregion.model.KlsStruct'
					}
				}
			}
		},

		{
			xtype: 'hiddenfield',
			name: 'kls_code_type_report',
			itemId: 'kls_code_type_report',
			'bind': '{reportRecord.kls_code_type_report}'
		},

		{
			xtype: 'hiddenfield',
			name: 'report_name',
			itemId: 'report_name',
			'bind': '{reportRecord.report_name}'
		}

	],

	buttons: [
		{
			formBind: true,
			text: 'Сформировать',
			scale: 'medium',
			width: '100%',
			disabled: true,
			handler: 'generateNewReport',
			style: {
				margin: '10px auto 0 auto',
				marginLeft: '5px',
				marginRight: '5px',
				left: 0,
				right: 0
			}
		}
	],


	controller: {
		type: 'default',

		control: {

			'reportregion-grid-filterform filter-fieldcontainer': {
				render: 'onFieldContainerRender'
			},

			'reportregion-grid-filterform common-tagfield': {
				select: 'onTagfieldSelect'
			}

		},


		//  формирование списка значений для отображения в облаке меток соответствующего поля
		onTagfieldSelect: function(self, selection) {
			var me            = this,
			    vm            = me.getViewModel(),
			    record        = vm.get( 'reportRecord' ),
			    dataIndex     = self.dataIndex || (self.ownerCt && self.ownerCt.column && self.ownerCt.column.dataIndex),
			    jsonFieldData = App.project.modules.reportregion.view.registry.ViewController.getReportRegionAttributeNames( dataIndex ) || {};

			//  заносим значения в модель
			if ( !selection || !selection.length ) {
				record.set( jsonFieldData.dataIndex, null );
				record.set( jsonFieldData.dynamic, '' );
			} else {
				var dataIdArr    = [],
				    dataNamesArr = [];

				selection.forEach( function(klsRecord) {
					dataIdArr[ dataIdArr.length ] = klsRecord.get( jsonFieldData.valueField || 'kls_id' );
					dataNamesArr[ dataNamesArr.length ] = klsRecord.get( jsonFieldData.displayField || 'kls_names' );
				} );

				record.set( jsonFieldData.dataIndex, dataIdArr );
				record.set( jsonFieldData.dynamic, dataNamesArr.join( ';' ) );
			}
		},


		onFieldContainerRender: function(self) {
			var btn   = self.down( 'filter-conditionbutton' );
			//  прячем кнопки выбора оператора сравнения
			btn && btn.setStyle( 'display', 'none' );
		},


		//  сохраняем новую запись отчёта(справки)
		generateNewReport: function(btn) {
			var me        = this,
			    vm        = me.getViewModel(),
			    view = me.getView(),
			    filterWindow = view.up( 'filter-window' ),
			    record    = vm.get( 'reportRecord' ),
			    data      = record && record.data;


			if ( data && record.phantom && record.isValid() )
			{
				filterWindow.mask();
				record.save( {
					callback: function(rec, operation, success) {
						var filter, mainView, oldGrid;

						if ( success ) {
							vm.set( 'phantomRecord', null );
							filter = filterWindow.getGridFilter();

							if ( filter ) {
								oldGrid = filter.getDataGrid();
								oldGrid && oldGrid.up().remove( oldGrid, true);

								mainView = filter.up( 'reportregion-main' );

								mainView.setReportId( rec.data.report_id );
								mainView.setReportName( rec.data.report_name );
								mainView.setReportYearBeg( rec.data.report_year_beg );
								mainView.setReportYearEnd( rec.data.report_year_end );

								App.apiUI.module.open( 'App.project.modules.reportregion.view.Main', { callback: me.openModuleCallback.bind( me, mainView, rec ) } );
							}
						} else {
							Ext.toastError( operation.getResultSet().getMessage(), 4000, 'tr' );
						}
					}
				} );
			} else
			{
				view.markInvalidFields( record );
			}
		},



		openModuleCallback: function(mainView, record) {
			var me = this,  //  контроллер
			    attributeName = 'report_id',  //  атрибут, значение которого используется для фильтрации
			    rawValueAttributeName = 'report_name', //  атрибут, значение которого используется для отрисовки тэга в фильтре
			    attributeValue = record && record.get( attributeName ),
			    rawValue = record && record.get( rawValueAttributeName ),
			    filterTagName = Ext.Array.findBy( record.getProxy().getReader().metaData, function(item) { return item.name === rawValueAttributeName; } ),
			    condition = App.common.data.prepare.Condition.$eq( attributeName, attributeValue ),  //  условие запроса фильтрации
			    filter = mainView && mainView.down( 'filter-field' ),  //  компонент фильтра
			    tagParams = filter.getTagParams(),
			    targetParam = tagParams && Ext.Array.findBy( tagParams, function(item) { return item.dataIndex === attributeName; } ),
			    newFilterTagParams = targetParam ? [
				    //  если в параметрах фильтрации уже есть необходимый атрибут - меняем соответствующие значения на новые
				    Ext.Object.merge(targetParam, {
					    data:     condition,
					    rawValue: rawValue
				    })
			    ] : [
				    // если нет - создаём новый объект параметров фильтрации
				    {
					    dataIndex: attributeName,
					    name:      filterTagName && filterTagName.text,
					    data:      condition,
					    rawValue:  rawValue
				    }
			    ],
			    searchWindow = filter.getSearchWindow(),
			    reportIdFieldContainer = searchWindow && searchWindow.items.get('report_id'),
			    reportIdCombo = reportIdFieldContainer && reportIdFieldContainer.down('common-combobox'),
			    store = mainView.getViewModel().getStore('reportregionStore'),
			    newGrid;

			reportIdCombo && reportIdCombo.setValue( record );

			newGrid = filter.addDataGrid( mainView );

			filter.setTagParams( newFilterTagParams );
			filter.setDataGrid( newGrid );

			filter.destroyableStoreListener = store.on({
				load: me.onStoreLoadCallback.bind( me, filter, me.getView().up('filter-window') ),
				destroyable: true
			});

			filter.startFiltration();
		},


		destroySearchWindow: function() {
			var me = this,
			    searchWindow = me.getSearchWindow();

			searchWindow && searchWindow.destroy();
			me.setSearchWindow(null);
		},

		refreshGridGrouping: function() {
			var me = this,
			    dataGrid = me.getDataGrid(),
				store = dataGrid.getStore();

			store && store.group( 'kls_names_okato' );
		},

		onStoreLoadCallback: function(filter, registryWindow){
			var me = this;

			if ( filter.destroyableStoreListener ) {
				Ext.destroy( filter.destroyableStoreListener );
				filter.destroyableStoreListener = null;
			}

			registryWindow.unmask();
			registryWindow && registryWindow.close();

			Ext.defer( function() {
				me.destroySearchWindow.bind( filter )();
				me.refreshGridGrouping.bind( filter )();
				Ext.getBody().unmask();
			}, 50 );
		}

	},


	markInvalidFields: function(record) {
		var me = this,
		    form = me.getForm(),
		    validationData = record && record.getValidation().getData();

		Ext.Object.each( validationData, function(attr, text) {
			var field = form.findField( attr );

			if( field && !field.hidden ) {
				if( text.length )
				{
					field.markInvalid( text );
					field.inputEl.dom.setAttribute( 'data-errorqtip', text );
				} else
				{
					field.clearInvalid();
					field.inputEl.dom.removeAttribute( 'data-errorqtip' );
				}
			}
		});

		Ext.toastWarning('Необходимо исправить отмеченные ошибки.', 3500, 'tr');
	}


});
