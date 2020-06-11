/**
 * Фильтр модуля ведения региональных справок
 * @class App.project.modules.reportregion.view.grid.Filter
 */
Ext.define('App.project.modules.reportregion.view.grid.Filter', {
	extend: 'App.project.modules.filter.Init',
	alias: 'widget.reportregion-grid-filter',

	requires: [
		'App.project.modules.reportregion.view.grid.FilterWindow'
	],

	notNullParams: [
		  'report_id'
	],

	modalSearchField: [
		  'report_id',
		  'kls_id_type',
		  'kls_id_allowance',
		  'kls_id_customer',
		  'kls_id_okato',
		  'kls_id_struct'
	],

	textSearchField: [
		'contract_num',
		'contract_desc',
		'task_fullname',
		'kls_names_customer',
		'kls_names_allowance',
		'kls_names_struct',
		'kls_names_okato',
		'kls_names_type',
		'problems',
		'arrangements'
	],

	listeners: {
		afterrender: function(obj) {
			var me = this,
			    dataGrid = obj.up('reportregion-main').down('reportregion-grid-panel');

			dataGrid && me.setDataGrid( dataGrid );
		}
	},


	addDataGrid: function(panel, options) {
		var grid = {
			region: 'center',
			xtype: 'reportregion-grid-panel'
		};

		options && Ext.apply(grid, options);

		return panel.add(grid);
	},


	initComponent: function() {
		var me = this,
		    mainPanel = me.up('reportregion-main'),
		    viewModel = mainPanel.getViewModel();

		if (mainPanel.getReportId()) {
			var plnGozGrid = me.addDataGrid(mainPanel);
			me.setDataGrid(plnGozGrid);
		}

		viewModel.getStore('reportregionStore').on('beforeload', function(store, operation) {
			var action = operation.getAction(),
			    extraParams = store.getProxy().getExtraParams(),
			    actionParams = extraParams[action],
			    actionData = actionParams.data || null,
			    notNullParamsCount = 0;

			if ( mainPanel.getReportId() ) {
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
				name: 'Вариант справки',
				editor: {
					xtype: 'common-combobox',
					displayField: 'report_name',
					valueField: 'report_id',
					allowBlank: false,
					store: {
						type: 'common-store',
						model: 'App.project.modules.reportregion.model.ReportVar'
					}
				}
			}
		]);

		me.onSearchWindowAdded = function(window) {
			var reportIdFieldContainer = window && window.down('filter-fieldcontainer[itemId=report_id]');
			reportIdFieldContainer && reportIdFieldContainer.setHidden( true );

			window && window.on('beforeApplyToFilter', function(filterWindow, filter) {
				var reportVarCombo = reportIdFieldContainer.down('common-combobox'),
				    reportVarSelection = reportVarCombo.getSelection(),
				    prevReportVarId = mainPanel.getReportId(),
				    dataGrid = me.getDataGrid(),
				    parentPanel = filter.up('reportregion-main'),
				    store = viewModel.get('reportregionStore');

				if( !reportVarSelection ) {
					// отрисовываем поля фильтра, в отличие от стандартного поведения...
					window.updateFilterFieldTagParams();
					window.drawItems();

					return false;
				}

				mainPanel.setReportId( reportVarSelection.get( 'report_id' ) );
				mainPanel.setReportName( reportVarSelection.get( 'report_name' ) );
				mainPanel.setReportYearBeg( reportVarSelection.get( 'report_year_beg' ) );
				mainPanel.setReportYearEnd( reportVarSelection.get( 'report_year_end' ) );

				if (!dataGrid) {
					var plnGozGrid = me.addDataGrid(parentPanel);

					store.on('load', function() {
						me.getSearchWindow().destroy();
						me.setSearchWindow( null );
					}, store, { single: true });

					me.setDataGrid(plnGozGrid);

					return;
				}

				if (reportVarSelection && prevReportVarId != mainPanel.getReportId()) {
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


	openFilterWindow: function(focus) {
		if (!App.project.modules.reportregion.view.grid.FilterWindow) {
			Ext.require('App.project.modules.reportregion.view.grid.FilterWindow', this.showWindow.bind(this, focus));
		} else {
			this.showWindow(focus);
		}
	},


	//Открываем окно фильтра
	showWindow: function(focus){
		var me = this;
		!me.getSearchWindow() && me.setSearchWindow( Ext.create( 'App.project.modules.reportregion.view.grid.FilterWindow', { gridFilter: me } ) );
		var searchWindow = me.getSearchWindow();

		searchWindow.setTagFocus(focus);

		searchWindow.show();
		me.fireEvent( 'openSearchWindow', me, searchWindow );
	}

});