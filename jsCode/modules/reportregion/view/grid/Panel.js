/**
 * Таблица редактироания региональной справки
 * @class App.project.modules.reportregion.view.grid.Panel
 */
Ext.define('App.project.modules.reportregion.view.grid.Panel', {
	extend: 'App.project.grid.Panel',
	alias: 'widget.reportregion-grid-panel',

	requires: [
		'App.project.feature.SummaryGridExt',
		'App.common.features.grid.GroupingGridExt',
		'App.project.modules.reportregion.model.ReportVar',
		'App.local.button.TableColumnWrap',
		'App.project.button.Split',
		'App.local.plugins.Calculator',
		'App.local.form.field.TreeComboBox'
	],

	cls:   'reportregion-grid-panel',

	plugins: [
		{
			ptype: 'local-calculator'
		},
		{
			ptype: 'cellediting'
		}
	],

	'bind': {
		store: '{reportregionStore}'
	},

	viewConfig: {
		getRowClass: function(record) {
			return record && !record.phantom && record.get('locked') ? 'x-grid-row-disabled' : '';
		}
	},


	normalGridConfig: {
		xtype: 'common-grid',
		isLocked: true
	},

	features: [
		{
			ftype: 'summaryGridExt',
			dock: 'top'
		},
		{
			ftype: 'gridGrouping',
			groupers: [
				{
					property: 'kls_names_okato'
				}
			],
			enableGroupingMenu: false,
			groupHeaderTpl: '{name} ({children.length})',
			id: 'reportregionGridGrouping',
			showSummaryRow: true,
			showTooltip: true,
			summaryRowCls: 'project-grid-row-summary',
			summaryRowSelector: '.project-grid-row-summary'
		}
	],

	tbar: {
		cls:   'new-style-grid-toolbar',
		items: [
			{
				xtype: 'toolbar',
				items: [
					{
						xtype: 'common-grid-button-refresh'
					},
					{
						xtype: 'common-grid-button-save',
						'bind': {
							hidden: '{showSpecialSaveButton}'
						}
					},
					{
						xtype: 'app-splitbutton',
						iconCls: 'x-icon-common-save-medium',
						scale: 'medium',
						text: false,
						tooltip: false,
						disabled: false,
						indent: false,
						textAlign: 'right',
						'bind': {
							hidden: '{!showSpecialSaveButton}'
						},
						handler: Ext.emptyFn,

						menu: {
							width: 300,
							bodyPadding: '5px 0 0 0',
							border: false,


							onMouseLeave: function(e) { return; },
							onMouseOver: function(e) { return; },

							layout: {
								type: 'vbox',
								align: 'stretch'
							},

							items: [
								{
									flex: 1,
									labelWidth: 100,
									style: 'margin-left: 0;',
									minLength: 2,
									allowOnlyWhitespace: false,
									validateBlank: true,
									validateOnBlur: true,
									validateOnChange: true,
									labelStyle: 'padding: 5px 5px 0 5px; font-size: 13px;',
									fieldLabel: 'Наименование',
									name: 'report_name',
									xtype: 'textfield',
									allowBlank: false,
									listeners: {
										change: function(self){
											var vm = self.lookupViewModel();
											vm && vm.set( 'specialReportNameFieldIsValid', self.isValid() );
										}
									}
								},

								{
									xtype: 'hiddenfield',
									name: 'report_id',
									'bind': '{mainView.reportId}'
								},

								{
									xtype: 'button',
									flex: 1,
									scale: 'small',
									style: 'margin: 5px 5px 5px 5px; height: 26px;',
									text: 'Сохранить',
									handler: 'updateReport',
									'bind': {
										disabled: '{!specialReportNameFieldIsValid}'
									}

								}
							]
						}
					},
					{
						xtype: 'common-grid-button-cancel'
					}
				]
			},

			'-',

			{
				xtype: 'toolbar',
				items: [
					{
						xtype: 'local-button-tablecolumnwrap'
					},
					{
						xtype: 'button-report-registry',
						reportRegistryWindowPath: 'App.project.modules.reportregion.view.registry.Window'
					}
				]
			},

			'->',

			{
				xtype: 'toolbar',
				items: [
					{
						xtype: 'splitbutton',
						tooltip: 'Печатные формы',
						scale: 'medium',
						iconCls: 'fa fa-print fa-print-blue',

						menu: [
							{
								text:           'Региональная справка',
								iconCls:        'x-icon-common-document-back-small',
								scale:          'small',
								hideOnClick:    true,
								handler:        'handlePrintFormButton'
							}
						],

						handler: function(btn) {
							btn.showMenu();
						}
					}
				]
			}

		]
	},


	initComponent: function(){
		var me = this;

		me.createColumns();

		me.callParent(arguments);
	},


	/**
	 *  Метод создаёт и устанавливает для таблицы колонки
	 */
	createColumns: function() {
		var me = this;

		me.columns = [
				//  скрытые столбцы
				{
					dataIndex: 'report_id',
					text: 'Вариант отчёта',
					xtype: 'common-pickercolumn',
					tpl: '{report_name}',
					hidden: true,
					hideable: false,
					editor: {
						xtype: 'common-combobox',
						displayField: 'report_name',
						triggerAction: 'all',
						valueField: 'report_id',
						store: {
							type: 'common-store',
							model: 'App.project.modules.reportregion.model.ReportVar'
						}
					}
				},

				{
					//  классификатор "Довольствующий орган"
					text: 'Довольствующий орган',
					xtype: 'common-pickercolumn',
					hidden: true,
					hideable: false,
					dataIndex: 'kls_id_allowance',
					tpl: '{kls_names_allowance}',
					width: 115,
					editor: {
						xtype: 'common-combobox',
						displayField: 'kls_names',
						valueField: 'kls_id',
						triggerAction: 'all',
						mapping: [
							{
								view: 'kls_names_allowance',
								editor: 'kls_names'
							},
							{
								view: 'kls_id_allowance',
								editor: 'kls_id'
							}
						],
						store: {
							type: 'common-store',
							model: 'App.project.modules.reportregion.model.KlsAllowance'
						}
					}
				},

				{
					//Классификатор Заказывающий орган
					text: 'Заказывающий орган',
					xtype: 'common-pickercolumn',
					hidden: true,
					hideable: false,
					dataIndex: 'kls_id_customer',
					tpl: '{kls_names_customer}',
					width: 110,
					editor: {
						xtype: 'common-combobox',
						displayField: 'kls_names',
						valueField: 'kls_id',
						triggerAction: 'all',
						mapping: [
							{
								view: 'kls_names_customer',
								editor: 'kls_names'
							},
							{
								view: 'kls_id_customer',
								editor: 'kls_id'
							}
						],
						store: {
							type: 'common-store',
							model: 'App.project.modules.reportregion.model.KlsCustomer'
						}
					}
				},

				{
					text: 'Раздел ПВ',
					type: 'tree',
					xtype: 'common-pickercolumn',
					dataIndex: 'kls_id_struct',
					tpl: '{kls_names_struct}',
					hidden: true,
					hideable: false,
					width: 200,
					editor: {
						triggerAction: 'all',
						allowBlank: true,

						name: 'kls_id_struct',
						xtype: 'local-treecombo',

						valueField: 'kls_id',
						displayField: 'kls_names',

						store: {
							type: 'common-treestore',
							model: 'App.project.modules.reportregion.model.KlsStructTreeModel',
							parentIdProperty: 'kls_id_parent'
						},

						treeConfig: {
							displayField: 'kls_names',
							rootVisible: false,
							root: {
								expanded: true
							},
							minWidth: 525
						}
					}
				},

				// {
				// 	//  классификатор раздела ПВ
				// 	text: 'Раздел ПВ',
				// 	width: 200,
				// 	dataIndex: 'kls_id_struct',
				// 	hidden: true,
				// 	hideable: false,
				// 	tpl: '{kls_names_struct}',
				// 	xtype: 'common-pickercolumn',
				// 	editor: {
				// 		xtype: 'common-combobox',
				// 		allowBlank: true,
				// 		displayField: 'kls_names',
				// 		valueField: 'kls_id',
				// 		triggerAction: 'all',
				// 		mapping: [
				// 			{
				// 				view: 'kls_names_struct',
				// 				editor: 'kls_names'
				// 			}
				// 		],
				// 		store: {
				// 			type: 'common-store',
				// 			model: 'App.project.modules.reportregion.model.KlsStruct'
				// 		}
				// 	}
				// },


				//  нормальные столбцы
				{
					//порядковый номер
					text: '№',
					locked: true,
					width: 35,
					align: 'center',
					xtype: 'rownumberer',
					editor: false
				},


				//  классификатор OKATO
				{
					width: 160,
					dataIndex: 'kls_id_okato',
					text: 'ОКАТО',
					locked: true,
					tpl: '{kls_names_okato}',
					xtype: 'common-pickercolumn',
					readOnly: true,
					editor: {
						xtype: 'common-combobox',
						allowBlank: true,
						displayField: 'kls_names',
						valueField: 'kls_id',
						triggerAction: 'all',
						mapping: [
							{
								view: 'kls_names_okato',
								editor: 'kls_names'
							}
						],
						store: {
							type: 'common-store',
							model: 'App.project.modules.reportregion.model.KlsOkato'
						}
					}
				},


				{
					dataIndex: 'kls_id_type',   //  виды работ
					tpl: '{kls_names_type}',
					minWidth: 60,
					locked: true,
					text: 'Виды работ',
					xtype: 'common-pickercolumn',
					readOnly: true,
					editor: {
						xtype: 'common-combobox',
						displayField: 'kls_names',
						valueField: 'kls_id',
						triggerAction: 'all',
						mapping: [
							{
								view: 'kls_names_type',
								editor: 'kls_names'
							}
						],
						store: {
							type: 'common-store',
							model: 'App.project.modules.reportregion.model.KlsType'
						}
					}
				},

				{
					dataIndex: 'contract_num',  //  Год начала
					align: 'center',
					width: 120,
					locked: true,
					flex: 0,
					readOnly: true,
					editor: {
						xtype: 'textfield'

					},
					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'contract_num_o' } )
				},

				{
					text: 'Дата заключения контракта',
					dataIndex: 'contract_date_beg',
					xtype: 'datecolumn',
					width: 120,
					locked: true,
					flex: 0,
					readOnly: true,
					editor: {
						xtype: 'datefield'

					}
				},

				{
					dataIndex: 'task_fullname',
					width: 120,
					locked: true,
					minWidth: 20,
					readOnly: true,
					editor: {
						xtype: 'textfield'

					},
					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'task_fullname_o' } )
				},

				{
					dataIndex: 'company_names',
					width: 120,
					text: 'Исполнитель',
					minWidth: 20,
					locked: true,
					flex: 0,
					readOnly: true,
					editor: {
						xtype: 'textfield'

					},
					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'company_names_o' } )
				},

				{
					dataIndex: 'kls_names_customer',
					width: 120,
					minWidth: 20,
					flex: 0,
					locked: true,
					readOnly: true,
					editor: {
						xtype: 'textfield'

					},
					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'kls_names_customer_o' } )
				},

				{
					//  Классификатор Заказывающий орган
					text: 'Заказывающий орган',
					xtype: 'common-pickercolumn',
					hidden: true,
					hideable: false,
					dataIndex: 'kls_id_customer',
					tpl: '{kls_names_customer}',
					width: 110,
					editor: {
						xtype: 'common-combobox',
						displayField: 'kls_names',
						valueField: 'kls_id',
						triggerAction: 'all',
						mapping: [
							{
								view: 'kls_names_customer',
								editor: 'kls_names'
							},
							{
								view: 'kls_id_customer',
								editor: 'kls_id'
							}
						],
						store: {
							type: 'common-store',
							model: 'App.project.modules.reportregion.model.KlsCustomer'
						}
					}
				},

				{
					dataIndex: 'report_year_beg',
					width: 130,
					hidden: true,
					hideable: false,
					flex: 0,
					align: 'center',
					editor: {
						xtype: 'numberfield',
						decimalPrecision: 0,
						minValue: App.constants.MIN_YEAR,
						maxValue: App.constants.MAX_YEAR
					}
				},

				{
					'bind': {
						text: '{mainView.reportYearBeg}'
					},
					editor: false,
					columns: [
						// data_price_o
						{
							xtype: 'numbercolumn',
							dataIndex: 'data_price',
							align: 'right',
							width: 120,
							flex: 0,
							format: '0,000.0',
							editor: {
								xtype: 'numberfield',
								decimalPrecision: 26,
								minValue: 0
							},
							renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'data_price_o', defaultValue: '0', format: '0,000.00' } )
						},

						{
							xtype: 'numbercolumn',
							dataIndex: 'payment_sum',
							align: 'right',
							width: 120,
							flex: 0,
							format: '0,000.0',
							editor: {
								xtype: 'numberfield',
								decimalPrecision: 0,
								minValue: 0
							}
						},

						{
							dataIndex: 'execution_percent',
							xtype: 'numbercolumn',
							width: 120,
							align: 'right',
							format: '0,000',
							editor: {
								xtype: 'numberfield',
								decimalPrecision: 0,
								minValue: 0
							},
							renderer: function(value, meta) {
								value > 100 && ( meta.tdAttr += ' data-value-highlighted="red"' );
								return value;
							}
						},

						{
							xtype: 'numbercolumn',
							dataIndex: 'data_price_possible',
							align: 'right',
							width: 130,
							flex: 0,
							format: '0,000.0',
							editor: {
								xtype: 'numberfield',
								decimalPrecision: 0,
								minValue: 0
							}
						}

					]
				},


				{
					text: 'Количество ВВСТ по ведомости исполнения госконтракта, подлежащего поставке в году',
					editor: false,
					columns: [
						{
							xtype: 'numbercolumn',
							dataIndex: 'stage_amount_1',
							align: 'right',
							width: 130,
							flex: 0,
							format: '0,000.0',
							editor: {
								xtype: 'numberfield',
								decimalPrecision: 0,
								minValue: 0
							},

							renderer: me.changedCellRendererFactory.bind( {
								originalAttrName: 'stage_amount_1_o',
								defaultValue: '0',
								format: '0,000.0'
							} )
						},
						{
							xtype: 'numbercolumn',
							dataIndex: 'stage_amount_2',
							align: 'right',
							width: 130,
							flex: 0,
							format: '0,000.0',
							editor: {
								xtype: 'numberfield',
								decimalPrecision: 0,
								minValue: 0
							},
							renderer: me.changedCellRendererFactory.bind( {
								originalAttrName: 'stage_amount_2_o',
								defaultValue: '0',
								format: '0,000.0'
							} )
						},
						{
							xtype: 'numbercolumn',
							dataIndex: 'stage_amount_3',
							align: 'right',
							width: 130,
							flex: 0,
							format: '0,000.0',
							editor: {
								xtype: 'numberfield',
								decimalPrecision: 0,
								minValue: 0
							},
							renderer: me.changedCellRendererFactory.bind( {
								originalAttrName: 'stage_amount_3_o',
								defaultValue: '0',
								format: '0,000.0'
							} )
						},
						{
							xtype: 'numbercolumn',
							dataIndex: 'stage_amount_4',
							align: 'right',
							width: 130,
							flex: 0,
							format: '0,000.0',
							editor: {
								xtype: 'numberfield',
								decimalPrecision: 0,
								minValue: 0
							},
							renderer: me.changedCellRendererFactory.bind( {
								originalAttrName: 'stage_amount_4_o',
								defaultValue: '0',
								format: '0,000.0'
							} )
						},
						{
							text: 'Всего',
							xtype: 'numbercolumn',
							dataIndex: 'stage_amount_all',
							align: 'right',
							width: 130,
							flex: 0,
							readonly: true,
							format: '0,000.0',
							editor: false,
							renderer: me.changedCellRendererFactory.bind( {
								originalAttrName: 'stage_amount_all_o',
								defaultValue: '0',
								format: '0,000.0'
							} )
						}

					]
				},

				{
					xtype: 'numbercolumn',
					dataIndex: 'amount_vp',
					align: 'right',
					width: 130,
					flex: 0,
					format: '0,000.0',
					editor: {
						xtype: 'numberfield',
						decimalPrecision: 0,
						minValue: 0
					}
				},

				{
					xtype: 'numbercolumn',
					dataIndex: 'amount_fact',
					align: 'right',
					width: 130,
					flex: 0,
					format: '0,000.0',
					editor: {
						xtype: 'numberfield',
						decimalPrecision: 0,
						minValue: 0
					}
				},

				{
					dataIndex: 'contract_desc',
					flex: 0,
					minWidth: 200,
					editor: 'textareafield'
				},

				{
					dataIndex: 'problems',
					flex: 0,
					minWidth: 200,
					editor: 'textareafield'
				},

				{
					dataIndex: 'arrangements',
					flex: 0,
					minWidth: 200,
					editor: 'textareafield'
				},

				{
					text: 'Изменено',
					editor: false,
					columns: [
						{
							dataIndex: 'is_changed',
							xtype: 'checkcolumn',
							cls: 'x-item-disabled',
							style: {
								'borderTop': 'none'
							},
							width: 85,
							readonly: true
						},
						{
							dataIndex: 'person_changed_date',
							format: 'd.m.Y',
							editor: false,
							renderer: function(value) { // из "2015-11-24"
								return value ? Ext.util.Format.date( Ext.Date.parse( value, 'Y-m-d' ), 'd.m.Y' ) : '';
							},
							readonly: true
						},
						{
							dataIndex: 'person_fio_changed',
							editor: false,
							readonly: true
						}
					]
				},

				{
					text: 'Проверено',
					editor: false,
					columns: [
						{
							dataIndex: 'is_checked',
							xtype: 'checkcolumn',
							editor: false,
							style: {
								'borderTop': 'none'
							},
							width: 85
						},
						{
							dataIndex: 'person_checked_date',
							format: 'd.m.Y',
							editor: false,
							renderer: function(value) { // из "2015-11-24"
								return value ? Ext.util.Format.date( Ext.Date.parse( value, 'Y-m-d' ), 'd.m.Y' ) : '';
							},
							readonly: true
						},
						{
							dataIndex: 'person_fio_checked',
							editor: false,
							readonly: true
						}
					]
				},

				{
					text: 'Заблокировано',
					editor: false,
					columns: [
						{
							dataIndex: 'is_blocked',
							editor: false,
							xtype: 'checkcolumn',
							style: {
								borderTop: 'none',
								opacity: 1
							},
							width: 85
						},
						{
							dataIndex: 'person_blocked_date',
							format: 'd.m.Y',
							editor: false,
							renderer: function(value) { // из "2015-11-24"
								return value ? Ext.util.Format.date( Ext.Date.parse( value, 'Y-m-d' ), 'd.m.Y' ) : '';
							},
							readonly: true
						},
						{
							dataIndex: 'person_fio_blocked',
							editor: false,
							readonly: true
						}
					]
				}

			];
	},


	forceRenameColumns: {
		company_names: 'Исполнитель',
		payment_sum: 'Оплата от заказчика',
		is_changed: '',
		is_checked: '',
		is_blocked: '',
		person_checked_date: 'Дата',
		person_id_checked: 'Автор',
		person_blocked_date: 'Дата',
		person_id_blocked: 'Автор'
	},

	listeners: {
		cellcontextmenu: 'reportregionGridPanelCellcontextmenu',
		updateColumnsView: function (self, columns) {
			var forceRenameColumns = self.forceRenameColumns,
			    columnsSize = Ext.Object.getSize( forceRenameColumns );

			if( columnsSize ) {
				columns.forEach(function(column) {
					var dataIndex = column && column.dataIndex;
					dataIndex && Ext.isDefined( forceRenameColumns[ dataIndex ] ) && column.setText( forceRenameColumns[ dataIndex ] );
				});
			}
		}
	},


	/*
	 *  Генератор методов для подсветки конкретных ячеек
	 */
	changedCellRendererFactory: function(value, meta, record, rowIdx, colIdx, store, view){
		var me = this,
		    originalAttrName = me.originalAttrName,
		    defaultValue = typeof me.defaultValue === 'undefined' ? '' : me.defaultValue,
		    originalValue = record && !record.phantom && record.get( originalAttrName ),
		    type = me.type;

		if ( value !== originalValue && view.lookupController().getDisplayChanges() ) {
			originalValue = !originalValue && originalValue != 0 ? defaultValue : originalValue;
			meta.tdStyle += ' border: 2px solid #FFF440;';
			meta.tdAttr += ' qtip="' + originalValue + '"';
		}

		if( type && type === 'date' ) {
			return value ? Ext.util.Format.date( value ) : value;
		} else {
			return ( record && !record.phantom && me.format ) ? Ext.util.Format.number( value, me.format ) : value;
		}
	}



});