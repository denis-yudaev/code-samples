/**
 * Квартальные отчёты
 * @class App.project.modules.reportquarter.model.ReportQuarter
 */
Ext.define('App.project.modules.reportquarter.model.ReportQuarter', {
	extend: 'App.common.data.Model',
	idProperty: 'report_quarter_id',  //  Отчет

	requires: [
		'App.project.data.validator.PresenceOnCreate'
	],

	fields: [
		//  Структурный классификатор
		{
			name: 'kls_code_struct',
			type: 'string'
		},
		{
			name: 'kls_id_struct',
			type: 'integer'
		},
		{
			name: 'kls_names_struct',
			type: 'string'
		},
		{
			name: 'kls_namef_struct',
			type: 'string'
		},
		{
			name: 'kls_rubrika_struct',
			persist: false
		},

		{
			name: 'breakdown'  //  Срыв
		},
		{
			name: 'company_address'  //  Наименование головного исполнителя
		},
		{
			name: 'company_id'  //  Головной исполнитель
		},
		{
			name: 'company_names'  //  Наименование головного исполнителя
		},
		{
			name: 'contract_amount'  //  Объем ассигнований по госконтракту в отчетном году
		},
		{
			name: 'contract_date_beg'  //  Дата заключения контракта
		},
		{
			name: 'contract_date_end'  //  Дата окончания исполнения
		},
		{
			name: 'contract_num'  //  Регистрационный номер контракта
		},
		{
			name: 'contract_price'  //  Цена госконтракта (договора) с учетом дополнительных соглашений
		},
		{
			name: 'data_amount'  //  Объем поставки (ремонта) по гособоронзаказу
		},
		{
			name: 'data_amount_contract'  //  Объем поставки (ремонта) по госконтракту в отчетном году
		},
		{
			name: 'data_amount_correct'  //  Объем поставки (ремонта) по гособоронзаказу с учетом уточнений
		},
		{
			name: 'data_price'  //  Объем ассигнований по гособоронзаказу ППРФ
		},
		{
			name: 'data_price_contract'  //  Объем ассигнований по госконтракту в отчетном году
		},
		{
			name: 'data_price_correct'  //  Объем ассигнований по гособоронзаказу с учетом его уточнения
		},
		{
			name: 'execution_state'  //  Состояние выполнения задания ГОЗ
		},
		{
			name: 'is_blocked'  //  Заблокировано
		},
		{
			name: 'is_checked'  //  Проверено
		},
		{
			name: 'kls_code_measure'  //  Дата окончания исполнения
		},
		{
			name: 'kls_code_type'  //  Вид работ
		},
		{
			name: 'kls_code_type_placing'  //  Способ размещения
		},
		{
			name: 'kls_id_measure'  //  Дата окончания исполнения
		},
		{
			name: 'kls_id_type'  //  Вид работ
		},
		{
			name: 'report_kbk'  //  КБК
		},
		{
			name: 'kls_id_type_placing'  //  Способ размещения
		},
		{
			name: 'kls_namef_measure'  //  Дата окончания исполнения
		},
		{
			name: 'kls_namef_type'  //  Вид работ
		},
		{
			name: 'kls_namef_type_placing'  //  Способ размещения
		},
		{
			name: 'kls_names_measure'  //  Дата окончания исполнения
		},
		{
			name: 'kls_names_type'  //  Вид работ
		},
		{
			name: 'kls_names_type_placing'  //  Способ размещения
		},
		{
			name: 'kls_rubrika_measure',  //  Дата окончания исполнения
			defaultValue:null,
			allowNull: true,
			persist: false
		},
		{
			name: 'kls_rubrika_type',  //  Вид работ
			defaultValue:null,
			allowNull: true,
			persist: false
		},
		{
			name: 'kls_rubrika_type_placing',  //  Способ размещения
			defaultValue:null,
			allowNull: true,
			persist: false
		},
		{
			name: 'kls_rubrika_allowance',  //  Вид работ
			defaultValue:null,
			allowNull: true,
			persist: false
		},
		{
			name: 'kls_rubrika_customer',  //  Способ размещения
			defaultValue:null,
			allowNull: true,
			persist: false
		},
		{
			name: 'payment_sum'  //  Сумма выплат по контракту в отчетном квартале (Всего выплачено за отчетный период)
		},
		{
			name: 'payment_sum_advance'  //  Сумма авансовых выплат по контракту в отчетном квартале (В том числе выплачено авансов)
		},
		{
			name: 'payment_sum_before'  //  Всего выплачено по госконтракту по состоянию на 1 число месяца, следующего за отчетным периодом
		},
		{
			name: 'person_blocked_date'  //  Дата блокировки
		},
		{
			name: 'person_changed_date'  //  Дата изменения
		},
		{
			name: 'person_checked_date'  //  Дата проверки
		},
		{
			name: 'person_id_blocked'  //  Заблокировал
		},
		{
			name: 'person_id_changed'  //  Изменил
		},
		{
			name: 'person_id_checked'  //  Проверил
		},
		{
			name: 'person_fio_blocked'  //  Заблокировал
		},
		{
			name: 'person_fio_changed'  //  Изменил
		},
		{
			name: 'person_fio_checked'  //  Проверил
		},
		{
			name: 'pretensions'  //  Выставление претензий
		},
		{
			name: 'report_quarter_desc'  //  Примечание
		},
		{
			name: 'report_quarter_vers',  //  Версия
			critical: true
		},
		{
			name: 'stage_amount_period'  //  Количество поставлено за отчетный период
		},
		{
			name: 'stage_price_period'  //  Стоимость выполненных работ за отчетный период
		},
		{
			name: 'task_code'  //  Шифр работы
		},
		{
			name: 'task_name'  //  Наименование работы
		},
		{
			name: 'task_year_beg'  //  Год начала
		},
		{
			name: 'task_year_end'  //  Год окончания
		},
		{
			name: 'task_code_o'
		},
		{
			name: 'task_name_o'
		},
		{
			name: 'kls_names_type_o'
		},
		{
			name: 'kls_namef_type_o'
		},
		{
			name: 'kls_names_struct_o'
		},
		{
			name: 'kls_namef_struct_o'
		},
		{
			name: 'kls_names_type_placing_o'
		},
		{
			name: 'kls_namef_type_placing_o'
		},
		{
			name: 'kls_names_measure_o'
		},
		{
			name: 'kls_namef_measure_o'
		},
		{
			name: 'kls_names_customer_o'
		},
		{
			name: 'kls_namef_customer_o'
		},
		{
			name: 'kls_names_allowance_o'
		},
		{
			name: 'kls_namef_allowance_o'
		},
		{
			name: 'contract_num_o'
		},
		{
			name: 'company_names_o'
		},
		{
			name: 'locked',
			persist: false,
			calculate: function(data){
				return !! ( data && data.is_blocked );
			}
		}
		//
		// {
		// 	name: 'grouping_field',
		// 	persist: false,
		// 	calculate: function(data){
		// 		return data && data.kls_rubrika_struct || '0';
		// 	}
		// }
	],

	validators: {
		task_name   : 'presence-create'
	},

	proxy: {
		extraParams: {
			object: 'rpt.report_quarter',
			create: {
				method: 'rpt.report_quarter_i'
			},
			read: {
				method: 'rpt.report_quarter_s',
				order: {
					kls_rubrika_struct: 'ASC',
					kls_namef_struct: 'ASC'
				}
			},
			update: {
				method: 'rpt.report_quarter_u'
			},
			destroy: {
				method: 'rpt.report_quarter_d'
			}
		}
	}
});