/**
 * Таблица редактироания квартального отчёта
 * @class App.project.modules.reportquarter.view.grid.Panel
 */
Ext.define( 'App.project.modules.reportquarter.view.grid.Panel', {
	extend: 'App.project.grid.Panel',
	alias: 'widget.reportquarter-grid-panel',

	requires: [
		// 'App.common.features.grid.GroupingGridExt',
		'App.project.modules.reportquarter.model.ReportVar',
		'App.project.modules.printform.filter.view.Split',

		'App.project.grid.column.Amount',
		'App.project.grid.column.Price',

		'App.project.modules.dataimport.view.DataImportButton',

		'App.project.modules.reportquarter.model.ContextMenuReportVar'
	],
	plugins: [
		{
			ptype: 'cellediting'
		},
		{
			ptype: 'local-deferredupdate'
		}
	],

	config: {
		groupingFeature: null,

		//  контейнер для контекстного меню
		contextMenu: null
	},

	viewConfig: {
		getRowClass: function(record) {
			return record && !record.phantom && record.get( 'locked' ) ? 'x-grid-row-disabled' : '';
		}
	},

	selModel: {
		mode: 'MULTI'
	},

	'bind': {
		store: '{reportquarterStore}'
	},

	tbar: {
		cls: 'new-style-grid-toolbar',
		items: []
	},

	forceRenameColumns: {
		kls_rubrika_struct: 'Раздел ПВ',
		kls_id_struct: 'Раздел ПВ',
		kls_names_struct: 'Раздел ПВ',
		payment_sum: 'Всего',
		payment_sum_advance: 'В том числе выплачено авансов',
		is_changed: '',
		is_checked: '',
		is_blocked: '',
		person_checked_date: 'Дата',
		person_id_checked: 'Автор',
		person_blocked_date: 'Дата',
		person_id_blocked: 'Автор',
		company_address: 'Дислокация головного исполнителя'
	},


	listeners: {
		updateColumnsView: function(self, columns) {
			var forceRenameColumns = self.forceRenameColumns,
			    columnsSize        = Ext.Object.getSize( forceRenameColumns );

			if ( columnsSize ) {
				columns.forEach( function(column) {
					var dataIndex = column && column.dataIndex;
					dataIndex && Ext.isDefined( forceRenameColumns[ dataIndex ] ) && column.setText( forceRenameColumns[ dataIndex ] );
				} );
			}
		}
	},


	initComponent: function() {
		var me = this;

		me.createColumns();

		me.createTbarItems();

		me.callParent( arguments );
	},


	/*
	 *  Генератор методов для подсветки конкретных ячеек
	 */
	changedCellRendererFactory: function(value, meta, record, rowIdx, colIdx, store, view) {
		var me               = this,
		    originalAttrName = me.originalAttrName,
		    defaultValue     = typeof me.defaultValue === 'undefined' ? '' : me.defaultValue,
		    originalValue    = record && !record.phantom && record.get( originalAttrName ),
		    type             = me.type;

		if ( value !== originalValue && view.lookupController().getDisplayChanges() ) {
			originalValue = !originalValue && originalValue != 0 ? defaultValue : originalValue;
			meta.tdStyle += ' border: 2px solid #FFF440;';
			meta.tdAttr += ' qtip="' + originalValue + '"';
		}

		if ( type && type === 'date' ) {
			return value ? Ext.util.Format.date( value ) : value;
		} else {
			return ( record && !record.phantom && me.format ) ? Ext.util.Format.number( value, me.format ) : value;
		}
	},


	createTbarItems: function() {
		var me       = this,
		    main     = me.up( 'reportquarter-main' ),
		    reportId = main.getReportId();

		me.tbar.items = [
			{
				xtype: 'toolbar',
				items: [
					{
						xtype: 'common-grid-button-refresh'
					},
					{
						xtype: 'common-grid-button-save'
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
						xtype: 'common-grid-button-create',
						addOnTop: true
					},

					{
						xtype: 'common-grid-button-destroy'
					},

					//  скрытая кнопка импорта данных
					{
						xtype: 'dataimport-button',
						itemId: 'dataimportMainButton',
						hidden: true,

						//  конфигурационные параметры:
						parentGridAlias: 'reportquarter-grid-panel',

						callbackFn: function() {
							var grid  = main.down( 'reportquarter-grid-panel' ),
							    store = grid.getStore();

							store && store.load();
						},


						initialConditions: {
							report_id: reportId
						},

						baseParams: {
							method: 'run',
							object: 'import',

							data: {
								request: [
									{
										object: 'rpt.report',
										method: 'rpt.report_s',
										metaData: 'rpt.report_s_main',
										data: [
											App.common.data.prepare.Condition.$eq( 'kls_code_type_report', 'QUARTER' ),
											App.common.data.prepare.Condition.$eq( 'report_id', reportId )
										],
										limit: 1
									}
								],
								template: 'report_quarter',
								innerMethods: {
									object_source: 'rpt.report_quarter',
									insert_source: 'rpt.report_quarter_i',
									metaData_source: 'rpt.report_quarter_i_main',

									object: 'rpt.report_quarter',
									'import': 'rpt.report_quarter_s',
									metaData: 'rpt.report_quarter_s_main'
								},
								params: {
									modelName: 'quarterReport'
								}
							}
						}
					},

					{
						xtype: 'printform-filter-splitbutton',
						tooltip: 'Импорт/Экспорт данных',
						iconCls: 'fa fa-cloud-upload fa-cloud-upload-blue',
						scale: 'medium',
						defaults: {
							margin: '0 8 0 8'
						},
						handler: function(btn) {
							btn.hasVisibleMenu() || btn.showMenu();
						},

						menu: {
							mainGroupText: 'Импорт',
							extraGroupText: 'Экспорт',

							mainGroup: [
								// импорт данных
								{
									text: 'Импорт данных',
									scale: 'small',
									hideOnClick: true,

									handler: function(menuitem) {
										var split      = menuitem.up( 'printform-filter-splitbutton' ),
										    controller = split.lookupController();

										controller && controller.beginImport && controller.beginImport.bind( controller )( menuitem );
									}
								},

								{
									text: 'Выгрузка шаблона',
									tooltip: 'Выгрузить шаблон импорта данных по квартальным отчётам',
									iconCls: 'x-icon-common-export-excel-small',
									scale: 'small',
									hideOnClick: true,

									handler: function(menuitem) {
										var split      = menuitem.up( 'printform-filter-splitbutton' ),
										    controller = split.lookupController();

										controller && controller.downloadTemplate && controller.downloadTemplate.bind( controller )( menuitem );
									},

									filterDisabled: true,

									externalParams: {
										template: 'report_quarter',
										filename: 'Шаблон импорта данных для квартальных отчётов.ods'
									}
								}

							],


							extraGroup: [

								{
									text: 'Экспорт табличных данных',
									iconCls: 'x-icon-common-export-excel-small',
									scale: 'small',
									hideOnClick: true,

									externalParams: {
										object: 'export',
										method: 'run',
										template: 'report-export',
										filename: 'Экспорт данных квартальных отчётов.ods'
									},

									filterDisabled: true,

									handler: function(menuitem) {
										var split      = menuitem.up( 'reportquarter-main' ),
										    controller = split.getController();

										controller
										&& controller.handleExportTableButton
										&& controller.handleExportTableButton.bind( controller )( menuitem );
									}
								}

							],

							//  отключаем дефолтный функционал добавления флажка вызова фильтра ПФ блока "Настройки"
							_createSettingsGroup: function() {
								return [];
							}

						},


						controller: {
							type: 'default',


							downloadTemplate: function(menuitem) {
								new App.common.form.Panel( {
									standardSubmit: true,
									url: App.constants.API_CREATE( 'ods' ),
									baseParams: {
										object: 'import',
										method: 'downloadTemplateWithoutRequest',
										data: {
											template: menuitem.externalParams.template,
											filename: menuitem.externalParams.filename,
											params: {}
										}
									}
								} ).submit( {
									waitMsg: false
								} );
							},


							beginImport: function(menuitem) {
								var importButton          = menuitem.up( 'reportquarter-grid-panel' ).down( 'dataimport-button' ),
								    importButtonFilefield = importButton.form.down( 'filefield' );

								importButtonFilefield && importButtonFilefield.fileInputEl.dom.click();
							}
						}
					}

				]
			},

			'-',

			{
				xtype: 'toolbar',
				items: [
					{
						tooltip: 'Режим отображения',
						iconCls: 'fa fa-gear radiofield-fa-gear',
						scale: 'medium',
						xtype: 'splitbutton',
						menu: {
							defaults: {
								xtype: 'checkbox',
								margin: '0 8 0 8',
								checked: false
							},
							items: [
								{
									text: 'Группировка',
									style: {
										fontStyle: 'italic',
										textAlign: 'center'
									},
									xtype: 'menuitem-separator',
									margin: 0
								},
								{
									text: 'Назначить группировку',
									margin: 0,
									xtype: 'menuitem',
									menu: {
										shadow: 'sides',
										height: 140,
										shadowOffset: 4,

										items: [
											{
												xtype: 'form',
												title: false,
												items: [
													{
														xtype: 'radiogroup',
														cls: 'gridGroupingType',
														defaults: {
															margin: '2 8 2 8',
															name: 'groupField'
														},
														vertical: true,
														columns: 1,
														items: [
															{
																boxLabel: 'по виду работ',
																inputValue: 'kls_rubrika_type'
															},
															{
																boxLabel: 'по программе вооружения',
																inputValue: 'kls_rubrika_struct'
															},
															{
																boxLabel: 'по довольствующему органу',
																inputValue: 'kls_rubrika_allowance'
															},
															{
																boxLabel: 'по заказывающему органу',
																inputValue: 'kls_rubrika_customer'
															},
															{
																boxLabel: 'отключить группировку',
																inputValue: 'nogroup'
															}
														],
														listeners: {
															change: 'changeGridGroupingTypeEvent'
														},
														value: 'kls_rubrika_struct'
													}
												]
											}
										]
									}

								},
								{
									text: 'Настройки',
									style: {
										fontStyle: 'italic',
										textAlign: 'center'
									},
									xtype: 'menuitem-separator',
									margin: 0
								},
								{
									boxLabel: 'Развернуть строки',
									xtype: 'checkbox',
									margin: '0 8 0 8',
									name: 'typeDisplay',
									checked: false,
									handler: function(view, checked) {
										var grid;
										grid = view.up( 'grid' );
										grid && grid.setWrapColumns && grid.setWrapColumns( checked );
									}
								}
							]
						}
					},

					{
						xtype: 'button-report-registry',
						reportRegistryWindowPath: 'App.project.modules.reportquarter.view.registry.Window'
					}
				]
			},

			'->',

			{
				xtype: 'toolbar',
				items: [

					{
						xtype: 'printform-filter-splitbutton',

						controller: {
							type: 'default',

							handle1nSpRp: function(/*menuitem*/) {
								var me          = this,
								    mainPanel   = me.getView().up( 'reportquarter-main' ),
								    reportId    = mainPanel.getReportId(),
								    requestData = reportId ? [ App.common.data.prepare.Condition.$eq( 'report_id', reportId ) ] : [],

								    form        = new App.common.form.Panel( {
									    standardSubmit: true,
									    url: App.constants.API_CREATE(),
									    baseParams: {
										    object: 'export',
										    method: 'run',
										    data: {
											    request: [
												    {
													    object: 'rpt.report',
													    method: 'rpt.pf_1n_spir_s',
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.report_s',
													    data: requestData
												    }
											    ],
											    filename: '1Н-закупки (1Н-ремонт).ods',
											    template: '1n-sp(1n-rp)'
										    }
									    }
								    } );

								form.submit( {
									waitMsg: false
								} );
							},


							handle1nSpRpDgoz: function(/*menuitem*/) {
								var me          = this,
								    mainPanel   = me.getView().up( 'reportquarter-main' ),
								    reportId    = mainPanel.getReportId(),
								    requestData = reportId ? [ App.common.data.prepare.Condition.$eq( 'report_id', reportId ) ] : [],

								    form        = new App.common.form.Panel( {
									    standardSubmit: true,
									    url: App.constants.API_CREATE(),
									    baseParams: {
										    object: 'export',
										    method: 'run',
										    data: {
											    request: [
												    {
													    object: 'rpt.report',
													    method: 'rpt.pf_1n_spir_s',
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.report_s',
													    data: requestData
												    }
											    ],
											    filename: '1Н-закупки(1Н-ремонт)-ДГОЗ.ods',
											    template: '1n-sp(1n-rp)-dgoz'
										    }
									    }
								    } );

								form.submit( {
									waitMsg: false
								} );
							},


							handle1nSpRpZO: function(/*menuitem*/) {
								var me          = this,
								    mainPanel   = me.getView().up( 'reportquarter-main' ),
								    reportId    = mainPanel.getReportId(),
								    requestData = reportId ? [ App.common.data.prepare.Condition.$eq( 'report_id', reportId ) ] : [],

								    form        = new App.common.form.Panel( {
									    standardSubmit: true,
									    url: App.constants.API_CREATE(),
									    baseParams: {
										    object: 'export',
										    method: 'run',
										    data: {
											    request: [
												    {
													    object: 'rpt.report_quarter',
													    method: 'rpt.report_quarter_s',
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.report_s',
													    data: requestData
												    }
											    ],
											    filename: '1Н-закупки(1Н-ремонт)-ЗО.ods',
											    template: '1n-sp(1n-rp)-zo'
										    }
									    }
								    } );

								form.submit( {
									waitMsg: false
								} );
							},


							handle1nNiokrZO: function(/*menuitem*/) {
								var me          = this,
								    mainPanel   = me.getView().up( 'reportquarter-main' ),
								    reportId    = mainPanel.getReportId(),
								    requestData = reportId ? [ App.common.data.prepare.Condition.$eq( 'report_id', reportId ) ] : [],

								    form        = new App.common.form.Panel( {
									    standardSubmit: true,
									    url: App.constants.API_CREATE(),
									    baseParams: {
										    object: 'export',
										    method: 'run',
										    data: {
											    request: [
												    {
													    object: 'rpt.report_quarter',
													    method: 'rpt.report_quarter_s',
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.report_s',
													    data: requestData
												    }
											    ],
											    filename: '1Н-НИОКР-ЗО.ods',
											    template: '1n-niokr-zo'
										    }
									    }
								    } );

								form.submit( {
									waitMsg: false
								} );
							},


							handle1nNiokr: function(/*menuitem*/) {
								var me          = this,
								    mainPanel   = me.getView().up( 'reportquarter-main' ),
								    reportId    = mainPanel.getReportId(),
								    requestData = reportId ? [ App.common.data.prepare.Condition.$eq( 'report_id', reportId ) ] : [],

								    form        = new App.common.form.Panel( {
									    standardSubmit: true,
									    url: App.constants.API_CREATE(),
									    baseParams: {
										    object: 'export',
										    method: 'run',
										    data: {
											    request: [
												    {
													    object: 'rpt.report',
													    method: 'rpt.pf_1n_niokr_s',
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.report_s',
													    data: requestData
												    }
											    ],
											    filename: '1Н-НИОКР.ods',
											    template: '1n-niokr'
										    }
									    }
								    } );

								form.submit( {
									waitMsg: false
								} );
							},


							handle2aSpir: function(/*menuitem*/) {
								var me          = this,
								    mainPanel   = me.getView().up( 'reportquarter-main' ),
								    reportId    = mainPanel.getReportId(),
								    requestData = reportId ? [ App.common.data.prepare.Condition.$eq( 'report_id', reportId ) ] : [],

								    form        = new App.common.form.Panel( {
									    standardSubmit: true,
									    url: App.constants.API_CREATE(),
									    baseParams: {
										    object: 'export',
										    method: 'run',
										    data: {
											    request: [
												    {
													    object: 'rpt.report',
													    method: 'rpt.pf_2a_spir_1_s', //  ПФ 2А-Закупки(Ремонт) (1) - контрольные суммы
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.pf_2a_spir_2_s', //  ПФ 2А-Закупки(Ремонт) (2) - суммы по разделам
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.pf_2a_spir_3_s', //  ПФ 2А-Закупки(Ремонт) (3) - нижний уровень
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.report_s',
													    data: requestData
												    }
											    ],
											    filename: '2А-закупки (2А-ремонт).ods',
											    template: '2a-spir'
										    }
									    }
								    } );

								form.submit( {
									waitMsg: false
								} );
							},


							handle2aNiokr: function(/*menuitem*/) {
								var me          = this,
								    mainPanel   = me.getView().up( 'reportquarter-main' ),
								    reportId    = mainPanel.getReportId(),
								    requestData = reportId ? [ App.common.data.prepare.Condition.$eq( 'report_id', reportId ) ] : [],

								    form        = new App.common.form.Panel( {
									    standardSubmit: true,
									    url: App.constants.API_CREATE(),
									    baseParams: {
										    object: 'export',
										    method: 'run',
										    data: {
											    request: [
												    {
													    object: 'rpt.report',
													    method: 'rpt.pf_2a_niokr_1_s', //  ПФ 2А-НИОКР (1) - контрольные суммы
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.pf_2a_niokr_2_s', //  ПФ 2А-НИОКР (2) - суммы по разделам
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.pf_2a_niokr_3_s', //  ПФ 2А-НИОКР (3) - нижний уровень
													    data: requestData
												    },
												    {
													    object: 'rpt.report',
													    method: 'rpt.report_s',
													    data: requestData
												    }
											    ],
											    filename: '2А-НИОКР.ods',
											    template: '2a-niokr'
										    }
									    }
								    } );

								form.submit( {
									waitMsg: false
								} );
							}

						},

						menu: {
							mainGroup: [
								{
									text: '1Н-закупки (1Н-ремонт)',
									tooltip: 'Сформировать печатный документ по форме «1Н-закупки (1Н-ремонт)»',
									iconCls: 'x-icon-common-export-excel-small',
									scale: 'small',
									hideOnClick: true,

									filterOptions: { /*  свойство необходимо, чтобы система правильно опознавала пункт меню...*/ },

									handler: 'handle1nSpRp'
								},
								{
									text: '1Н-закупки (1Н-ремонт)-ДГОЗ',
									tooltip: 'Сформировать печатный документ по форме «1Н-закупки (1Н-ремонт)»',
									iconCls: 'x-icon-common-export-excel-small',
									scale: 'small',
									hideOnClick: true,

									filterOptions: { /*  свойство необходимо, чтобы система правильно опознавала пункт меню...*/ },

									handler: 'handle1nSpRpDgoz'
								},
								{
									text: '1Н-НИОКР',
									tooltip: 'Сформировать печатный документ по форме «1Н-НИОКР»',
									iconCls: 'x-icon-common-export-excel-small',
									scale: 'small',
									hideOnClick: true,
									filterOptions: { /*  свойство необходимо, чтобы система правильно опознавала пункт меню...*/ },

									handler: 'handle1nNiokr'
								},
								{
									text: '2А-закупки (2А-ремонт)',
									tooltip: 'Сформировать печатный документ по форме «2А-закупки (2А-ремонт)»',
									iconCls: 'x-icon-common-export-excel-small',
									scale: 'small',
									hideOnClick: true,

									filterOptions: { /*  свойство необходимо, чтобы система правильно опознавала пункт меню...*/ },

									handler: 'handle2aSpir'
								},
								{
									text: '2А-НИОКР',
									tooltip: 'Сформировать печатный документ по форме «2А-НИОКР»',
									iconCls: 'x-icon-common-export-excel-small',
									scale: 'small',
									hideOnClick: true,

									filterOptions: { /*  свойство необходимо, чтобы система правильно опознавала пункт меню...*/ },

									handler: 'handle2aNiokr'
								}
							],

							//  заказывающие органы
							extraGroupText: 'Заказывающие органы',

							extraGroup: [
								{
									text: '1Н-закупки(1Н-ремонт)-ЗО',
									tooltip: 'Сформировать печатный документ по форме «1Н-закупки (1Н-ремонт)»',
									iconCls: 'x-icon-common-export-excel-small',
									scale: 'small',
									hideOnClick: true,

									filterOptions: { /*  свойство необходимо, чтобы система правильно опознавала пункт меню...*/ },

									handler: 'handle1nSpRpZO'
								},
								{
									text: '1Н-НИОКР-ЗО',
									tooltip: 'Сформировать печатный документ по форме «1Н-НИОКР»',
									iconCls: 'x-icon-common-export-excel-small',
									scale: 'small',
									hideOnClick: true,

									filterOptions: { /*  свойство необходимо, чтобы система правильно опознавала пункт меню...*/ },

									handler: 'handle1nNiokrZO'
								}
							],


							//  отключаем дефолтный функционал добавления флажка вызова фильтра ПФ блока "Настройки"
							_createSettingsGroup: function() {
								return [];
							}
						}

					}
				]
			}

		];

	},


	/**
	 *  Метод создаёт и устанавливает для таблицы колонки
	 */
	createColumns: function() {
		var me = this;

		me.columns = {
			items: [
				// {
				// 	dataIndex: 'grouping_field',
				// 	editor: false,
				// 	hidden: true,
				// 	hideable: false,
				// 	locked: true/*,
				// 	renderer: function(value, meta, record) {
				// 		var data = record && record.data;
				// 		return data && data.kls_names_struct || 'Не классифицировано';
				// 	}*/
				// },

				{
					dataIndex: 'kls_rubrika_type',
					hidden: true,
					editor: false,
					locked: true,
					hideable: false,
					renderer: function(value, meta, record) {
						var data = record && record.data;
						return data && data.kls_names_type || 'Не классифицировано';
					}
				},
				{
					dataIndex: 'kls_rubrika_struct',
					hidden: true,
					editor: false,
					locked: true,
					hideable: false,
					renderer: function(value, meta, record) {
						var data = record && record.data;
						return data && data.kls_names_struct || 'Не классифицировано';
					}
				},
				{
					dataIndex: 'kls_rubrika_allowance',
					hidden: true,
					editor: false,
					locked: true,
					hideable: false,
					renderer: function(value, meta, record) {
						var data = record && record.data;
						return data && data.kls_names_allowance || 'Не классифицировано';
					}
				},
				{
					dataIndex: 'kls_rubrika_customer',
					hidden: true,
					editor: false,
					locked: true,
					hideable: false,
					renderer: function(value, meta, record) {
						var data = record && record.data;
						return data && data.kls_names_customer || 'Не классифицировано';
					}
				},


				// {
				// 	dataIndex: 'kls_names_struct',
				// 	hidden: true,
				// 	locked: true,
				// 	hideable: false
				// },


				{
					dataIndex: 'report_id',
					text: 'Вариант отчёта',
					xtype: 'common-pickercolumn',
					hidden: true,
					hideable: false,
					editor: {
						xtype: 'common-combobox',
						displayField: 'report_name',
						valueField: 'report_id',
						store: {
							type: 'common-store',
							model: 'App.project.modules.reportquarter.model.ReportVar'
						}
					}
				},

				{
					dataIndex: 'report_year_beg',  //  Год начала
					align: 'center',
					width: 100,
					hidden: true,
					hideable: false,
					flex: 0,
					editor: {
						xtype: 'numberfield',
						decimalPrecision: 0,
						minValue: App.constants.MIN_YEAR,
						maxValue: App.constants.MAX_YEAR
					}
				},

				{
					xtype: 'common-pickercolumn',
					tpl: 'report_quarter',
					hidden: true,
					hideable: false,
					dataIndex: 'report_quarter',
					text: 'Квартал',

					editor: {
						xtype: 'combo',
						valueField: 'report_quarter',
						displayField: 'name',
						triggerAction: 'all',
						allowBlank: false,
						store: {
							type: 'store',
							fields: [
								{
									name: 'name',
									type: 'string'
								},
								{
									name: 'report_quarter',
									type: 'int'
								}
							],
							data: [
								{
									name: '1 квартал',
									report_quarter: 1
								},
								{
									name: '2 квартал',
									report_quarter: 2
								},
								{
									name: '3 квартал',
									report_quarter: 3
								},
								{
									name: '4 квартал',
									report_quarter: 4
								}
							]
						}
					}
				},


				//порядковый номер
				{
					xtype: 'project-rownumberer'
				},

				// {
				// 	dataIndex: 'kls_names_type',
				// 	width: 120,
				// 	minWidth: 20,
				// 	editor: 'textfield',
				// 	locked: true,
				// 	renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'kls_names_type_o' } )
				// },
				{
					dataIndex: 'kls_id_type',   //  виды работ
					tpl: '{kls_names_type}',
					minWidth: 90,
					locked: true,
					xtype: 'common-pickercolumn',
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
							model: 'App.project.modules.reportquarter.model.KlsType'
						}
					}
				},

				{
					editor: 'textfield',  //  Наименование работы
					dataIndex: 'task_code',
					locked: true,
					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'task_code_o' } )
				},


				{
					editor: 'textfield',  //  Наименование работы
					dataIndex: 'task_name',
					locked: true,
					minWidth: 20,
					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'task_name_o' } )
				},

				{
					dataIndex: 'task_year_beg',  //  Год начала
					align: 'center',
					locked: true,
					width: 82,
					flex: 0,
					editor: {
						xtype: 'local-field-year'
					}
				},

				{
					dataIndex: 'task_year_end',  //  Год окончания
					align: 'center',
					locked: true,
					width: 82,
					flex: 0,
					editor: {
						xtype: 'local-field-year'
					}
				},

				{
					//Классификатор Заказывающий орган
					text: 'Заказывающий орган',
					xtype: 'common-pickercolumn',
					hidden: true,
					locked: true,
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
							model: 'App.project.modules.reportquarter.model.KlsCustomer'
						}
					}
				},

				{
					//Классификатор Довольствующий орган
					text: 'Довольствующий орган',
					xtype: 'common-pickercolumn',
					hidden: true,
					locked: true,
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
							model: 'App.project.modules.reportquarter.model.KlsAllowance'
						}
					}
				},

				{
					text: 'Раздел ПВ',
					type: 'tree',
					xtype: 'common-pickercolumn',
					dataIndex: 'kls_id_struct',
					tpl: '{kls_names_struct}',
					width: 110,
					editor: {
						xtype: 'local-treecombo',
						triggerAction: 'all',
						name: 'kls_id_struct',
						valueField: 'kls_id',
						displayField: 'kls_names',
						mapping: [
							{
								view: 'kls_names_struct',
								editor: 'kls_names'
							},
							{
								view: 'kls_code_struct',
								editor: 'kls_code'
							},
							{
								view: 'kls_namef_struct',
								editor: 'kls_namef'
							}
						],
						store: {
							type: 'common-treestore',
							model: 'App.project.modules.reportquarter.model.KlsStruct',
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

				{
					dataIndex: 'report_kbk',  //  КБК
					editor: 'textfield'
				},

				{
					text: 'Головной исполнитель, способ его определения, №, дата заключения и срок действия гос. контракта (договора)',
					editor: false,
					columns: [

						// {
						// 	dataIndex: 'company_id',
						// 	hidden: true,
						// 	editor: false,
						// 	hideable: false
						// },
						// {
						// 	dataIndex: 'company_names',
						// 	width: 120,
						// 	minWidth: 20,
						// 	editor: 'textfield',
						// 	renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'company_names_o' } )
						// },

						{
							text: 'Исполнитель',
							xtype: 'common-pickercolumn',
							dataIndex: 'company_id',
							tpl: '{company_names}',
							width: 120,
							editor: {
								xtype: 'common-combobox',
								displayField: 'company_names',
								valueField: 'company_id',
								triggerAction: 'all',
								mapping: [
									{
										view: 'company_names',
										editor: 'company_names'
									},
									{
										view: 'company_id',
										editor: 'company_id'
									}
								],
								store: {
									type: 'common-store',
									model: 'App.project.modules.reportquarter.model.Company'
								}
							}
						},

						{
							text: 'Дислокация головного исполнителя',
							dataIndex: 'company_address',
							editor: 'textfield',  //  Наименование работы
							minWidth: 20,
							renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'company_address_o' } )
						},

						// {
						// 	dataIndex: 'kls_id_type_placing',
						// 	hidden: true,
						// 	editor: false,
						// 	hideable: false
						// },
						// {
						// 	dataIndex: 'kls_names_type_placing',
						// 	width: 120,
						// 	minWidth: 20,
						// 	editor: 'textfield',
						// 	renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'kls_names_type_placing_o' } )
						// },

						{
							//Классификатор способ размещения
							text: 'Способ размещения',
							xtype: 'common-pickercolumn',
							dataIndex: 'kls_id_type_placing',
							type: 'tree',
							tpl: '{kls_names_type_placing}',
							width: 90,
							editor: {
								xtype: 'local-treecombo',
								triggerAction: 'all',
								valueField: 'kls_id',
								displayField: 'kls_names',
								mapping: [
									{
										view: 'kls_names_type_placing',
										editor: 'kls_names'
									}
								],
								store: {
									type: 'common-treestore',
									model: 'App.project.modules.reportquarter.model.KlsTypePlacing',
									parentIdProperty: 'kls_id_parent',
									listeners: {
										load: function(store) {
											var root = store.getRootNode();
											root.cascadeBy( function(node) {node.expand();} );
										}
									}
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

						{
							dataIndex: 'contract_num',
							minWidth: 20,
							editor: 'textfield',
							renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'contract_num_o' } )
						},

						{
							text: 'Дата заключения контракта',
							dataIndex: 'contract_date_beg',
							align: 'center',
							xtype: 'datecolumn',
							width: 120,
							flex: 0,
							editor: {
								xtype: 'datefield'
							},
							renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'contract_date_beg_o', type: 'date' } )
						},

						{
							text: 'Дата окончания контракта',
							dataIndex: 'contract_date_end',
							align: 'center',
							xtype: 'datecolumn',
							flex: 0,
							editor: {
								xtype: 'datefield'
							},
							renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'contract_date_end_o', type: 'date' } )
						}

					]
				},

				// {
				// 	dataIndex: 'kls_id_measure',
				// 	hidden: true,
				// 	editor: false,
				// 	hideable: false
				// },
				// {
				// 	dataIndex: 'kls_names_measure',
				// 	width: 90,
				// 	minWidth: 20,
				// 	editor: 'textfield',
				// 	renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'kls_names_measure_o' } )
				// },

				{
					text: 'Единицы измерения',
					xtype: 'common-pickercolumn',
					dataIndex: 'kls_id_measure',
					tpl: '{kls_names_measure}',
					width: 90,
					editor: {
						xtype: 'common-combobox',
						displayField: 'kls_names',
						valueField: 'kls_id',
						triggerAction: 'all',
						mapping: [
							{
								view: 'kls_names_measure',
								editor: 'kls_names'
							}
						],
						store: {
							type: 'common-store',
							model: 'App.project.modules.reportquarter.model.KlsMeasure'
						}
					}
				},


				{
					text: 'Объем ассигнований по гособоронзаказу ППРФ',
					xtype: 'project-pricecolumn',
					dataIndex: 'data_price',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'data_price_o', defaultValue: '0', format: '0,000.00' } ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.00' );
					}
				},

				{
					text: 'Объем ассигнований по гособоронзаказу с учетом его уточнения',
					xtype: 'project-pricecolumn',
					dataIndex: 'data_price_correct',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'data_price_correct_o', defaultValue: '0', format: '0,000.00' } ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.00' );
					}
				},

				{
					text: 'Объем поставки (ремонта) по гособоронзаказу',
					xtype: 'project-amountcolumn',
					dataIndex: 'data_amount',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'data_amount_o', defaultValue: '0', format: '0,000.0' } ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.0' );
					}
				},

				{
					text: 'Объем поставки (ремонта) по гособоронзаказу с учетом уточнений',
					xtype: 'project-amountcolumn',
					dataIndex: 'data_amount_correct',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'data_amount_correct_o', defaultValue: '0', format: '0,000.0' } ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.0' );
					}
				},

				{
					text: 'Объем ассигнований по госконтракту в отчетном году',
					xtype: 'project-pricecolumn',
					dataIndex: 'data_price_contract',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( {
						originalAttrName: 'data_price_contract_o',
						defaultValue: '0',
						format: '0,000.00'
					} ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.00' );
					}
				},

				{
					text: 'Цена госконтракта (договора) с учетом дополнительных соглашений',
					xtype: 'project-pricecolumn',
					dataIndex: 'contract_price',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'contract_price_o', defaultValue: '0', format: '0,000.00' } ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.00' );
					}
				},

				{
					text: 'Объем поставки (ремонта) всего',
					xtype: 'project-amountcolumn',
					dataIndex: 'contract_amount',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'contract_amount_o', defaultValue: '0', format: '0,000.0' } ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.0' );
					}
				},

				{
					text: 'Объем поставки (ремонта) по госконтракту в отчетном году',
					xtype: 'project-amountcolumn',
					dataIndex: 'data_amount_contract',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( {
						originalAttrName: 'data_amount_contract_o',
						defaultValue: '0',
						format: '0,000.0'
					} ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.0' );
					}
				},

				{
					text: 'Всего выплачено по госконтракту по состоянию на 1 число месяца, следующего за отчетным периодом',
					xtype: 'project-pricecolumn',
					dataIndex: 'payment_sum_before',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'payment_sum_before_o', defaultValue: '0', format: '0,000.00' } ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.00' );
					}
				},

				{
					text: 'Выплачено за отчетный период',
					editor: false,
					columns: [
						{
							text: 'Всего',
							xtype: 'project-pricecolumn',
							dataIndex: 'payment_sum',
							width: 130,
							flex: 0,

							renderer: me.changedCellRendererFactory.bind( {
								originalAttrName: 'payment_sum_o',
								defaultValue: '0',
								format: '0,000.00'
							} ),

							summaryType: 'sum',

							summaryRenderer: function(value, summaryData, field, meta) {
								return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.00' );
							}
						},
						{
							text: 'В том числе выплачено авансов',
							xtype: 'project-pricecolumn',
							dataIndex: 'payment_sum_advance',
							width: 130,
							flex: 0,

							renderer: me.changedCellRendererFactory.bind( {
								originalAttrName: 'payment_sum_advance_o',
								defaultValue: '0',
								format: '0,000.00'
							} ),

							summaryType: 'sum',

							summaryRenderer: function(value, summaryData, field, meta) {
								return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.00' );
							}
						}

					]
				},

				{
					text: 'Стоимость выполненных работ за отчетный период',
					xtype: 'project-pricecolumn',
					dataIndex: 'stage_price_period',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'stage_price_period_o', defaultValue: '0', format: '0,000.00' } ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.00' );
					}
				},

				{
					text: 'Количество поставлено за отчетный период',
					xtype: 'project-amountcolumn',
					dataIndex: 'stage_amount_period',
					width: 130,
					flex: 0,

					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'stage_amount_period_o', defaultValue: '0', format: '0,000.0' } ),

					summaryType: 'sum',

					summaryRenderer: function(value, summaryData, field, meta) {
						return Ext.util.Format.number( parseFloat( value || 0 ), '0,000.0' );
					}
				},

				{
					dataIndex: 'pretensions',
					hidden: true,
					hideable: false,
					text: 'Выставление претензий',
					minWidth: 20,
					editor: 'textfield'
				},

				{
					dataIndex: 'execution_state',
					text: 'Состояние выполнения задания ГОЗ',
					minWidth: 20,
					editor: 'textfield',
					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'execution_state_o' } )
				},

				{
					dataIndex: 'report_quarter_desc',
					editor: {
						xtype: 'textareafield'
					},
					text: 'Примечание',
					width: 200,
					renderer: me.changedCellRendererFactory.bind( { originalAttrName: 'report_quarter_desc_o' } )
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

			]
		};

	}

} );