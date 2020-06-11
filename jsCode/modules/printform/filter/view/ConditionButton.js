/**
 *  Кнопка выбора условия для контейнеров с полями на форме фильтра печатных форм
 * @class App.project.modules.printform.filter.view.ConditionButton
 */
Ext.define('App.project.modules.printform.filter.view.ConditionButton', {
	extend: 'App.project.modules.filter.view.ConditionButton',
	alias: 'widget.printform-filter-conditionbutton',

	width: 45,
	maxWidth: 45,

	constructor: function(config) {
		var me = this,
		    conditions = config && config.conditions;

		me.style = me.style || {};
		me.style.visibility = ( conditions && conditions.length && conditions.length === 1 ) ? 'hidden' : 'visible';

		me.callParent(arguments);
	}

});