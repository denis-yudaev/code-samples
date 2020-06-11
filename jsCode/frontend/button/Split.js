/**
 * Расширение стандартной SplitButton. Клик-хэндлер этой кнопки контролирует выпадение менюшки, при чём триггером является вся кнопка целиком
 * @class App.project.button.Split
 */
Ext.define('App.project.button.Split', {
    extend: 'Ext.button.Split',
    alias: 'widget.app-splitbutton',


    //  переписываем родительский метод так, чтобы клик по любой части кнопки приводил к выпадению меню. Параметр "handler" при этом игнорируется
    onClick: function(e) {
        var me = this;

        me.doPreventDefault(e);
        if( !me.disabled ) {
            e.preventDefault();
            me.maybeShowMenu(e);
            me.fireEvent("arrowclick", me, e);
            if( me.arrowHandler ) {
                me.arrowHandler.call(me.scope || me, me, e);
            }
        }
    },

	listeners: {
		mouseover: function() {
			var me = this;
			if (!me.disabled && !me.hasVisibleMenu()) {
				me.showMenu();
			}
		}
	}

});