/**
 * Фильтр модуля ведения квартальных отчётов
 * @class App.project.modules.reportquarter.view.grid.Filter
 */
Ext.define('App.project.modules.reportquarter.view.grid.Filter', {
	extend: 'App.project.modules.filter.Init',
	alias: 'widget.reportquarter-grid-filter',

	notNullParams: [
		'report_id'
	],

	modalSearchField: [
		'report_id',
		'report_year_beg',
		'report_quarter',
		'kls_id_type',
		'kls_id_struct',
		'kls_id_customer',
		'kls_id_allowance',
		'company_id',
		'kls_id_type_placing',
		'kls_id_measure'
	],

	textSearchField: [
		'kls_names_type',
		'kls_names_struct',
		'kls_names_customer',
		'kls_names_allowance',
		'kls_names_type_placing',
		'kls_names_measure',
		'task_name',
		'company_names',
		'company_address',
		'contract_num',
		'execution_state',
		'report_quarter_desc'
	],

	listeners: {
		afterrender: function(obj) {
			var me = this,
			    dataGrid = obj.up('reportquarter-main').down('reportquarter-grid-panel');

			dataGrid && me.setDataGrid( dataGrid );
		}
	},


	addDataGrid: function(panel, options) {
		var grid = {
			region: 'center',
			xtype: 'reportquarter-grid-panel',
			features: [
				{
					ftype: 'summaryGridExt',
					dock: 'top'
				},
				{
					ftype: 'gridGrouping',
					// groupHeaderTpl: Ext.create('Ext.XTemplate',
					// 	'{children:this.formatName}',
					// 	{
					// 		formatName: function(children) {
					// 			var defaultText = 'Не классифицировано',
					// 				key = 'kls_names_struct';
					//
					// 			if (!children || !children[0]) {
					// 				return defaultText;
					// 			}
					//
					// 			if (children[0].phantom || !children[0].get(key)) {
					// 				return defaultText + ' (' + children.length + ')';
					// 			}
					//
					// 			return children[0].get(key) + ' (' + children.length + ')';
					// 		}
					// 	}
					// ),
					groupHeaderTpl: '{renderedGroupValue} ({children.length})',
					id: 'reportquarterGridGrouping',
					enableGroupingMenu: false,
					showSummaryRow: true,
					showTooltip: true,
					summaryRowCls: 'project-grid-row-summary',
					summaryRowSelector: '.project-grid-row-summary'
				}
			]
		};

		!!options && Ext.apply(grid, options);

		return panel.add(grid);
	},


	initComponent: function() {
		var me = this,
		    mainPanel = me.up('reportquarter-main'),
		    viewModel = me.up('reportquarter-main').getViewModel();

		if (!!mainPanel.getReportId()) {
			var plnGozGrid = me.addDataGrid(mainPanel);
			me.setDataGrid(plnGozGrid);
		}

		viewModel.getStore('reportquarterStore').on('beforeload', function(store, operation) {
			var action = operation.getAction(),
			    extraParams = store.getProxy().getExtraParams(),
			    actionParams = extraParams[action],
			    actionData = actionParams.data || null,
			    notNullParamsCount = 0;

			if (!!mainPanel.getReportId()) {
				store.getProxy().setExtraParam(action, Ext.apply(actionParams, {
					data: [
						App.common.data.prepare.Condition.$eq('report_id', mainPanel.getReportId())
					]
				}));
				actionData = actionParams.data;
			}

			!!actionData && actionData.forEach(function(item, i, arr) {
				if (me.getNotNullParams().indexOf(item.name) > -1 && !!item.value) {
					notNullParamsCount++
				}
			});

			if (!notNullParamsCount) {
				me.openFilterWindow();

				return false;
			}
		}, me);

		!me.getTagParams().length && me.setTagParams([
			{
				dataIndex: 'report_id',
				name: 'Вариант отчёта',
				editor: {
					xtype: 'common-combobox',
					displayField: 'report_name',
					valueField: 'report_id',
					allowBlank: false,
					store: {
						type: 'common-store',
						model: 'App.project.modules.reportquarter.model.ReportVar'
					}
				}
			}
		]);

		me.onSearchWindowAdded = function(window) {
			!!window && window.on('beforeApplyToFilter', function(filterWindow, filter) {
				var reportVarCombo = this.items.get('report_id').down('common-combobox'),
				    planVarSelection = reportVarCombo.getSelection(),
				    prewPlanVarId = mainPanel.getReportId(),
				    dataGrid = me.getDataGrid(),
				    parentPanel = filter.up('reportquarter-main'),
				    store = viewModel.get('reportquarterStore');

				mainPanel.setReportId( planVarSelection.get( 'report_id' ) );
				mainPanel.setReportName( planVarSelection.get( 'report_name' ) );
				mainPanel.setReportYearBeg( planVarSelection.get( 'report_year_beg' ) );

				if (!dataGrid) {
					var plnGozGrid = me.addDataGrid(parentPanel);

					store.on('load', function() {
						me.getSearchWindow().destroy();
						me.setSearchWindow( null );
					}, store, { single: true });

					me.setDataGrid(plnGozGrid);

					return;
				}

				if (planVarSelection && prewPlanVarId != mainPanel.getReportId()) {
					var parentGrid = me.getDataGrid();

					parentGrid.destroy();

					var newGozGrid = me.addDataGrid(parentPanel);

					store.on('load', function() {
						me.getSearchWindow().destroy();
						me.setSearchWindow(null);
					}, store, { single: true });

					me.setDataGrid(newGozGrid);
				}
			});
		};

		me.on('updateFilterHeight', function(filter, height) {
			var filterUpPanel = me.up('panel');
			filterUpPanel.setHeight(height + 4);

		});

		me.on('resize', function(obj, newWidth, newHeight, oldWidth, oldHeight) {
			(newWidth != oldWidth) && this.updateElSize();
		});

		me.callParent(arguments);
	},


	//Открываем окно фильтра
	openFilterWindow: function(focus) {
		var me = this,
		    newFilterWindow = Ext.create( 'App.project.modules.filter.view.Window', {
			    gridFilter: me,
			    height: 600
		    }),
		    tbar = newFilterWindow.dockedItems.items.find( function(obj){ return obj.isToolbar; } );

		tbar.add([
			'-',
			{
				xtype: 'button-report-registry',
				reportRegistryWindowPath: 'App.project.modules.reportquarter.view.registry.Window'
			}
		]);

		!me.getSearchWindow() && me.setSearchWindow( newFilterWindow );
		var searchWindow = me.getSearchWindow();

		searchWindow.setTagFocus( focus );

		searchWindow.show();
	}

});