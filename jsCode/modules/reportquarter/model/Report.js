/**
 * Модель отчёта для реестра
 * @class App.project.modules.reportquarter.model.Report
 */
Ext.define('App.project.modules.reportquarter.model.Report', {
	extend: 'App.common.data.Model',
	idProperty: 'report_id',

	fields: [
		{
			name: 'report_name'
		},
		{
			name: 'report_quarter'
		},
		{
			name: 'report_sources'
		},
		{
			name: 'arr_kls_id_state'
		},
		{
			name: 'kls_id_type_report'
		},
		{
			name: 'report_desc'
		},
		{
			name: 'report_vers'
		},
		{
			name: 'state_json'
		},
		{
			name: 'report_year_beg'
		},
		{
			name: 'report_year_end'
		},
		{
			name: 'arr_kls_id_type',

			serialize: function(value, record) {
				var rec = record.get('arr_kls_id_type');

				if (rec) {
					rec = Ext.encode(rec);
					rec = rec.replace("\[", "{");
					rec = rec.replace("\]", "}");

					return rec;
				}
			}
		},
		{
			name: 'arr_kls_id_allowance',

			serialize: function(value, record) {
				var rec = record.get('arr_kls_id_allowance');

				if (rec) {
					rec = Ext.encode(rec);
					rec = rec.replace("\[", "{");
					rec = rec.replace("\]", "}");

					return rec;
				}
			}
		},
		{
			name: 'arr_kls_id_customer',

			serialize: function(value, record) {
				var rec = record.get('arr_kls_id_customer');

				if (rec) {
					rec = Ext.encode(rec);
					rec = rec.replace("\[", "{");
					rec = rec.replace("\]", "}");

					return rec;
				}
			}
		},
		{
			name: 'arr_kls_id_struct',

			serialize: function(value, record) {
				var rec = record.get('arr_kls_id_struct');

				if (rec) {
					rec = Ext.encode(rec);
					rec = rec.replace("\[", "{");
					rec = rec.replace("\]", "}");

					return rec;
				}
			}
		},
		{
			name: 'arr_kls_id_okato',

			serialize: function(value, record) {
				var rec = record.get('arr_kls_id_okato');

				if (rec) {
					rec = Ext.encode(rec);
					rec = rec.replace("\[", "{");
					rec = rec.replace("\]", "}");

					return rec;
				}
			}
		},
		{
			name: 'arr_company_id',

			serialize: function(value, record) {
				var rec = record.get('arr_company_id');

				if (rec) {
					rec = Ext.encode(rec);
					rec = rec.replace("\[", "{");
					rec = rec.replace("\]", "}");

					return rec;
				}
			}
		},
		{
			name: 'arr_plan_var_id',

			serialize: function(value, record) {
				var rec = record.get('arr_plan_var_id');

				if (rec) {
					rec = Ext.encode(rec);
					rec = rec.replace("\[", "{");
					rec = rec.replace("\]", "}");

					return rec;
				}
			}
		},
		{
			name: 'arr_task_id',

			serialize: function(value, record) {
				var rec = record.get('arr_task_id');

				if (rec) {
					rec = Ext.encode(rec);
					rec = rec.replace("\[", "{");
					rec = rec.replace("\]", "}");

					return rec;
				}
			}
		},

		{
			name: 'type_json'
		},
		{
			name: 'allowance_json'
		},
		{
			name: 'customer_json'
		},
		{
			name: 'struct_json'
		},
		{
			name: 'company_json'
		},
		{
			name: 'okato_json'
		},
		{
			name: 'task_json'
		},
		{
			name: 'plan_var_json'
		},
		{
			name: 'kls_code_type_report'
		},
		{
			name: 'kls_names_type_report'
		},
		{
			name: 'kls_namef_type_report'
		},
		{
			name: 'kls_rubrika_type_report'
		},
		{
			name: 'kls_names_customer_all',
			persist: false,
			convert: function (v, rec) {
				var json = rec.get('customer_json'),
				    names = json && Ext.Array.pluck( json, 'kls_names_customer');
				return names && names.length ? names.join(';') : '';
			},
			depends: [ 'customer_json' ]
		},
		{
			name: 'kls_names_type_all',
			persist: false,
			convert: function (v, rec) {
				var json = rec.get('type_json'),
				    names = json && Ext.Array.pluck( json, 'kls_names_type');
				return names && names.length ? names.join(';') : '';
			},
			depends: [ 'type_json' ]
		},
		{
			name: 'kls_names_struct_all',
			persist: false,
			convert: function (v, rec) {
				var json = rec.get('struct_json'),
				    names = json && Ext.Array.pluck( json, 'kls_names_struct');
				return names && names.length ? names.join(';') : '';
			},
			depends: [ 'struct_json' ]
		},
		{
			name: 'plan_var_all',
			persist: false,
			convert: function (v, rec) {
				var json = rec.get('plan_var_json'),
				    names = json && Ext.Array.pluck( json, 'plan_var_names');
				return names && names.length ? names.join(';') : '';
			},
			depends: [ 'plan_var_json' ]
		}
		// {
		// 	name: 'kls_names_allowance_all',
		// 	persist: false,
		// 	convert: function (v, rec) {
		// 		var json = rec.get('allowance_json'),
		// 		    names = json && Ext.Array.pluck( json, 'kls_names_allowance');
		// 		return names && names.length ? names.join(';') : '';
		// 	},
		// 	depends: [ 'allowance_json' ]
		// },
		// {
		// 	name: 'names_company_all',
		// 	persist: false,
		// 	convert: function (v, rec) {
		// 		var json = rec.get('company_json'),
		// 		    names = json && Ext.Array.pluck( json, 'company_names');
		// 		return names && names.length ? names.join(';') : '';
		// 	},
		// 	depends: [ 'company_json' ]
		// },
		// {
		// 	name: 'kls_names_okato_all',
		// 	persist: false,
		// 	convert: function (v, rec) {
		// 		var json = rec.get('okato_json'),
		// 		    names = json && Ext.Array.pluck( json, 'kls_names_okato');
		// 		return names && names.length ? names.join(';') : '';
		// 	},
		// 	depends: [ 'okato_json' ]
		// },
		// {
		// 	name: 'names_task_all',
		// 	persist: false,
		// 	convert: function (v, rec) {
		// 		var json = rec.get('task_json'),
		// 		    names = json && Ext.Array.pluck( json, 'task_name');
		// 		return names && names.length ? names.join(';') : '';
		// 	},
		// 	depends: [ 'task_json' ]
		// }
	],

	validators: {
		report_name: 'presence',
		report_quarter: 'presence',
		report_year_beg: 'presence'
	},

	proxy: {
		extraParams: {
			object: 'rpt.report',
			create: {
				method: 'rpt.report_i'
			},
			read: {
				method: 'rpt.report_s',
				data: [
					App.common.data.prepare.Condition.$eq('kls_code_type_report', 'QUARTER')
				]
			},
			update: {
				method: 'rpt.report_u'
			},
			destroy: {
				method: 'rpt.report_d'
			}
		}
	}
});