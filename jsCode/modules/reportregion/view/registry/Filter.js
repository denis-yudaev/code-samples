/**
 * Фильтр реестра региональной справки
 * @class App.project.modules.reportregion.view.registry.Filter
 */
Ext.define('App.project.modules.reportregion.view.registry.Filter', {
	extend: 'App.project.modules.filter.Init',
	alias: 'widget.reportregion-registry-filter',

	listeners: {
		afterrender: function(obj) {
			var me = this,
			    dataGrid = obj.up('reportregion-registry-window').down('reportregion-registry-grid');

			dataGrid && me.setDataGrid( dataGrid );
		}
	},

	emptyText: 'Поиск по наименованию',

	// notNullParams: [
	// 	  'report_id'
	// ],

	//  текстовый поиск
	textSearchField: [
		'report_name'
	],

	modalSearchField: [
		'report_id'
	],


	// Устанавливаем текущие параметры отбора для store грида и перезагружаем данные
	setExtraparams: function(){
		var me = this,
		    value = me.getValue(),
		    dataGrid = me.getDataGrid();

		if( !dataGrid || !( dataGrid.getStore() && dataGrid.getStore().getProxy().getExtraParams ) ){
			return;
		}

		var defParams = me.getDefaultParams(),
		    readProxy = (!!defParams && defParams.read.data) ? defParams.read.data.slice(0) : [], //исходные параметры отбора для store
		    windowReadProxy = [];//Параметры фильтра (отдельная группа параметров) окно

		Ext.each(me.getTagParams(), function(param){
			if(param.data.value && Ext.isObject(param.data.value)){
				windowReadProxy.push(param.data.value);
			}else{
				windowReadProxy.push(param.data);
			}

		});

		if (!Ext.isEmpty(windowReadProxy)){
			readProxy = readProxy.concat(windowReadProxy);
		}

		//разбиваем значение на слова
		me.setSearchWords(value.split(' '));

		//поиск по поисковому слову
		if (value){
			var searchWords = me.getSearchWords();
			for (var i = 0; i < searchWords.length; i++){
				//разбивам поиск на группы по словам (для релевантности результата выдачи)
				var wordGroup = [];
				if (searchWords[i] != ''){
					if(!me.getTextSearchField().length){
						Ext.each(dataGrid.columnManager.columns, function(column, index){
							//ищем только по отображаемым колонкам
							if (column.hidden === false){
								if (column.editor == 'textfield' || (column.editor.xtype && ~column.editor.xtype.indexOf('combo'))){
									wordGroup.push(App.common.data.prepare.Condition.$il(column.dataIndex, searchWords[i], 'or'));
								}
							}
						});
					}else{
						Ext.each(me.getTextSearchField(), function(item, index){
							wordGroup.push(App.common.data.prepare.Condition.$il(item, searchWords[i], 'or'));
						});
					}

					if (!Ext.isEmpty(wordGroup)){
						readProxy.push(App.common.data.prepare.Group.$and(wordGroup));
					}
				}
			}
		}

		readProxy.push( App.common.data.prepare.Condition.$eq('kls_code_type_report', 'REGION') );


		dataGrid.getStore().getProxy().getExtraParams().read.data = readProxy;
	},


	initComponent: function() {
		var me = this;

		me.on('updateFilterHeight', function(filter, height) {
			var filterUpPanel = me.up('panel');
			filterUpPanel.setHeight(height + 4);
		});

		me.on('resize', function(obj, newWidth, newHeight, oldWidth, oldHeight) {
			(newWidth != oldWidth) && this.updateElSize();
		});

		me.callParent(arguments);
	},


	//  переписанный метод открытия окна фильтра
	openFilterWindow: function(focus) {
		return false;
		var me = this,
		    newFilterWindow = new App.project.modules.filter.view.Window({
			    gridFilter: me,
			    alwaysOnTop:   20,
			    height: 78,

			    listeners: {
			    	render: function(win){
					    var reportCombobox = win.down('combobox[valueField="report_id"]');

					    if( reportCombobox ) {
						    reportCombobox.on({
							    select: function(combo, record){
								    var value = record && record.data && record.data.report_id,
								        applyButton;

								    if( value ) {
									    applyButton = combo.up( 'window' ).down( 'button[itemId=apply]' );
									    applyButton && applyButton.handler && applyButton.handler.bind( applyButton )();
								    }
							    }
						    });
					    }
				    }
			    }
		    }),
		    tbar = newFilterWindow.dockedItems.items.find( function(obj){ return obj.isToolbar; } );

			tbar.setHidden( true );

		!me.getSearchWindow() && me.setSearchWindow( newFilterWindow );
		var searchWindow = me.getSearchWindow();

		searchWindow.setTagFocus( focus );

		searchWindow.show();
	}

});