/**
 *  Миксин, реализующий возможность перехода из одной ЭФ в другую с предустановкой параметров фильтрации последней.
 *
 * @class App.project.mixin.OpenModuleApi
 */
Ext.define('App.project.mixin.OpenModuleApi', {
	extend: 'Ext.Mixin',
	mixinId: 'openModuleApi',

	config: {
		record: null,
		filterOptions: null,
		userCallback: null
	},


	openModule: function(config) {
		var me = this,
		    record = config && config.record,
		    userCallback = config && config.userCallback,
		    options = config && config.options,
		    path = options && options.path;

		if( record && Ext.isEmpty( record.get( options.targetAttributeName || options.filterAttribute ) ) ) {
			Ext.toastWarning( options.emptyRowMessage || 'Отсутствует связанный элемент.', 4000, 'tr');
			return;
		}
		//  компонент должен обязательно быть сконфигурирован строкой с данными для фильтра
		if ( record && path ) {
			Ext.getBody().mask('Загрузка...');

			me.setFilterOptions( options ) && me.setRecord( record ) && me.setUserCallback( userCallback );

			App.apiUI.module.open( path, {
				callback: function(panel){
					if ( panel && panel.rendered )
					{
						me.openModuleCallback.apply( me, [ panel ] );
					} else
					{
						panel.on({
							afterrender: {
								fn: me.openModuleCallback.bind( me, panel ),
								options: {
									single: true
								}
							}
						});
					}
				}
			} );
		}
	},


	openModuleCallback: function(mainView) {
		var me = this,  //  миксин
		    options = me.getFilterOptions(),  //  записанные опции фильтра
		    record = me.getRecord(),  //  текущая запись для получения значений для фильтра
		    conditionType = options && options.conditionType || 'eq',
		    conditionJoin = options && options.conditionJoin || 'and',
		    conditionRelation = options && options.conditionRelation || 'iv',
		    rawValueAttributeName = options && options.rawValueAttribute, //  атрибут, значение которого используется для отрисовки тэга в фильтре
		    rawValue = record && record.get( rawValueAttributeName ),
		    filterAttribute = options && options.filterAttribute,  //  атрибут, значение которого используется для фильтрации
		    targetAttributeName = options && options.targetAttributeName || filterAttribute,
		    attribute = record && record.get( targetAttributeName ),
		    conditionArgs = ( [ 'isnn', 'isn' ].indexOf( conditionType ) > 0 ) ?
			      [ filterAttribute, conditionJoin, conditionRelation ] :
			      [ filterAttribute, attribute, conditionJoin, conditionRelation ],

		    filterTagName = options.filterTagNameText ? { text: options.filterTagNameText } :
		                    Ext.Array.findBy( record.getProxy().getReader().metaData, function(item) { return item.name === rawValueAttributeName; } ),
		    condition = App.common.data.prepare.Condition[ '$' + conditionType ].apply( App.common.data.prepare.Condition, conditionArgs ),  //  условие запроса фильтрации
		    filter = mainView && mainView.down( 'filter-field' ),  //  компонент фильтра
		    grid = filter.getDataGrid(),  //  таблица целевой формы
		    tagParams = filter.getTagParams(),
		    targetParam = Ext.Array.findBy( tagParams, function(item) { return item.dataIndex === filterAttribute; } ),
		    userCallback = me.getUserCallback(),
		    newFilterTagParams = targetParam ? [
			    //  если в параметрах фильтрации уже есть необходимый атрибут - меняем соответствующие значения на новые
			    Ext.Object.merge(targetParam, {
				    data:     condition,
				    rawValue: rawValue
			    })
		    ] : [
			    // если нет - создаём новый объект параметров фильтрации
			    {
				    dataIndex: filterAttribute,
				    name:      filterTagName && filterTagName.text,
				    data:      condition,
				    rawValue:  rawValue
			    }
		    ];

		//  устанавливаем новые параметры в фильтр и запускаем его
		filter.setTagParams( newFilterTagParams );
		filter.updateTags();
		grid.store.on({
			load: { fn: function(){ Ext.getBody().unmask(); grid.selModel.select(0); }, single: true }
		});
		filter.startFiltration();

		userCallback && userCallback.apply( me, [ mainView, record, options ] );
	}


});