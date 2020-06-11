/**
 * Модель представления экранной формы ведения региональной справки
 * @class App.project.modules.reportregion.view.MainModel
 */
Ext.define('App.project.modules.reportregion.view.MainModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.reportregion-main',

	requires: [
		'App.project.modules.reportregion.model.Report',
		'App.project.modules.reportregion.model.ReportRegion',

		'App.project.modules.reportregion.model.Company',
		'App.project.modules.reportregion.model.KlsOkato',
		'App.project.modules.reportregion.model.KlsCustomer',
		'App.project.modules.reportregion.model.KlsStruct',
		'App.project.modules.reportregion.model.KlsAllowance',
		'App.project.modules.reportregion.model.KlsType',
		'App.project.modules.reportregion.model.KlsStructTreeModel'
	],

	stores: {
		//  позиции отчёта
		reportregionStore: {
			groupField: 'kls_names_okato',
			type: 'common-store',
			autoLoad: true,
			model: 'App.project.modules.reportregion.model.ReportRegion',
			pageSize: 0
		},
		//  отчёты
		reportStore: {
			type: 'common-store',
			autoLoad: false,
			pageSize: 0,
			model: 'App.project.modules.reportregion.model.Report'
		}
	},


	data: {
		current: {
			reportregion: null
		},

		specialReportNameFieldIsValid: null
	},


	formulas: {

		isNullReportName: {
			'bind': {
				bindTo: '{mainView}',
				deep: true
			},
			'get': function(main) {
				return main && main.reportId && main.reportName === null;
			}
		},

		showSpecialSaveButton: function (get) {
			return get('isNullReportName');
		},

		//  реализовать поддержку многолетних региональных справок
		reportYearData: {
			'bind': {
				bindTo: '{reportregion}',
				deep: true
			},
			'get': function(row) {
				var data;

				if( !row ) {
					return [];
				} else {
					data = row && row.data;
					return [];
				}
			}
		}

	}


});