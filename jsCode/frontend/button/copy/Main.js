/**
 * Кнопка копирования строки в таблице
 * @class App.project.button.copy.Main
 */
Ext.define('App.project.button.copy.Main', {
	extend: 'Ext.button.Button',
	alias: 'widget.project-button-copy',

	scale: 'medium',
	iconCls: 'fa fa-copy blue',
	cls: 'local-button-copyrecord',
	disabled: true,
	shrinkWrap : 0,
	tooltip: 'Копировать',

	config: {

		/**
		 * таблица, к которой принадлежит кнопка
		 */
		table: null,

		/**
		 * Поля таблицы, которые отсутствуют в таблице, и которые нужно копировать
		 */
		columns: null
	},

	/**
	 * изменение управляемой таблицы. Подписаться на событые
	 * @param table Object|Null
	 */
	setTable: function(table) {
		this.table && this.table !== table && this.table.un('selectionchange', this.tableSelectionChange, this);
		table && table.on('selectionchange', this.tableSelectionChange, this);
		this.table = table;
	},

	/**
	 *  Получение списка полей
	 */
	getColumns: function() {
		return Array.isArray(this.columns) && this.columns || [];
	},


	/**
	 * обработчик выбранных строк в таблице
	 * @param serM
	 * @param selected
	 */
	tableSelectionChange: function(serM, selected) {
		this.setDisabled(
			!Boolean(selected.length)
		);
	},


	/**
	 * обработчик клика
	 * @param view
	 */
	handler: function(view) {
		var	table = view.getTable(),
			store = table.getStore(),
			Model = store.getModel(),
			records = table.getSelection(),
			i,
			recordNew,
			index,
			cols = this._getCols(table);


		for (i = 0; i < records.length; i++) {
			index = store.indexOf(records[i]);
			recordNew = new Model();

			this._copy(
				cols,
				recordNew,
				records[i]
			);
			store.insert(index + 1, recordNew);
		}
	},


	/**
	 * Получить поля для копирования
	 * @param table
	 * @returns {Array.<T>}
	 */
	_getCols: function(table) {
		return this.getColumns().concat(table.getColumns())
			.filter(function(col) {
				return col.copy && typeof col.copy === 'object' && col.copy.allow !== false;
			})
			.map(function(col) {
				if ('dataIndex' in col.copy) {
					if (Array.isArray(col.copy.dataIndex) !== true) {

						switch (typeof col.copy.dataIndex) {

							case 'string':
								col.copy.dataIndex = [col.dataIndex || ''];
								break;
						}
					}
				} else {
					col.copy.dataIndex = [col.dataIndex || ''];
				}
				return col.copy;
			});
	},


	/**
	 * копирование
	 * @param cols
	 * @param recordNew
	 * @param record
	 */
	_copy: function(cols, recordNew, record) {
		var col, i;

		// собрать данные
		for (i = 0; i < cols.length; i++) {
			col = cols[i];

			// копирование
			col.dataIndex.forEach(function(dataIndex) {
				recordNew.set(
					dataIndex,
					record.get(dataIndex)
				);
			});

			// выполнение функции, если есть
			typeof col.fn === 'function' && col.fn(recordNew, record);
		}
		return recordNew;
	}




});