/**
 * Action-колонка, адаптированная под иконки Font Awesome
 * @class App.project.grid.column.Action
 */
Ext.define('App.project.grid.column.Action', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.project-grid-actioncolumn',

    defaultRenderer: function(v, cellValues, record, rowIdx, colIdx, store, view) {
        var me = this,
            scope = me.origScope || me,
            items = me.items,
            len = items.length,
            i, item, ret, disabled, tooltip, cls, tooltipHtml = ' ';

        ret = Ext.isFunction(me.origRenderer) ? me.origRenderer.apply(scope, arguments) || '' : '';

        cellValues.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
        for(i = 0; i < len; i++) {
            item = items[ i ];

            disabled = item.disabled || (item.isDisabled ? item.isDisabled.call(item.scope || scope, view, rowIdx, colIdx, item, record) : false);
            tooltip = disabled ? null : (item.tooltip || (item.getTip ? item.getTip.apply(item.scope || scope, arguments) : null));

            if( !item.hasActionConfiguration ) {
                item.stopSelection = me.stopSelection;
                item.disable = Ext.Function.bind(me.disableAction, me, [ i ], 0);
                item.enable = Ext.Function.bind(me.enableAction, me, [ i ], 0);
                item.hasActionConfiguration = true;
            }

            //  если передан парам. icon, то иконке выставится класс "fa fa-" + icon
            //  если передан парам. iconCls, или определена ф-я getCls, то значение добавится к уже сформированному классу
            cls = me.actionIconCls + ' ' + Ext.baseCSSPrefix + 'action-col-' + String(i) + ' ' +
                (disabled ? me.disabledCls + ' ' : ' ') + ( item.icon ? 'fa fa-' + item.icon : '') +
                (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || scope, arguments) : (item.iconCls || me.iconCls || ''));

            tooltip && ( tooltipHtml = ' data-qtip="' + tooltip + '" ' );
            ret += '<span' + tooltipHtml  + 'class="' + cls + '" role="button"></span>';
        }

        return ret;
    }

});