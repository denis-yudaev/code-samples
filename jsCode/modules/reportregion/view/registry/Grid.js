/**
 * Таблица реестра региональной справки
 * @class 'App.project.modules.reportregion.view.registry.Grid'
 */
Ext.define('App.project.modules.reportregion.view.registry.Grid', {
	extend: 'App.project.grid.Panel',
	alias: 'widget.reportregion-registry-grid',

	requires: [
		'App.common.form.field.TagField',
		'App.project.grid.column.Action',
		'App.project.grid.Toolbar'
	],

	store: {
		type: 'common-store',
		autoLoad: true,
		model: 'App.project.modules.reportregion.model.Report',
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
						xtype: 'local-button-tablecolumnwrap'
					}
				]
			}
		]
	},

	columns: [

		//  скрытые столбцы
		{
			dataIndex: 'report_id',
			text:      'Вариант отчёта',
			xtype: 'common-pickercolumn',
			hidden: true,
			hideable: false,
			editor: {
				xtype: 'common-combobox',
				displayField: 'report_name',
				valueField: 'report_id',
				store: {
					type: 'common-store',
					model: 'App.project.modules.reportregion.model.ReportVar'
				}
			}
		},

		{
			dataIndex: 'kls_names_type_all',
			editor: 'textfield',
			hideable:false,
			hidden: true
		},

		{
			dataIndex: 'kls_names_allowance_all',
			editor: 'textfield',
			hideable:false,
			hidden: true
		},

		{
			dataIndex: 'kls_names_customer_all',
			editor: 'textfield',
			hideable:false,
			hidden: true
		},

		{
			dataIndex: 'names_company_all',
			editor: 'textfield',
			hideable:false,
			hidden: true
		},

		{
			dataIndex: 'kls_names_okato_all',
			editor: 'textfield',
			hideable:false,
			hidden: true
		},

		{
			dataIndex: 'kls_names_struct_all',
			editor: 'textfield',
			hideable:false,
			hidden: true
		},


		//  нормальные поля
		{
			xtype: 'project-rownumberer'
		},
		{
			xtype: 'project-grid-actioncolumn',
			width: 25,
			text: '',
			hideable: false,
			sortable: false,
			items: [
				{
					handler: 'editReportLink',
					icon: 'edit',
					getTip: function(){
						return	'Перейти к редактированию';
					},
					tooltip: 'Перейти к редактированию',
					style: {
						lineHeight: '18px!important',
						display: 'block'
					}
				}
			]
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
				minValue: App.constants.MIN_YEAR,
				maxValue: App.constants.MAX_YEAR,

				listeners: {
					spin: function(self, dir) {
						self.value || self.setValue( new Date().getFullYear() );
					}
				}
			}
		},

		{
			dataIndex: 'report_year_end',
			width: 130,
			align: 'center',
			flex: 0,
			editor: {
				xtype : 'numberfield',
				decimalPrecision: 0,
				minValue: App.constants.MIN_YEAR,
				maxValue: App.constants.MAX_YEAR,
				
				listeners: {
					spin: function(self, dir) {
						self.value || self.setValue( new Date().getFullYear() );
					}
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
					model: 'App.project.modules.reportregion.model.KlsType'
				}
			}
		},


		{
			variableRowHeight: true,
			dataIndex: 'arr_kls_id_allowance',
			tpl: '{[ ( values.report_kls_names_allowance_all ) ? values.report_kls_names_allowance_all : values.kls_names_allowance_all ]}',
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
					model: 'App.project.modules.reportregion.model.KlsAllowance'
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
					model: 'App.project.modules.reportregion.model.KlsCustomer'
				}
			}
		},

		{
			variableRowHeight: true,
			dataIndex: 'arr_company_id',
			tpl: '{[ ( values.report_names_company_all ) ? values.report_names_company_all : values.names_company_all ]}',
			xtype: 'common-pickercolumn',
			flex: 0,
			minWidth: 160,
			editor: {
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
		},

		{
			variableRowHeight: true,
			dataIndex: 'arr_kls_id_okato',
			tpl: '{[ ( values.report_kls_names_okato_all ) ? values.report_kls_names_okato_all : values.kls_names_okato_all ]}',
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
					model: 'App.project.modules.reportregion.model.KlsOkato'
				}
			}
		},

		{
			variableRowHeight: true,
			dataIndex: 'arr_kls_id_struct',
			tpl: '{[ ( values.report_kls_names_struct_all ) ? values.report_kls_names_struct_all : values.kls_names_struct_all ]}',
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
					model: 'App.project.modules.reportregion.model.KlsStruct'
				}
			}
		},


		//  скрытые поля
		{
			dataIndex: 'kls_code_type_report',
			hidden: true,
			hideable: false,
			value: 'REGION'
		}

	]


});