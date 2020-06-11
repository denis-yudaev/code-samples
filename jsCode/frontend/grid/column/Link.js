/**
 * Колонка, позволяющая реализовывать открытие другой ЭФ по клику
 * @class App.project.grid.column.Link
 */
Ext.define('App.project.grid.column.Link', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.project-grid-linkcolumn',

	config: {
		cellIndex: null,
		record: null,
		filterOptions: null
	},

	valueField: null,
	titleField: null,

	defaultRenderer: function(rawValue, metaData, record, rowIndex, colIndex, store, view) {
		var me = this,
			value = ( me.valueField && record.get(me.valueField) ) || rawValue,
			title = me.titleField && record.get(me.titleField),
			cellTitle = title ? ' title="' + title + '"' : '';

		return value ? '<a' + cellTitle + ' href="#">' + value + '</a>' : '';
	},

	processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
		var me = this,
			target = e.getTarget(),
			key = type === 'keydown' && e.getKey(),
			disabled;

		if (target && target.className.match(me.actionIdRe)) {
			disabled = me.disabled || false;

			if (!disabled && record.get(me.filterOptions.filterAttribute)) {
				if (type === 'mousedown') {
					e.preventDefault();
					return false;
				}

				if (type === 'click' || (key === e.ENTER || key === e.SPACE)) {
					me.handleClick(view, recordIndex, cellIndex, e, record, row);
					e.preventDefault();
					return false;
				}
			}
		}

		return me.callParent(arguments);
	},

	handleClick: function(view, recordIndex, cellIndex, e, record, row) {
		var me = this;
		record && me.setRecord(record);
		me.openModule(me);
	},

	//  метод, загружающий модуль с предустановлеенными настройками фильтра
	openModule: function(self) {
		var me = this,
			record = me.getRecord(),
			options = self.filterOptions,
			path = options && options.path;

		if (record && !record.get(options.filterAttribute)) {
			Ext.toastWarning(options.emptyRowMessage || 'Отсутствует связанный элемент.', 4000, 'tr');
			return;
		}

		//  компонент должен обязательно быть сконфигурирован строкой с данными для фильтра
		if (record && path) {
			me.setFilterOptions(options);
			Ext.getBody().mask('Загрузка...');

			App.apiUI.module.open(path, {
				callback: me.callbackMethodApplying.bind(me)
			});
		}
	},

	callbackMethodApplying: function(main) {
		var me = this;

		if (main && main.rendered) {
			me.openModuleCallback.apply(me, [main]);
		} else {
			main.on({
				afterrender: {
					fn: me.openModuleCallback.bind(me, main),
					options: {
						single: true
					}
				}
			});
		}
	},

	openModuleCallback: function(mainView) {
		var me = this,  //  контроллер
			options = me.getFilterOptions(),  //  записанные опции фильтра
			record = me.getRecord(),  //  текущая запись для получения значений для фильтра
			attributeName = options && options.filterAttribute,  //  атрибут, значение которого используется для фильтрации
			rawValueAttributeName = options && options.rawValueAttribute, //  атрибут, значение которого используется для отрисовки тэга в фильтре
			attribute = record && record.get(attributeName),
			rawValue = record && record.get(rawValueAttributeName),
			filter = mainView && mainView.down('filter-field'),  //  компонент фильтра
			grid = filter.getDataGrid(),  //  таблица целевой формы
			store = grid && grid.getStore(),
			meta = record.getProxy().getReader().metaData || store && store.getProxy().getReader().metaData || {},
			filterTagName = meta ? Ext.Array.findBy(meta, function(item) { return item.name === rawValueAttributeName; }) : record,
			condition = App.common.data.prepare.Condition.$eq(attributeName, attribute),  //  условие запроса фильтрации
			tagParams = filter.getTagParams(),
			targetParam = Ext.Array.findBy(tagParams, function(item) { return item.dataIndex === attributeName; }),
			newFilterTagParams = targetParam ? [
				//  если в параметрах фильтрации уже есть необходимый атрибут - меняем соответствующие значения на новые
				Ext.Object.merge(targetParam, {
					data: condition,
					rawValue: rawValue
				})
			] : [
				// если нет - создаём новый объект параметров фильтрации
				{
					dataIndex: attributeName,
					name: filterTagName && filterTagName.text || '',
					data: condition,
					rawValue: rawValue
				}
			];
		//  устанавливаем новые параметры в фильтр и запускаем его
		filter.setTagParams(newFilterTagParams);
		filter.updateTags();
		store && store.on({
			load: {
				fn: function() {
					Ext.getBody().unmask();
					grid.selModel.select(0);
				},
				single: true
			}
		});
		filter.startFiltration();
	}

});