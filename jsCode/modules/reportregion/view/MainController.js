/**
 * Контроллер представлений формы ведения региональных отчётов
 * @class App.project.modules.reportregion.view.MainController
 */
Ext.define('App.project.modules.reportregion.view.MainController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.reportregion-main',

	config: {
		displayChanges: null,
		// dataYear: null,
		// stageAmountTotal: null

		//  параметры запроса, параметры будут использоваться при экспорте данных
		exportRequestData: null,

		//  контейнер для контекстного меню
		contextMenu: null
	},

	control: {

		'reportregion-grid-panel local-button-tablecolumnwrap': {
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


		'reportregion-grid-panel': {

			selectionchange: 'reportregionGridSelectionchange',

			render: function(self) {
				var me = this,
				    store = self && self.getStore();


				/**  добавляем контекстное меню {@link App.project.modules.reportregion.view.grid.CellContextMenu} */
				me.setContextMenu( me.getContextMenu() || Ext.create({ xtype: 'reportregion-grid-panel-cellcontextmenu' }) );


				store && store.on( 'beforeload', me.onBeforeReportregionGridStoreLoad, me, { single: true });
			},

			beforeedit: function(editor, context){
				var record = context && context.record,
				    locked = record && !record.phantom && record.get('locked');

				if( context.field.readOnly ){
					Ext.toastWarning('Запрещено редактирование данного поля!', 3000, 'tr');
					return false;
				}

				if ( locked ) {
					Ext.toastWarning('Запись заблокирована', 3000, 'tr');
					return false;
				}
			}

		},

		'reportregion-grid-panel [dataIndex=is_changed]': {
			beforecheckchange: function( ){
				return false;
			}
		},

		'reportregion-grid-panel [dataIndex=is_checked]': {
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

		'reportregion-grid-panel [dataIndex=is_blocked]': {
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


	//  событие отрисовки контекстного меню основной таблицы отчёта
	reportregionGridPanelCellcontextmenu: function(gridView, td, cellIndex, record, tr, rowIndex, e){
		var me = this,
		    // controller        = gridView.lookupController()(),
		    clickXY     = e.getXY(),
		    contextMenu = me.getContextMenu();

		record && !record.phantom && contextMenu.showAt( clickXY, null, false, { record: record } );

		e.stopEvent();
		return false;
	},


	//  хранение записи текущего отчёта
	reportregionGridSelectionchange: function(sm, records){
		var vm = this.getViewModel(),
		    record = records && records[0];

		vm.set( 'current.reportregion', record || null  )
	},


	//  перед загрузкой хранилища, сохраняем данные запроса, чтобы потом их использовать в экспорте и для формирования ПФ
	onBeforeReportregionGridStoreLoad: function(store, operation) {
		var me = this;

		Ext.defer(function() {
			operation.getRequest() && me.setExportRequestData( operation.getRequest().config.params );
		}, 500);
	},


	handlePrintFormButton: function(button) {
			var requestData = button.up('reportregion-main').getController().getExportRequestData(),
			    reportIdCondition = Ext.Array.findBy( requestData.data, function(item) { return item.name === 'report_id'; } ),
			    requestCondition = reportIdCondition ? [ reportIdCondition ] : requestData.data;


			new App.common.form.Panel({
				standardSubmit: true,
				url: App.constants.API_CREATE('ods'),
				baseParams: {
					object: 'export',
					method: 'run',
					data: {
						request: [
							{
								object: 'rpt.report_region',
								method: 'rpt.report_region_pf_1_s',
								data: requestCondition
							},
							{
								object: 'rpt.report_region',
								method: 'rpt.report_region_pf_2_s',
								data: requestCondition
							},
							{
								object: 'rpt.report_region',
								method: 'rpt.report_region_pf_3_s',
								data: requestCondition
							}
						],
						filename: 'Региональная справка.ods',
						template: 'report-region-export'
					}
				}
			}).submit({
				waitMsg: false
			});
	},


	updateReport: function(btn){
		var me = this,
		    grid = btn.up('reportregion-grid-panel'),
		    saveButton = grid && grid.down('common-grid-button-save'),
		    next = me.proceedReportUpdate.bind( me, btn );

		btn.disable();

		if( grid.getStore().isDirty() ) {
			grid && grid.on('rowssavesuccess', next, { single: true });
			Ext.defer( function(){ saveButton && saveButton.handler(saveButton); }, 0);
		} else {
			next( btn );
		}
	},


	proceedReportUpdate: function(btn){
		var me = this,
		    mainView = btn.up('reportregion-main'),
		    menu = btn.up(),
		    reportIdField = menu.down('[name=report_id]'),
		    reportNameField = menu.down('[name=report_name]'),
		    vm = me.getViewModel(),
		    grid = mainView.down('reportregion-grid-panel'),
		    filter;

		vm && vm.set( 'specialReportNameFieldIsValid', false );

		App.common.Ajax.request( {
			url: App.constants.API_UPDATE(),
			jsonData: {
				object: 'rpt.report',
				method: 'rpt.report_u',
				data: {
					report_id: reportIdField && reportIdField.getValue(),
					report_name: reportNameField && reportNameField.getValue()
				}
			},

			success: function(response) {
				var rawData = response && response.rawData,
				    data, filter, tagParams, targetParam;

				if ( rawData && rawData.success && rawData.data ) {
					data = rawData.data[ 0 ];
					mainView.setReportId( data.report_id );
					mainView.setReportName( data.report_name );
					mainView.setReportYearBeg( data.report_year_beg );
					mainView.setReportYearEnd( data.report_year_end );

					filter = mainView.down('filter-field');
					tagParams = filter.getTagParams();
					targetParam = tagParams && Ext.Array.findBy( tagParams, function(item) { return item.dataIndex === 'report_id'; } );

					//  если в параметрах фильтрации уже есть необходимый атрибут - меняем соответствующие значения на новые
					if( targetParam ) {
						filter.setTagParams( [ Ext.Object.merge( targetParam, {
							name: 'Наименование',
							rawValue: data.report_name
						}) ] );

						filter.updateTags();
						filter.startFiltration();
					}

					Ext.defer( function(){ grid.getStore().group( 'kls_names_okato' ); }, 0 );

					reportNameField.setValue(null);
					menu.hide();
				}
			},

			failure: function(response){
				var message = response && response.success ? null : response.message;
				message && Ext.toastError( message, 5000, 'tr' );
			}
		} );
		}
});
