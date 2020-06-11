/**
 * Модель представления экранной формы ведения квартальных отчётов
 * @class App.project.modules.reportquarter.view.MainModel
 */
Ext.define('App.project.modules.reportquarter.view.MainModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.reportquarter-main',

	requires: [
		'App.project.modules.reportquarter.model.ReportQuarter',
		'App.project.modules.reportquarter.model.KlsTypePlacing',
		'App.project.modules.reportquarter.model.KlsType',
		'App.project.modules.reportquarter.model.KlsStruct',
		'App.project.modules.reportquarter.model.KlsCustomer',
		'App.project.modules.reportquarter.model.KlsAllowance',
		'App.project.modules.reportquarter.model.Company',
		'App.project.modules.reportquarter.model.KlsMeasure'
	],

	stores: {
		// позиции отчётов
		reportquarterStore: {
			type: 'common-store',
			groupField: 'kls_rubrika_struct',
			remoteSort: false,
			autoLoad: true,
			model: 'App.project.modules.reportquarter.model.ReportQuarter',
			pageSize: 0,
			listeners: {
				update: 'reportquarterStoreUpdateEvent',
				remove: 'reportquarterStoreRemoveEvent'
			}
		}
	},


	data: {
		current: {
			reportquarter: null,
			selection:  null
		},
		reportYearBeg: null,

		gridGroupingTypeCheckedValue: null
	},


	formulas: {
		openModuleLinksDisabled: {
			'bind': '{current.selection}',
			'get': function(selection) {
				return !selection || ( selection.length && selection.length > 1 );
			}
		},
		ctxMenuCntUpdateItemText: {
			'bind': '{current.selection}',
			'get': function(selection) {
				return selection && selection.length && selection.length > 1 ? 'Из контрактов' : 'Из контракта';
			}
		}

	}


});