/**
 * Контекстное меню ячеек таблицы ЭФ ведения региональной справки
 * @class App.project.modules.reportregion.view.grid.CellContextMenu
 */
Ext.define('App.project.modules.reportregion.view.grid.CellContextMenu', {
	extend: 'App.project.menu.CellContextMenu',
	alias: 'widget.reportregion-grid-panel-cellcontextmenu',

	width: 220,

	items: [
		{
			//  редактирование контрактов
			iconCls: 'x-icon-common-menu-small open-module-btn-icon',
			text: 'Редактирование контрактов',
			handler: 'openModule',
			filterOptions: {
				//  данные для фильтра
				path: 'App.project.modules.executegoz.view.card.contracts.window.Panel',
				filterAttribute: 'contract_id',
				rawValueAttribute: 'contract_num',
				emptyRowMessage: 'Связанные контракты отсутствуют.'
			},
			style: {
				padding: '5px 0 5px 6px'
			}
		},
		{
			//  предприятие
			iconCls: 'x-icon-common-menu-small open-module-btn-icon',
			text: 'Перейти к исполнителю',
			handler: 'openModule',
			filterOptions: {
				//  данные для фильтра
				path: 'App.project.modules.org.view.Main',
				filterAttribute: 'company_id',
				rawValueAttribute: 'company_names',
				emptyRowMessage: 'Отсутствуют данные об исполнителе.'
			},
			style: {
				padding: '5px 0 5px 6px'
			}
		}
	]

});