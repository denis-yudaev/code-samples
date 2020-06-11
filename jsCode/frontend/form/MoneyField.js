/**
 * Расширение стандартного поля numberfield для отображение денежных значений
 * @class App.project.form.MoneyField
 */
Ext.define('App.project.form.MoneyField', {
	extend: 'Ext.form.field.Number',
	alias: 'widget.moneyfield',

	onFocus: function(){
		var me = this;
		me.callParent(arguments);
		var value = me.getValue();
		me.setRawValue(value);
	},

	onBlur: function(){
		var me = this;
		me.callParent(arguments);
		var value = me.getValue();
		me.setRawValue(me.valueToRaw(value));
	},

	rawToValue: function(rawValue) {
		var value = rawValue || 0;

		if (value !== null) {
			value = rawValue.replace(/ /g, '');
			value = Number(value);
		}

		return  value;
	},

	valueToRaw: function(value) {
		var me = this,
			rowValue = Ext.util.Format.number(value, '0,000.00') || 0;

		return rowValue;
	},

	getErrors: function(value){
		value = arguments.length > 0 ? this.rawToValue(value) : this.processRawValue(this.getRawValue());

		var me = this,
			errors = me.callParent([value]),
			format = Ext.String.format,
			num;

		if (value.length < 1) {
			return errors;
		}

		value = String(value).replace(me.decimalSeparator, '.');

		if(isNaN(value)){
			errors.push(format(me.nanText, value));
		}

		num = me.parseValue(value);

		if (me.minValue === 0 && num < 0) {
			errors.push(this.negativeText);
		}
		else if (num < me.minValue) {
			errors.push(format(me.minText, me.minValue));
		}

		if (num > me.maxValue) {
			errors.push(format(me.maxText, me.maxValue));
		}


		return errors;
	}
});