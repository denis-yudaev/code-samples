/**
 * Контроллер представления окна выбора источников отчёта
 * @class App.project.modules.reportquarter.view.sources.MainController
 */
Ext.define('App.project.modules.reportquarter.view.sources.MainController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.reportquarter-sources-controller',

	control: {
		'reportquarter-sources-grid': {
			rowssavesuccess: function(){
				this.getView().close();
			}
		},
		'reportquarter-sources-grid common-combobox': {
			// Перед запросом к субд изменить условия запроса
			beforequery: function(query) {
				var proxy,          // Объект прокси
					request,          // Запрос к субд
					reportId;

				delete query;

				reportId = this.getView().getInitialConfig().reportId;

				//  берём проксю
				proxy = query.combo.getStore().getProxy();

				//  формируем запрос
				request = [
					App.common.data.prepare.Condition.$ne( 'report_id', reportId )
				];
				proxy.setReadParams(request);
				return true;
			}
		},

		// События для таблицы с данными в режиме редактирования ячейки
		'reportquarter-sources-grid editor': {
			/**
			 * Возможность редактировать любое поле строки (записи)
			 * Если запись только что создана и не была записана в БД - редактировать можно все поля
			 * Если запись была получена из БД - редактировать нельзя
			 * @param r запись строки
			 */
			beforestartedit: function(r) {
				var phantom,            // Была строка записанна в БД (да - false, нет - true)
					editing = false;    // Переключатель возможности редактирования

				// Получим свойство "phantom" - такие записи еще не были записанны в БД (значени true)
				if (r.context && r.context && r.context.record) phantom = r.context.record.phantom;

				// Если записи еще нет в БД (phantom == true)
				// Запустим редактирование ячейки
				if (phantom) {
					editing = true;
				} else {
					// Известить о невозможности редактировать поле
					Ext.toastWarning('<b>Это поле можно редактировать только при создании новой записи</b><br/>'+
						'Удалите и создайте заново, выбрав нужный, Вам, план', 5000, 'tr');
				}
				// Вернуть значение true / false - будет / не будет разрешено редактирование ячейки
				return editing;
			}
		}
	}
});



