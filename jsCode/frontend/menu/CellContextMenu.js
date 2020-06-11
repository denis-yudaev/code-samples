/**
 *  Базовый класс контекстного меню для таблиц, где через контекстное меню должны осуществляться переходы на экранные формы со связанными
 * информационными сущностями.
 *  Пока предусмотрены только переходы на простые экранные формы без обязательных параметров фильтрации, но в дальнейшем функционал компонента будет
 * расширяться...
 *
 * @class App.project.menu.CellContextMenu
 */
Ext.define('App.project.menu.CellContextMenu', {
	extend : 'Ext.menu.Menu',
	alias: 'widget.project-cellcontextmenu',

	config: {
		cellIndex: null,
		record: null,
		filterOptions: null
	},


	cls: 'project-cellcontextmenu',

	closeAction: 'hide',
	width: 200,


	/**
	 * @description API
	 *  1. Для создания ссылки на другую экранную форму, не имеющую обязательных параметров фильтрации, добавляем в наследующем компоненте
	 * элемент в массив `items` примерно следующего содержания:
	 *
	 * {
	 *  //  редактирование контрактов
	 *  iconCls: 'x-icon-common-menu-small open-module-btn-icon',
	 *  text: 'Редактирование контрактов',
	 *  handler: 'openModule',
	 *  //  параметры для фильтра целевой экранной формы
	 *  filterOptions: {
	 *      //  класс целевого модуля
	 * 	    path: 'App.project.modules.executegoz.view.card.contracts.window.Panel',
	 * 	    //  атрибут идентификатора связанного объекта
	 * 	    filterAttribute: 'contract_id',
	 * 	    //  атрибут, использующийся для текстового наполнения соответствующего "тэга" фильтрации
	 * 	    rawValueAttribute: 'contract_num',
	 * 	    //  необязательный аргумент с текстом сообщения об отсутствующей связанной записи указанного типа,
	 * 	    // текст по-умолчанию: "Отсутствует связанный элемент."
	 * 	    emptyRowMessage: 'Связанные контракты отсутствуют.'
	 *  }
	 * }
	 * ...
	 */

	controller: {
		type: 'default',


		//  метод, загружающий модуль с предустановлеенными настройками фильтра
		openModule: function(self) {
			var me = this,
			    view = me.getView(),
			    record = view && view.getRecord(),
			    options = self.filterOptions,
			    path = options && options.path;

			if( record && !record.get( options.filterAttribute ) ) {
				Ext.toastWarning( options.emptyRowMessage || 'Отсутствует связанный элемент.', 4000, 'tr');
				return;
			}

			//  компонент должен обязательно быть сконфигурирован строкой с данными для фильтра
			if ( record && path ) {
				view.setFilterOptions( options );
				Ext.getBody().mask('Загрузка...');

				App.apiUI.module.open( path, {
					callback: me.callbackMethodApplying.bind( me )
				} );
			}
		},


		callbackMethodApplying: function(main) {
			var me = this;

			if ( main && main.rendered ) {
				me.openModuleCallback.apply( me, [ main ] );
			} else {
				main.on({
					afterrender: {
						fn: me.openModuleCallback.bind( me, main ),
						options: {
							single: true
						}
					}
				});
			}
		},


		openModuleCallback: function(mainView) {
			var me = this,  //  контроллер
			    menu = me.getView(),  //  контекстное меню
			    options = menu.getFilterOptions(),  //  записанные опции фильтра
			    record = menu.getRecord(),  //  текущая запись для получения значений для фильтра
			    attributeName = options && options.filterAttribute,  //  атрибут, значение которого используется для фильтрации
			    rawValueAttributeName = options && options.rawValueAttribute, //  атрибут, значение которого используется для отрисовки тэга в фильтре
			    attribute = record && record.get( attributeName ),
			    rawValue = record && record.get( rawValueAttributeName ),
			    filter = mainView && mainView.down( 'filter-field' ),  //  компонент фильтра
			    grid = filter.getDataGrid(),  //  таблица целевой формы
			    store = grid && grid.getStore(),
			    meta = record.getProxy().getReader().metaData || store && store.getProxy().getReader().metaData || {},
			    filterTagName = meta ? Ext.Array.findBy( meta, function(item) { return item.name === rawValueAttributeName; } ) : record,
			    condition = App.common.data.prepare.Condition.$eq( attributeName, attribute ),  //  условие запроса фильтрации
			    tagParams = filter.getTagParams(),
			    targetParam = Ext.Array.findBy( tagParams, function(item) { return item.dataIndex === attributeName; } ),
			    newFilterTagParams = targetParam ? [
				    //  если в параметрах фильтрации уже есть необходимый атрибут - меняем соответствующие значения на новые
				    Ext.Object.merge(targetParam, {
					    data:     condition,
					    rawValue: rawValue
				    })
			    ] : [
				    // если нет - создаём новый объект параметров фильтрации
				    {
					    dataIndex: attributeName,
					    name:      filterTagName && filterTagName.text || '',
					    data:      condition,
					    rawValue:  rawValue
				    }
			    ];
			//  устанавливаем новые параметры в фильтр и запускаем его
			filter.setTagParams( newFilterTagParams );
			filter.updateTags();
			store && store.on({
				load: { fn: function(){ Ext.getBody().unmask(); grid.selModel.select(0); }, single: true }
			});
			filter.startFiltration();
		}
	},


	//  расширенный метод showAt, записывающий переданные c аргументом `params` значения в одноимённые параметры конфигурации
	showAt: function(x, y, animate, params) {
		var me = this;

		if( !Ext.isEmpty(params) ) {
			Ext.Object.each( params, function(attribute, value){
				var setter = 'set' + Ext.String.capitalize( attribute );
				me[setter] && me[setter](value);
			}, me );
		}

		me.callParent( arguments );
	}

});