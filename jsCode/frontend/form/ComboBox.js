/**
 * Расширение стандартного комбобокса до варианта, открывающегося при клике не только по триггеру, но и по всему элементу инпута
 * @class App.project.form.ComboBox
 */
Ext.define('App.project.form.ComboBox', {
	extend: 'Ext.form.field.ComboBox',
	alias: [ 'widget.app-combo', 'widget.app-combobox' ],

	initComponent: function(){
		var me = this;

		me.on( 'render', me._makeExpandableByClick );

		me.callParent(arguments);
	},


	/**  @desc  слушаем клик по элементу комбобокса, чтобы вызвать выпадение меню... */
	_makeExpandableByClick: function(self)
	{
		self.getEl().on('click', function() {
			if(self.isExpanded) { self.collapse(); } else { self.expand(); }
		});
	},

	//  переопределённый метод лиснера, препятствующий повторной обработке события при клике по триггеру, которая приводит к сбою механизма...
	onTriggerClick: function(target, e, self) { }


});