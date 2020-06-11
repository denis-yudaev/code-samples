/**
 * @class App.project.modules.reportquarter.view.registry.ViewController
 */
Ext.define('App.project.modules.reportquarter.view.registry.ViewController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.reportquarter-registry-controller',

	requires: [
	],

	statics: {
		getReportQuarterAttributeNames: function(dataIndex){
			var result;

			switch( dataIndex )
			{
				case 'arr_kls_id_customer':
					result = {
						'static': 'kls_names_customer_all',
						'dynamic': 'report_kls_names_customer_all',
						'dataIndex': dataIndex
					};
					break;

				case 'arr_kls_id_type':
					result = {
						'static': 'kls_names_type_all',
						'dynamic': 'report_kls_names_type_all',
						'dataIndex': dataIndex
					};
					break;

				case 'arr_kls_id_struct':
					result = {
						'static': 'kls_names_struct_all',
						'dynamic': 'report_kls_names_struct_all',
						'dataIndex': dataIndex
					};
					break;

				case 'arr_plan_var_id':
					result = {
						'static': 'plan_var_all',
						'dynamic': 'report_plan_var_all',
						valueField: 'plan_var_id',
						displayField: 'plan_var_names',
						'dataIndex': dataIndex
					};
					break;

				default:
					result = null;
					break;
			}

			return result;
		}
	},

	control: {

		'reportquarter-registry-grid': {

			//  устанавливаем новым записям тип отчёта
			rowsadd: function(row, grid) {
				row.set('kls_code_type_report', 'QUARTER');
			},

			//  хранение записи текущего отчёта
			selectionchange: function(sm, records){
				var vm = this.getViewModel(),
				    record = records && records[0];

				vm.set( 'current.report', record || null  )
			},

			beforeedit: function(ce, ctx){
				var me = this,
				    column = ctx && ctx.column,
				    editor = column && column.getEditor && column.getEditor();

				if( editor && editor.isPickerField && editor.multiSelect ){
					editor.on('select', me.onTypeTagfieldSelect, me);
				}
			}

		}
	},


	//  формирование списка значений для отображения в облаке меток соответствующего поля
	onTypeTagfieldSelect: function(self, selection) {
		var viewModel = this.getViewModel(),
		    currentReport = viewModel.get('current.report'),
		    jsonFieldData = App.project.modules.reportquarter.view.registry.ViewController.getReportQuarterAttributeNames( self.dataIndex ) || {};

		//  заносим значения в модель
		if ( !selection || !selection.length ) {
			currentReport.set(jsonFieldData.dataIndex, null);
			currentReport.set(jsonFieldData.dynamic, '');
		} else {
			var dataIdArr = [],
			    dataNamesArr = [];

			selection.forEach(function(record) {
				dataIdArr[ dataIdArr.length ] = record.get( jsonFieldData.valueField || 'kls_id' );
				dataNamesArr[ dataNamesArr.length ] = record.get( jsonFieldData.displayField || 'kls_names' );
			});
			currentReport.set( jsonFieldData.dataIndex, dataIdArr );
			currentReport.set( jsonFieldData.dynamic, dataNamesArr.join(';') );
		}
	},


	makePlanVarRequest: function( btn ) {
		var me = this,
		    planVarId = btn.getInitialConfig().planVarId,
		    win = btn.up('reportquarter-registry-window');

		if( planVarId )
		{
			win.mask('Загрузка...');

			App.common.Ajax.request( {
				url: App.constants.API_READ(),
				jsonData: {
					object: 'pln.plan_var',
					method: 'pln.plan_var_s',
					data: [
						App.common.data.prepare.Condition.$eq( 'plan_var_id', planVarId )
					]
				},

				callback: function(options, success, response) {
					var data = success && Ext.JSON.decode( response.responseText, true ),
					    planData;

					if ( data && data.success && data.data && data.data.length ) {
						planData = data.data && data.data[ 0 ];

						planData && me.openModule( planData, win );
					} else {
						win.unmask();
					}
				}
			} );
		}
	},


	openModule: function(planData, win) {
		var me = this,
		    planVarId = planData.plan_var_id,
		    planVarNames = planData.plan_var_names,
		    klsCodeType = planData.kls_code_type,
		    storeName;

		if (!planVarId) {
			win.unmask();
			return;
		}

		var filterData = {
			    dataIndex: 'plan_var_id',
			    name: 'Вариант плана',
			    conditionKey: 'plan_var_id',
			    conditionValue: planVarId,
			    rawValue: planVarNames
		    },
		    path;

		switch (klsCodeType) {
			case 'GOZ':
				path = 'App.project.modules.plangoz.view.Main';
				storeName = 'gozStore';
				break;

			case 'GPV':
				path = 'App.project.modules.plangpv.view.Main';
				storeName = 'gpvStore';
				break;

			case 'PLC':
				path = 'App.project.modules.plngoztasks.view.Main';
				storeName = 'plnGozTasksStore';
				break;

			case 'MPE':
				path = 'App.project.modules.planmpe.view.Main';
				storeName = 'planmpe';
				break;

			default:
				return;
		}

		if( planData ) {
			App.apiUI.module.open( path, {
				callback: function(panel) {
					if ( panel && panel.rendered )
					{
						me.startFilter.apply( me, [ filterData, storeName, planData, panel, win ] );
					} else {
						panel.on( {
							afterrender: {
								fn: me.startFilter.bind( me, filterData, storeName, planData, panel, win ),
								options: {
									single: true
								}
							}
						} );
					}
				}
			} );
		} else {
			win.unmask();
		}
	},


	/**
	 * Фильтрация данных
	 * @method startFilter
	 * @params {} filterData
	 * @params {} storeName
	 * @params {} planRecord
	 * @params {} main ссылка на ЭФ
	 * @return
	 */
	startFilter: function(filterData, storeName, planData, main, win) {
		var filter = main && main.down('filter-field'),
		    newPlanVarId = filterData.conditionValue,
		    store = main.getViewModel().get(storeName),
		    dataGrid,
		    newDataGrid;

		filter.setTagParams([
			{
				dataIndex: filterData.dataIndex,
				name: filterData.name,
				data: App.common.data.prepare.Condition.$eq(filterData.conditionKey, filterData.conditionValue),
				rawValue: filterData.rawValue
			}
		]);

		filter.updateTags();
		filter.startFiltration();

		if (newPlanVarId && ( +main.getPrevPlanVarId() !== +newPlanVarId )) {
			main.setPlanVarId(planData.plan_var_id);
			main.setPlanVarName(planData.plan_var_names);
			main.setYearBeg(planData.plan_year_beg);
			main.setYearEnd(planData.plan_year_end);
			main.setMeasure(planData.kls_names_measure_price);
			main.setLimId(planData.limId);

			dataGrid = filter.getDataGrid();
			dataGrid && dataGrid.destroy();

			newDataGrid = filter.addDataGrid(main);

			store.on('load', function() {
				if (filter.getSearchWindow()) {
					filter.getSearchWindow().destroy();
					filter.setSearchWindow(null);
				}
			}, store, { single: true });

			filter.setDataGrid(newDataGrid);
		}

		win.unmask();
		win.close();
	}



});