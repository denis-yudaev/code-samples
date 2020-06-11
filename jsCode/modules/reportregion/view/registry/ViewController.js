/**
 * @class App.project.modules.reportregion.view.registry.ViewController
 */
Ext.define('App.project.modules.reportregion.view.registry.ViewController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.reportregion-registry-controller',

	config: {
		reportRecord: null
	},

	statics: {
		getReportRegionAttributeNames: function(dataIndex){
			var result;

			switch( dataIndex )
			{
				case 'arr_kls_id_type':
					result = {
						'static': 'kls_names_type_all',
						'dynamic': 'report_kls_names_type_all',
						'dataIndex': dataIndex
					};
					break;

				case 'arr_kls_id_allowance':
					result = {
						'static': 'kls_names_allowance_all',
						'dynamic': 'report_kls_names_allowance_all',
						'dataIndex': dataIndex
					};
					break;

				case 'arr_kls_id_customer':
					result = {
						'static': 'kls_names_customer_all',
						'dynamic': 'report_kls_names_customer_all',
						'dataIndex': dataIndex
					};
					break;

				case 'arr_company_id':
					result = {
						'static': 'names_company_all',
						'dynamic': 'report_names_company_all',
						valueField: 'company_id',
						displayField: 'company_names',
						'dataIndex': dataIndex
					};
					break;

				case 'arr_kls_id_okato':
					result = {
						'static': 'kls_names_okato_all',
						'dynamic': 'report_kls_names_okato_all',
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

				default:
					result = null;
					break;
			}

			return result;
		}
	},

	control: {

		'reportregion-registry-grid': {

			//  устанавливаем новым записям тип отчёта
			rowsadd: function(row, grid) {
				row.set('kls_code_type_report', 'REGION');
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
		    jsonFieldData = App.project.modules.reportregion.view.registry.ViewController.getReportRegionAttributeNames( self.dataIndex ) || {};

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


	editReportLink: function(grid, rowIndex, colIndex, item, e, record) {
		var me = this,
		    view, mainFilter, mainView, reportId, filterWindow, body;

		if ( record && !record.phantom ) {
			view = me.getView();
			reportId = record.data && record.data.report_id;

			if ( reportId ) {
				filterWindow = view.getParentButton().up( 'filter-window' );

				if( filterWindow ) {
					mainFilter = filterWindow.getGridFilter();
					mainView = mainFilter.up( 'reportregion-main' );
				} else {
					mainView = view.getParentButton().up( 'reportregion-main' );
				}

				body = Ext.getBody();
				body.mask( 'Загрузка...' );

				App.common.Ajax.request( {
					url: App.constants.API_READ(),
					jsonData: {
						object: 'rpt.report',
						method: 'rpt.report_s',
						data: [
							App.common.data.prepare.Condition.$eq( 'report_id', reportId )
						]
					},

					success: function(response) {
						var rawData = response && response.rawData,
						    record, data;

						if ( rawData && rawData.success && rawData.data )
						{
							data = rawData.data[ 0 ];
							record = Ext.create( 'App.project.modules.reportregion.model.Report', data );

							me.setReportRecord( record );

							mainView.setReportId( data.report_id );
							mainView.setReportName( data.report_name );
							mainView.setReportYearBeg( data.report_year_beg );
							mainView.setReportYearEnd( data.report_year_end );

							view.close();
							me.openModuleCallback( mainView );
							App.apiUI.module.open( 'App.project.modules.reportregion.view.Main', { callback: me.openModuleCallback.bind( me, mainView ) } );
						} else
						{
							body.unmask();
						}
					},

					failure: function(){
						body.unmask();
					}
				} );
			}
		}
	},


	openModuleCallback: function(mainView) {
		var me = this,  //  контроллер
		    record = me.getReportRecord(),  //  текущая запись для получения значений для фильтра
		    attributeName = 'report_id',  //  атрибут, значение которого используется для фильтрации
		    rawValueAttributeName = 'report_name', //  атрибут, значение которого используется для отрисовки тэга в фильтре
		    attributeValue = record && record.get( attributeName ),
		    rawValue = record && record.get( rawValueAttributeName ),
		    filterTagName = Ext.Array.findBy( record.getProxy().getReader().metaData, function(item) { return item.name === rawValueAttributeName; } ),
		    condition = App.common.data.prepare.Condition.$eq( attributeName, attributeValue ),  //  условие запроса фильтрации
		    filter = mainView && mainView.down( 'filter-field' ),  //  компонент фильтра
		    oldGrid = filter.getDataGrid(),  //  таблица целевой формы
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

		oldGrid && oldGrid.destroy();

		reportIdCombo && reportIdCombo.setValue( me.getReportRecord() );

		newGrid = filter.addDataGrid( mainView );

		filter.setTagParams( newFilterTagParams );
		filter.setDataGrid( newGrid );

		store.on( 'load', me.destroySearchWindow, filter, { single: true } );

		filter.startFiltration();
	},


	destroySearchWindow: function() {
		var me = this,
		    searchWindow = me.getSearchWindow();

		Ext.defer( function() {
			searchWindow && searchWindow.destroy();
			me.setSearchWindow( null );

			Ext.getBody().unmask();
		}, 100 );
	}


});