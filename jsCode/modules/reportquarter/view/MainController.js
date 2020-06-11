/**
 * Контроллер представлений формы ведения квартальных отчётов
 * @class App.project.modules.reportquarter.view.MainController
 */
Ext.define('App.project.modules.reportquarter.view.MainController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.reportquarter-main',

	config: {
		displayChanges: null
	},

	control: {

		'reportquarter-grid-panel local-button-tablecolumnwrap': {
				render: function(self) {
					self.setMenu([

							  {   // развертывания текста в строке
								  xtype: 'checkbox',
								  margin: '0 8 0 8',
								  boxLabel: 'Развернуть строки',
								  name: 'typeDisplay',
								  checked: false,

								  handler: function(view, checked) {
									  var grid = view.up('grid');
									  grid && grid.setWrapColumns && grid.setWrapColumns(checked);
								  }
							  },

							  {   //  показ изменённых ячеек
								  xtype: 'checkbox',
								  margin: '0 8 0 8',
								  boxLabel: 'Отобразить изменённые значения',
								  name: 'displayChanges',
								  checked: false,

								  handler: function(view, checked) {
									  var grid = view.up('grid'),
									      controller = grid && grid.lookupController(),
									      gridView = grid.getView && grid.getView();

									  controller && controller.setDisplayChanges && controller.setDisplayChanges( checked );
									  gridView && gridView.refresh && gridView.refresh();
								  }
							  }

					]);
				}
		},

		'reportquarter-grid-panel': {

			selectionchange: 'reportquarterGridSelectionchange',

			render: 'reportquarterGridPanelRender',

			cellcontextmenu: 'reportquarterGridPanelCellcontextmenu',

			rowssavesuccess: 'onReportquarterGridRowssavesuccess',

			rowsadd: function(row, grid){
				var me = this,
				    main = grid.up('reportquarter-main'),
				    reportId = main && main.getReportId(),
				    reportName = main && main.getReportName(),
				    reportYearBeg = main && main.getReportYearBeg(),
				    groupingFeature = grid.getGroupingFeature && grid.getGroupingFeature(),
					groupFieldValue = row.get( groupingFeature.groupRenderInfo.columnName );

				reportId && row.set( 'report_id', reportId );
				reportName && row.set( 'report_name', reportName );
				reportYearBeg && row.set( 'report_year_beg', reportYearBeg );

				if( groupingFeature ) {
					if( ! (groupFieldValue && groupingFeature.getCache()[ groupFieldValue ] ) ) {
						grid.getStore().group( me.getViewModel().get('gridGroupingTypeCheckedValue') || 'kls_rubrika_struct' );
					}
				}
			},

			beforeedit: function(editor, context){
				var record = context && context.record,
				    locked = record && !record.phantom && record.get('locked');

				if ( locked ) {
					Ext.toastWarning('Запись заблокирована', 3000, 'tr');
					return false;
				}
			},

			edit: function(editor, context) {
				var record = context && context.record,
				    field, value;

				if( record && record.phantom ) {
					field = context && context.field;
					value = context && context.value;

					record.set( field + '_o', value );
				}
			}
		},

		'reportquarter-grid-panel [dataIndex=is_changed]': {
			beforecheckchange: function( ){
				return false;
			}
		},

		'reportquarter-grid-panel [dataIndex=is_checked]': {
			beforecheckchange: function( self, rowIndex, checked ){
				var ownerGrid = self.up('grid'),
				    store = ownerGrid.getStore(),
				    record = store.getAt(rowIndex),
				    locked = record && !record.phantom && record.get('locked');

				if ( locked ) {
					Ext.toastWarning('Запись заблокирована', 3000, 'tr');
					return false;
				}

				if(record) {
					record.set('is_checked', !!checked);
					record.save();
				}
			}
		},

		'reportquarter-grid-panel [dataIndex=is_blocked]': {
			checkchange: function(self, rowIndex, checked){
				var ownerGrid = self.up('grid'),
				    store = ownerGrid.getStore(),
					record = store.getAt(rowIndex);

				if(record) {
					record.reject( true );
					record.set('is_blocked', !!checked);
					record.save();
				}
			}
		}


	},


	//  событие отрисовки основной таблицы
	reportquarterGridPanelRender: function(self){
		var me = this,
		    store = self && self.getStore(),
		    mainPanel = me.getView(),
		    reportYearBeg = mainPanel && mainPanel.getReportYearBeg && mainPanel.getReportYearBeg(),
		    groupingFeature = self.getView().lockedGrid.getView().getFeature('reportquarterGridGrouping');

		groupingFeature && self.setGroupingFeature( groupingFeature );

		reportYearBeg && mainPanel.getViewModel().set( 'reportYearBeg', reportYearBeg );


		/**  добавляем контекстное меню {@link App.project.modules.reportquarter.view.grid.CellContextMenu} */
		self.setContextMenu( self.getContextMenu() || self.add({ xtype: 'reportquarter-grid-panel-cellcontextmenu' }) );


		/**  вешаем событие `beforeload` на стор (передаём контроллер в `this`) {@see onBeforeReportquarterGridStoreLoad} */
		store && store.on( 'beforeload', me.onBeforeReportquarterGridStoreLoad, me, { single: true } );
	},


	//  событие отрисовки контекстного меню основной таблицы отчёта
	reportquarterGridPanelCellcontextmenu: function(gridView, td, cellIndex, record, tr, rowIndex, e){
		var grid = gridView.ownerGrid,
		    clickXY = e.getXY(),
		    yOffset = grid.normalGrid.getY(),
		    contextMenu = grid.getContextMenu(),
		    selection = gridView.getSelection(),
		    selectedColumn = gridView.getColumnManager().getHeaderAtIndex( cellIndex ),
		    editor = selectedColumn.getInitialConfig('editor'),
		    isEditable = td && !td.classList.contains('x-not-editable-cell');


		if ( editor && isEditable && selection && selection.length ) {
			selectedColumn && contextMenu.setSelectedColumn( selectedColumn );
		}

		clickXY[1] = clickXY[1] - yOffset;
		contextMenu.showAt( clickXY, null, false, { record: record } );

		e.stopEvent();
	},


	//  хранение записи текущего отчёта
	reportquarterGridSelectionchange: function(sm, records){
		var vm = this.getViewModel(),
		    record = records && records[0] || null;

		vm.set( 'current.selection', records  );
		vm.set( 'current.reportquarter', records.length === 1 ? record : null );
	},


	//  экспортируем данные из таблицы в том виде, в котором мы их видим
	handleExportTableButton: function(menuitem) {
		var exportCols = [],
		    colsObject = menuitem.up('grid').headerCt.getGridColumns();

		Ext.each(colsObject, function(col) {
			if (Ext.isDefined(col.dataIndex) && col.dataIndex !== null && col.dataIndex != "") {
				//  оставляем только видимые колонки
				if (col.hidden || !col.isVisible(true)) {
					return;
				}

				exportCols.push({
					dataIndex: col.dataIndex,
					tpl: col.tpl || '{' + col.dataIndex + '}',
					width: col.width
				});
			}
		});

		var requestData = menuitem.up('reportquarter-main').getExportRequestData();

		new App.common.form.Panel({
			standardSubmit: true,
			url: App.constants.API_CREATE('ods'),
			baseParams: {
				object: menuitem.externalParams.object,
				method: menuitem.externalParams.method,
				data: {
					request: {
						object: requestData.object,
						method: requestData.method,
						order: requestData.order,
						limit: requestData.limit,
						offset: requestData.offset,
						data: requestData.data
					},
					filename: menuitem.externalParams.filename,
					template: menuitem.externalParams.template,
					params: {
						columns: exportCols,
						planVarId: menuitem.externalParams.planVarId
					}
				}
			}
		}).submit({
			waitMsg: false
		});

	},


	//  перед загрузкой хранилища, сохраняем данные запроса, чтобы потом их использовать в экспорте
	onBeforeReportquarterGridStoreLoad: function(store, operation) {
		var me = this;

		Ext.defer(function() {
			operation.getRequest() && me.getView().setExportRequestData( operation.getRequest().config.params );
		}, 500);
	},


	reportquarterStoreRemoveEvent: function(store) {
		var me = this;

		Ext.defer(function() {
			store && store.group(me.getViewModel().get('gridGroupingTypeCheckedValue') || 'kls_rubrika_struct');
		}, 0);
	},

	reportquarterStoreUpdateEvent: function(store, data, operation) {
		var me = this;

		if(operation === 'commit') {
			Ext.defer(function() {
				store && store.group(me.getViewModel().get('gridGroupingTypeCheckedValue') || 'kls_rubrika_struct');
			}, 0);
		}
	},


	onReportquarterGridRowssavesuccess: function(self, batch){
		var me = this,
		    store = self.getStore(),
		    operations = batch.getOperations(),
			gField = me.getViewModel().get('gridGroupingTypeCheckedValue') || 'kls_rubrika_struct';

		// if ( operations && operations.length ) {
		// 	operations.forEach( function(operation) {
		// 		var records = operation.getRecords();
		// 		records && records.length && records.forEach( function(record) {
		// 			record.set( 'kls_rubrika_struct', record.get('kls_rubrika_struct') );
		// 		} );
		// 	} );
		// }

		Ext.defer(function() {
			store && store.group( gField );
		}, 1);
	},


	changeGridGroupingTypeEvent: function(radiofield, value) {
		var grid = this.getView().down('reportquarter-grid-panel'),
		    feature;

		if (grid.getView().lockedGrid) {
			feature = grid.getView().lockedGrid.getView().getFeature('reportquarterGridGrouping');
		} else {
			feature = grid.getView().getFeature('reportquarterGridGrouping');
		}

		if (value.groupField && value.groupField != 'nogroup') {
			if (feature.disabled) {
				feature.enable();
			}

			grid.getStore().group( value.groupField );
		} else {
			feature.disable();
		}

		this.getViewModel().set('gridGroupingTypeCheckedValue', value.groupField);

		radiofield.up('menu').hide();
		radiofield.up('app-splitbutton') && radiofield.up('app-splitbutton').hideMenu();
	},

	statics: {
		groupingMap: {
			kls_id_type: 'kls_rubrika_type',
			kls_id_struct: 'kls_rubrika_struct',
			kls_id_allowance: 'kls_rubrika_allowance',
			kls_id_customer: 'kls_rubrika_customer'
		}
	}


});
