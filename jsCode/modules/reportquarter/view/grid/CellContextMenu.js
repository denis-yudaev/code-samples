/**
 * Контекстное меню ячеек таблицы квартальных отчётов
 * @class App.project.modules.reportquarter.view.grid.CellContextMenu
 */
Ext.define('App.project.modules.reportquarter.view.grid.CellContextMenu', {
	extend: 'App.project.menu.CellContextMenu',
	alias: 'widget.reportquarter-grid-panel-cellcontextmenu',

	width: 400,

	config: {
		selectedColumn: null,
		cellIndex: null,
		record: null,
		filterOptions: null
	},

	items: [
		{
			//  редактирование контрактов
			iconCls: 'x-icon-common-menu-small open-module-btn-icon',
			text: 'Редактирование контрактов',
			handler: 'openModule',
			'bind': {
				disabled: '{openModuleLinksDisabled}'
			},
			filterOptions: {
				//  данные для фильтра
				path: 'App.project.modules.executegoz.view.card.contracts.window.Panel',
				filterAttribute: 'contract_id',
				rawValueAttribute: 'contract_num',
				emptyRowMessage: 'Связанные контракты отсутствуют.'
			},
			style: {
				padding: '5px 5px 5px 6px'
			}
		},
		{
			//  предприятие
			iconCls: 'x-icon-common-menu-small open-module-btn-icon',
			text: 'Перейти к исполнителю',
			handler: 'openModule',
			'bind': {
				disabled: '{openModuleLinksDisabled}'
			},
			filterOptions: {
				//  данные для фильтра
				path: 'App.project.modules.org.view.Main',
				filterAttribute: 'company_id',
				rawValueAttribute: 'company_names',
				emptyRowMessage: 'Отсутствуют данные об исполнителе.'
			},
			style: {
				padding: '5px 5px 5px 6px'
			}
		},
		{
			//  задание ГОЗ
			iconCls: 'x-icon-common-menu-small open-module-btn-icon',
			text: 'Перейти к заданию ГОЗ',
			handler: 'openModule',
			'bind': {
				disabled: '{openModuleLinksDisabled}'
			},
			filterOptions: {
				//  данные для фильтра
				path: 'App.project.modules.tasks.view.Main',
				filterAttribute: 'task_id',
				rawValueAttribute: 'task_name',
				emptyRowMessage: 'Отсутствуют данные о задании ГОЗ.'
			},
			style: {
				padding: '5px 5px 5px 6px'
			}
		},
		{
			//  задание ГОЗ
			iconCls: 'x-icon-common-menu-small open-module-btn-icon',
			text: 'Перейти к образцу',
			handler: 'openModule',
			'bind': {
				disabled: '{openModuleLinksDisabled}'
			},
			filterOptions: {
				//  данные для фильтра
				path: 'App.project.modules.guidevvst.view.Main',
				filterAttribute: 'sample_id',
				rawValueAttribute: 'sample_name',
				emptyRowMessage: 'Связанные образцы отсутствуют.'
			},
			style: {
				padding: '5px 5px 5px 6px'
			}
		},

		'-',

		{
			text: 'Обновить «Состояние выполнения задания ГОЗ»',
			icon: false,
			padding: '2 0 5 0',
			menu: {
				plain: true,
				width: 220,
				style: {
					backgroundColor: 'white',
					padding: '5px 0'
				},
				items: [
					{
						itemId: 'updateFromContracts',
						style: {
							textAlign: 'center'
						},
						bind: {
							text: '{ctxMenuCntUpdateItemText}',
							disabled: '{!current.selection}'
						}
					},

					'-',

					{
						text: 'Из плана ГОЗ',
						itemId: 'updateFromGozItem',
						style: {
							textAlign: 'center'
						},
						bind: {
							disabled: '{!current.selection}'
						}
					},

					'-',

					{
						icon: false,
						labelWidth: 66,
						labelStyle: 'font-size: 13px; line-height: 15px; color: #000000; text-align: right;',
						style: {
							// marginLeft: '10px',
							width: '100%'
						},
						xtype: 'common-combobox',
						fieldLabel: 'Из отчета',
						labelAlign: 'left',
						displayField: 'report_name',
						valueField: 'report_id',
						itemId: 'updateFromReport',
						store: {
							type: 'common-store',
							model: 'App.project.modules.reportquarter.model.ContextMenuReportVar'
						}
					}
				]
			}
		}
	],


	initComponent: function() {
		var me = this,
		    controller = me.getController();

		controller.control( '[itemId=updateFromGozItem]', {
			click: Ext.Function.pass( me.updateFromGozCards, [ me ] )
		});

		controller.control( '[itemId=updateFromContracts]', {
			click: Ext.Function.pass( me.updateFromContracts, [ me ] )
		});

		controller.control( '[itemId=updateFromReport]', {
			select: Ext.Function.pass( me.onEditorSelect, [ me ] ),
			change: Ext.Function.pass( me.onEditorChange, [ me ] )
		});

		me.on('show', function(self){
			var updateFromReportCombo = self.down('[itemId=updateFromReport]');

			if( updateFromReportCombo ) {
				updateFromReportCombo.suspendEvent('change');
				updateFromReportCombo.clearValue();
				updateFromReportCombo.resumeEvent('change');
			}
		});

		me.callParent( arguments );
	},


	onEditorSelect: function(menu, self, record){
		var value, grid, records, total, reportData, taskId,
			column = menu.getSelectedColumn();

		if( column && record && record.data )
		{
			grid = column && column.getView().ownerGrid;
			records = grid && grid.getSelection();
			total = records && records.length - 1;

			Ext.getBody().mask('Загрузка...');

			App.common.Ajax.request({
				url: App.constants.API_READ(),
				jsonData: {
					object: 'rpt.report_quarter',
					method: 'rpt.report_quarter_s',
					data: [
						App.common.data.prepare.Condition.$eq( 'report_id', record.data.report_id ),
						App.common.data.prepare.Condition.$isnn( 'task_id' )
					],
					limit: null
				},

				callback: function(options, success, response) {
					var responseText = success && Ext.JSON.decode( response.responseText, true ),
					    data;

					if( responseText && responseText.success && responseText.data && responseText.data.length ) {
						data = responseText.data;

						records.forEach( function( item, i ) {
							taskId = item && item.data && item.data.task_id;
							reportData = Ext.Array.findBy( data, function(o){ return o.task_id === taskId; });
							value = reportData && reportData.execution_state || reportData && reportData.execution_state_o;
							value && item.set( 'execution_state', value );

							if( i <= total ) {
								Ext.getBody().unmask();
								menu.hide();
							}
						});
					} else {
						Ext.getBody().unmask();
					}
				}

			});
		}
	},


	onEditorChange: function(menu, self, newValue, oldValue) {
		var column, grid, records;

		if( !newValue && ( newValue !== oldValue ) ) {
			column = menu.getSelectedColumn();
			grid = column.getView().ownerGrid;
			records = grid.getSelection();

			records.forEach( function( item ) {
				item.set( 'execution_state', null );
			});
		}
	},


	updateFromContracts: function( menu ){
		var column = menu.getSelectedColumn(),
		    grid = column && column.getView().ownerGrid,
		    records = grid && grid.getSelection(),
		    contractIds = records && Ext.Array.unique( Ext.Array.clean( Ext.Array.pluck( Ext.Array.pluck( records, 'data' ), 'contract_id' ) ) ),
		    recordsMap = {};

		if( contractIds && contractIds.length ) {
			Ext.Array.forEach( records, function(r) { this[r.data.contract_id] = r; }, recordsMap );

			Ext.getBody().mask('Загрузка...');

			App.common.Ajax.request( {
				url: App.constants.API_READ(),
				jsonData: {
					object: 'cnt.contract',
					method: 'cnt.contract_execution_state_s',
					data: [
						App.common.data.prepare.Condition.$in( 'contract_id', contractIds )
					],
					limit: null
				},

				callback: function(options, success, response) {
					var responseText = success && Ext.JSON.decode( response.responseText, true ),
					    data, total, executionState;

					if ( responseText && responseText.success && responseText.data && responseText.data.length ) {
						data = responseText.data;
						total = records && records.length && records.length - 1;

						records.forEach( function( item, i ) {
							executionState = Ext.Array.findBy( data, function(o){ return o.contract_id + '' === item.data.contract_id + ''; }) || {};
							executionState.execution_state && item.set( 'execution_state', executionState.execution_state );

							if( i <= total ) {
								Ext.getBody().unmask();
							}
						});

					} else {
						Ext.getBody().unmask();
					}
				}
			} );
		}
	},


	updateFromGozCards: function( menu ){
		var column = menu.getSelectedColumn(),
		    grid = column && column.getView().ownerGrid,
		    records = grid && grid.getSelection(),
		    cardIds = records && Ext.Array.unique( Ext.Array.clean( Ext.Array.pluck( Ext.Array.pluck( records, 'data' ), 'card_id' ) ) ),
		    reportYearBeg, recordsMap = {};

		if( cardIds && cardIds.length ) {
			reportYearBeg = records[0].data.report_year_beg;
			Ext.Array.forEach( records, function(r) { this[r.data.card_id] = r; }, recordsMap );

			Ext.getBody().mask('Загрузка...');

			App.common.Ajax.request( {
				url: App.constants.API_READ(),
				jsonData: {
					object: 'pln.plan_var_card_goz',
					method: 'pln.plan_var_card_goz_s',
					data: [
						App.common.data.prepare.Condition.$in( 'card_id', cardIds )
					],
					limit: null
				},

				callback: function(options, success, response) {
					var responseText = success && Ext.JSON.decode( response.responseText, true ),
					    data, total, yearDesc;

					if ( responseText && responseText.success && responseText.data && responseText.data.length ) {
						data = responseText.data;
						total = data && data.length && data.length - 1;

						total >= 0 && data.forEach( function(row, i) {
							yearDesc = ( Ext.Array.findBy( row.plan_var_data_year, function(obj){ return +obj.data_year === reportYearBeg; } ) || {} ).data_year_desc;
							yearDesc && recordsMap[ row.card_id ].set( 'execution_state', yearDesc );

							if ( i <= total ) {
								Ext.getBody().unmask();
							}
						} );
					} else {
						Ext.getBody().unmask();
					}
				}

			} );

		}
	}



});