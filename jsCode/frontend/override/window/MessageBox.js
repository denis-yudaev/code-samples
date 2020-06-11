/**
 *  Доработки стандартной версии всплывающего окна уведомления
 * @class App.project.override.window.MessageBox
 */
Ext.define('App.project.override.window.MessageBox', {
	override: 'Ext.window.MessageBox',

	showMessage : function ( message, callback, buttons, config ) {
		// Определяем тип сообщения
		var method = arguments.callee.caller,
		    type = method.$name.replace( 'show', '' ).toUpperCase();

		//  без этого св-ва, если MessageBox возникает на фоне модального окна, у которого это св-во есть - окошко видно не будет, а интерфейс заблокируется
		Ext.MessageBox.alwaysOnTop =   500;
		Ext.MessageBox.modal = true;

		return Ext.MessageBox.show( Ext.apply ({
			message : message   || '',
			fn      : callback  || Ext.emptyFn,
			buttons : buttons   || Ext.MessageBox.OK,
			title   : Ext.MessageBox[ 'TITLE' + type ],
			icon    : Ext.MessageBox[ type ]
		}, config));
	}
});

