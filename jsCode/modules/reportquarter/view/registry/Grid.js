/**
 * Таблица редактироания квартального отчёта
 * @class 'App.project.modules.reportquarter.view.registry.Grid'
 */
Ext.define('App.project.modules.reportquarter.view.registry.Grid', {
	extend: 'App.project.grid.Panel',
	alias: 'widget.reportquarter-registry-grid',

	requires: [
		'App.common.form.field.TagField',
		'App.project.modules.reportquarter.view.sources.Main',
		'App.project.grid.Toolbar',
		'App.project.button.Split'
	],

	store: {
		type: 'common-store',
		autoLoad: true,
		model: 'App.project.modules.reportquarter.model.Report',
		pageSize: 0
	},

	cls: 'project-topframed-panel',

	tbar: {
		xtype: 'project-grid-toolbar',
		items: [

			'-',

			{
				xtype: 'toolbar',
				items: [
					{
						tooltip: 'Открыть выбранный вариант плана',
						xtype: 'app-splitbutton',
						iconCls: 'fa fa-external-link fa-external-link-blue',
						scale: 'medium',
						'bind': {
							disabled: '{!arrPlanVarId}'
						},
						menu: {
							plain: true,
							style: {
								backgroundColor: 'white',
								padding: '5pх 10px 0 10px'
							},
							items: [],
							listeners: {
								show: function(self){
									var report = self.lookupViewModel().get('current.report'),
										planJson = report && report.data && report.data.plan_var_json,
										items = [];

									Ext.Array.forEach( planJson, function(item) {
										items[ items.length ] = {
											text: item.plan_var_names,
											planVarId: item.plan_var_id,
											icon: false,
											handler: 'makePlanVarRequest'
										};
									});

									self.removeAll();
									self.add( items );
								}
							}
						}
					}
				]
			}
		]
	},

	columns: [

		{
			text: '№',
			width: 35,
			flex: 0,
			align: 'center',
			xtype: 'rownumberer'
		},

		{
			dataIndex: 'report_name',
			flex: 0,
			minWidth: 250,
			editor: 'textfield'
		},

		{
			dataIndex: 'report_year_beg',
			width: 130,
			allowBlank: false,
			flex: 0,
			align: 'center',
			editor: {
				xtype : 'numberfield',
				decimalPrecision: 0,
				minvalue: App.constants.min_year,
				maxvalue: App.constants.max_year
			}
		},

		// {
		// 	dataIndex: 'report_year_end',
		// 	width: 130,
		// 	align: 'center',
		// 	flex: 0,
		// 	editor: {
		// 		xtype : 'numberfield',
		// 		decimalPrecision: 0,
		// 		minValue: App.constants.MIN_YEAR,
		// 		maxValue: App.constants.MAX_YEAR
		// 	}
		// },

		{
			xtype: 'common-pickercolumn',
			// tpl: 'report_quarter',
			tpl: '{[ ( values.report_quarter && values.report_quarter > 0 ) ? values.report_quarter + " квартал" : "" ]}',
			allowBlank: false,
			dataIndex : 'report_quarter',
			flex: 0,
			minWidth: 100,
			text: 'Квартал',

			editor : {
				xtype : 'combo',
				valueField : 'report_quarter',
				displayField : 'name',
				triggerAction : 'all',
				allowBlank: false,
				store : {
					type : 'store',
					fields : [
						{
							name: 'name',
							type: 'string'
						},
						{
							name: 'report_quarter',
							type: 'int'
						}
					],
					data : [
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



		{
			variableRowHeight: true,
			dataIndex: 'arr_plan_var_id',
			tpl: '{[ ( values.report_plan_var_all ) ? values.report_plan_var_all : values.plan_var_all ]}',
			xtype: 'common-pickercolumn',
			flex: 0,
			minWidth: 160,
			editor: {
				xtype: 'common-tagfield',
				valueField: 'plan_var_id',
				displayField: 'plan_var_names',
				forceSelection: false,
				queryCaching: false,
				store: {
					type: 'common-store',
					model: 'App.project.modules.reportquarter.model.PlanVar'
				}
			}
		},


		{
			variableRowHeight: true,
			dataIndex: 'arr_kls_id_customer',
			tpl: '{[ ( values.report_kls_names_customer_all ) ? values.report_kls_names_customer_all : values.kls_names_customer_all ]}',
			xtype: 'common-pickercolumn',
			flex: 0,
			minWidth: 160,
			editor: {
				xtype: 'common-tagfield',
				valueField: 'kls_id',
				displayField: 'kls_names',
				forceSelection: false,
				queryCaching: false,
				store: {
					type: 'common-store',
					model: 'App.project.modules.reportquarter.model.KlsRegistryCustomer'
				}
			}
		},


		{
			variableRowHeight: true,
			dataIndex: 'arr_kls_id_type',
			tpl: '{[ ( values.report_kls_names_type_all ) ? values.report_kls_names_type_all : values.kls_names_type_all ]}',
			xtype: 'common-pickercolumn',
			flex: 0,
			minWidth: 160,
			editor: {
				xtype: 'common-tagfield',
				valueField: 'kls_id',
				displayField: 'kls_names',
				forceSelection: false,
				queryCaching: false,
				store: {
					type: 'common-store',
					model: 'App.project.modules.reportquarter.model.KlsType'
				}
			}
		},


		{
			variableRowHeight: true,
			dataIndex: 'arr_kls_id_struct',
			tpl: '{[ ( values.report_kls_names_struct_all ) ? values.report_kls_names_struct_all : values.kls_names_struct_all ]}',
			xtype: 'common-pickercolumn',
			flex: 1,
			minWidth: 160,
			editor: {
				xtype: 'common-tagfield',
				valueField: 'kls_id',
				displayField: 'kls_names',
				forceSelection: false,
				queryCaching: false,
				store: {
					type: 'common-store',
					model: 'App.project.modules.reportquarter.model.KlsStruct'
				}
			}
		},


		{   // Источники планов
			dataIndex: 'report_sources',
			flex: 0,
			minWidth: 140,
			listeners: {
				/**
				 * Создание модального окна выбора варианта отчёта
				 * Передаем ему id строки
				 *
				 * @param row Object
				 * @param target Object dom
				 * @param rowNum Number row
				 * @param colNum Number column
				 * @param event Object event
				 * @param record Object record
				 */
				dblclick: function(row, target, rowNum, colNum, event, record) {
					var data = record && record.data,
						modal;

					//  если запись новая - не показывать модальное окно
					if( record.phantom ) {
						Ext.toastNotice( 'Для выбора <b>Источника плана</b>, <br/>сохраните запись', 3000, 'tr' );
						return;
					}

					// Создать объект модального окна, с передачей необходимых параметров
					modal = Ext.create( 'App.project.modules.reportquarter.view.sources.Main', { reportId: data && data.report_id } );

					modal.show();

					// Загрузить данные по указанным условиям
					modal.api.use( 'load', { report_id_dst: record.id } );

					// Обработчик события: закрытие модального окна
					modal.on( 'close', function(modal) {
						// esemenov: Вызываем при изменении в списке отчётов (через модальное окно), проверяем, был ли изменен store
						modal && modal.api.isDirty && this.ownerCt.ownerCt.getStore().load();
					}, this );
				}
			}
		},

		//  скрытые поля
		{
			dataIndex: 'kls_code_type_report',
			hidden: true,
			hideable: false
		}


	]


});