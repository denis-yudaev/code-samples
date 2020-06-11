/**
 * подправленная пагинация
 * @class App.project.override.toolbar.Paging
 */
Ext.define('App.project.override.toolbar.Paging', {
	override: 'App.common.toolbar.Paging',

	displayMsg: '{0}...{1} из {2} строк',

	//  по-умолчанию, в рамках папки `project` (основного пользовательского интерфейса), отключаем кнопку «Обновления» на пагинации;
	// для включения common'овской кнопки `refresh`, можно указать панели свойство `showPagingRefreshButton` со значением `true`
	showRefreshButton: false,

	/**
	 * Добавляем в тулбар комбобокс с вариантами размера страницы. Если pageSize = 0, то оставляем только кнопку обновить и инфу о количестве
	 * @method getPagingItems
	 * @return ConditionalExpression
	 */
	getPagingItems: function () {
		var me = this,
			items = me.callParent( arguments ),
			refreshBtn, refreshBtnIndex;

		if( items && items.length && !me.showRefreshButton ) {
			refreshBtn = Ext.Array.findBy( items, function(o){ return o.itemId === 'refresh'; } );
			refreshBtnIndex = refreshBtn && items.indexOf( refreshBtn );

			if( refreshBtnIndex >= 0 ) {
				Ext.Array.removeAt( items, refreshBtnIndex );
				items[ refreshBtnIndex ] === '-' && Ext.Array.removeAt( items, refreshBtnIndex );
			}
		}


		return items;
	},


	initComponent: function() {
		var me = this,
		    owner = me.up('tablepanel');

		if( owner && owner.showPagingRefreshButton === true ) {
			me.showRefreshButton = true;
		}

		me.callParent( arguments );
	}
});