/**
 * Региональные отчёты
 * @class App.project.modules.reportregion.model.ReportRegion
 */
Ext.define('App.project.modules.reportregion.model.ReportRegion', {
	extend: 'App.common.data.Model',
	idProperty: 'report_region_id',  //  Отчет

	fields: [
		{
			name: "report_id"            //  Отчет
		},
		{
			name: "company_id"           //  Головной исполнитель
		},
		{
			name: "company_names"        //  Наименование головного исполнителя
		},
		{
			name: "company_address"      //  Наименование головного исполнителя
		},
		{
			name: "contract_id"          //  Контракт
		},
		{
			name: "contract_num"         //  Регистрационный номер контракта
		},
		{
			name: "contract_date_beg"    //  Дата заключения контракта
		},
		{
			name: "contract_date_end"    //  Дата окончания исполнения
		},
		{
			name: "data_year"            //  Год
		},
		{
			name: "data_price"           //  Объем на год
		},
		{
			name: "payment_sum"          //  Оплаты
		},
		{
			name: "execution_percent"    //  % выполнения
		},
		{
			name: "data_price_possible"  //  Возможный объем финансирования
		},
		{
			name: "contract_desc"        //  Примечание
		},
		{
			name: "problems"             //  Проблемные вопросы по выполнению ГК
		},
		{
			name: "arrangements"         //  Принятые меры по решению проблемных вопросов
		},
		{
			name: "stage_amount_1"       //  Количество (1 квартал)
		},
		{
			name: "stage_amount_2"       //  Количество (2 квартал)
		},
		{
			name: "stage_amount_3"       //  Количество (3 квартал)
		},
		{
			name: "stage_amount_4"       //  Количество (4 квартал)
		},
		{
			name: "amount_vp"            //  Количество ВВСТ принятое ВП
		},
		{
			name: "amount_fact"          //  Количество фактически отгруженых единиц ВВСТ
		},
		{
			name: "arr_task_id"          //  Массив заданий ГОЗ
		},
		{
			name: "task_fullname"        //  Наименование позиции
		},
		{
			name: "kls_id_okato"         //  ОКАТО
		},
		{
			name: "kls_code_okato"       //  ОКАТО
		},
		{
			name: "kls_names_okato"      //  ОКАТО
		},
		{
			name: "kls_namef_okato"      //  ОКАТО
		},
		{
			name: "kls_rubrika_okato"    //  ОКАТО
		},
		{
			name: "kls_id_type"          //  Вид работ
		},
		{
			name: "kls_code_type"        //  Вид работ
		},
		{
			name: "kls_names_type"       //  Вид работ
		},
		{
			name: "kls_namef_type"       //  Вид работ
		},
		{
			name: "kls_rubrika_type"     //  Вид работ
		},
		{
			name: "kls_id_customer"      //  Заказчик
		},
		{
			name: "kls_code_customer"    //  Заказчик
		},
		{
			name: "kls_names_customer"   //  Заказчик
		},
		{
			name: "kls_namef_customer"   //  Заказчик
		},
		{
			name: "kls_rubrika_customer" //  Заказчик
		},
		{
			name: "report_region_desc"   //  Общее примечание к записи
		},
		{
			name: "report_region_id"     //  Идентификатор
		},
		{
			name: "report_region_vers",   //  Версия
			critical: true
		},
		{
			name: "task_fullname_o"      //  Наименование позиции
		},
		{
			name: "company_names_o"      //  Предприятие-исполнитель
		},
		{
			name: "kls_namef_customer_o" //  Заказчик
		},
		{
			name: "kls_namef_okato_o"    //  ОКАТО
		},
		{
			name: "kls_names_type_o"     //  Вид работ
		},
		{
			name: "kls_names_okato_o"    //  ОКАТО
		},
		{
			name: "contract_name_o"      //  Контракт
		},
		{
			name: "kls_namef_type_o"     //  Вид работ
		},
		{
			name: "contract_num_o"       //  Контракт
		},
		{
			name: "kls_names_customer_o" //  Заказчик
		},
		{
			name: 'is_changed'           //  Изменен
		},
		{
			name: 'is_checked'           //  Проверено
		},
		{
			name: 'is_blocked'           //  Заблокировано
		},
		{
			name: 'person_id_changed'    //  Изменил
		},
		{
			name: 'person_id_checked'    //  Проверил
		},
		{
			name: 'person_id_blocked'    //  Заблокировал
		},
		{
			name: 'person_fio_changed'   //  Изменил
		},
		{
			name: 'person_fio_checked'   //  Проверил
		},
		{
			name: 'person_fio_blocked'   //  Заблокировал
		},
		{
			name: 'person_changed_date'  //  Дата изменения
		},
		{
			name: 'person_checked_date'  //  Дата проверки
		},
		{
			name: 'person_blocked_date'  //  Дата блокировки
		},
		{
			name: 'locked',
			persist: false,
			calculate: function(data){
				return !! ( data && data.is_blocked );
			}
		}
	],

	validators: {
		// kls_id_type   : 'presence'
	},

	proxy: {
		extraParams: {
			object: 'rpt.report_region',
			create: {
				method: 'rpt.report_region_i'
			},
			read: {
				method: 'rpt.report_region_s',
	            order: {
					kls_rubrika_type: 'ASC'
				}
			},
			update: {
				method: 'rpt.report_region_u'
			},
			destroy: {
				method: 'rpt.report_region_d'
			}
		}
	}
});