/**
 * @class App.project.modules.reportquarter.view.registry.ViewModel
 */
Ext.define('App.project.modules.reportquarter.view.registry.ViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.reportquarter-registry-viewmodel',

	requires: [
		'App.project.modules.reportquarter.model.Company',
		'App.project.modules.reportquarter.model.KlsOkato',
		'App.project.modules.reportquarter.model.Task',
		'App.project.modules.reportquarter.model.KlsCustomer',
		'App.project.modules.reportquarter.model.KlsRegistryCustomer',
		'App.project.modules.reportquarter.model.KlsStruct',
		'App.project.modules.reportquarter.model.KlsAllowance',
		'App.project.modules.reportquarter.model.KlsRegistryAllowance',
		'App.project.modules.reportquarter.model.KlsType',
		'App.project.modules.reportquarter.model.Report',
		'App.project.modules.reportquarter.model.PlanVar'
	],

	stores: {
		//  список вариантов отчётов
		reportStore: {
			type: 'common-store',
			autoLoad: true,
			model: 'App.project.modules.reportquarter.model.Report',
			piageSize: 0
		}
	},


	data: {
		current: {
			report: null
		}
	},



	formulas: {

		arrPlanVarId: {
			'bind': {
				bindTo: '{current.report}',
				deep: true
			},
			'get': function(report) {
				var arrPlanVarId = report && report.data && report.data.arr_plan_var_id;
				return arrPlanVarId && !Ext.isEmpty( arrPlanVarId ) ? arrPlanVarId : null;
			}
		}

	}


});