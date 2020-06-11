/**
 *  Сравнение величины значения одного аттрибута с величиной значения другого.
 * @class App.project.data.validator.Comparation
 */
Ext.define('App.project.data.validator.Comparation', {
	extend: 'Ext.data.validator.Validator',
	alias: 'data.validator.comparation',

	type: 'comparation',

	config: {
		/**
		 * @cfg {String} attribute (обязательный параметр)
		 * Имя атрибута, с которым будем проводить сравнение.
		 */
		attribute: null,

		/**
		 * @cfg {String} operator (обязательный параметр)
		 * Оператор, который будет использоваться для сравнения значений. Возможные значения:
		 *  • `==` (зн. a равно зн. b);
		 *  • `!=` (зн. a не равно зн. b);
		 *  • `>`  (зн. a больше зн. b);
		 *  • `>=` (зн. a больше или равно зн. b);
		 *  • `<`  (зн. a меньше зн. b);
		 *  • `<=` (зн. a меньше или равно зн. b).
		 */
		operator: null,

		/**
		 * @cfg {Boolean} skipOnEmpty
		 * Пропустить валидацию, в случае если одно из сравниваемых значений отсутствует (по-умолчанию - да).
		 */
		skipOnEmpty: true,

		/**
		 * @cfg {Boolean} isDate
		 * Передайте `true`, в случае если сравниваются даты. Тогда значения будут переведены в объекты `Date()` перед сравнением.
		 */
		isDate: false,

		/**
		 * @cfg {String} errorMessage
		 * Сообщение об ошибке, которое будет вешаться на невалидное поле
		 */
		errorMessage: null
	},


	//<debug>
	constructor: function() {
		this.callParent(arguments);
		if ( !this.getAttribute() || !this.getOperator() ) {
			Ext.Error.raise('validator.Comparation обязятельно должен быть сконфигурирован параметрами `attribute` и `operator`');
		}
	},
	//</debug>

	/**
	 *  Непосредственно метод валидации.
	 * @param value значение атрибута
	 * @param {Ext.data.Model} record объект строки, проходящей валидацию
	 * @returns {boolean} результат валидации
	 */
	validate: function(value, record) {
		var me = this,
		    attribute = me.getAttribute(),
			operator = me.getOperator(),
			data = record && record.data,
			targetValue = data && data[ attribute ],
			valid = false,
			meta;

		if( me.getSkipOnEmpty() && ( me.isEmpty( value ) || me.isEmpty( targetValue ) ) ) {
			return true;
		}

		if( me.getIsDate() ) {
			value = Ext.Date.format( new Date( value ), 'Y-m-d' );
			targetValue = Ext.Date.format( new Date( targetValue ), 'Y-m-d' );
		}

		switch( operator ) {
			case '==':
				valid = value == targetValue;
				break;
			case '!=':
				valid = value != targetValue;
				break;
			case '>':
				valid = value > targetValue;
				break;
			case '>=':
				valid = value >= targetValue;
				break;
			case '<':
				valid = value < targetValue;
				break;
			case '<=':
				valid = value <= targetValue;
				break;
			default:
				valid = true;
				break;
		}

		if( valid ) {
			return true;
		} else {
			meta = Ext.Array.toValueMap( record && record.getProxy().getReader().metaData || [], function(obj) { return obj.name; });
			return Ext.String.format( me.getMessageText(), meta && meta[ attribute ] && meta[ attribute ].text || attribute );
		}
	},


	/**
	 *  Проверка, является ли значение "пустым".
	 * @param value значение для проверки
	 */
	isEmpty: function(value) {
		return value+'' !== '0' && !value;
	},


	/**
	 * @private
	 */
	getMessageText: function(){
		var me = this,
		    errorMessage = me.getErrorMessage();

		return errorMessage || {
				  '==': 'Значение должно быть равным значению поля «{0}»',
				  '!=': 'Значения должно отличаться от значения поля «{0}»',
				  '>': 'Значение должно быть больше значения поля «{0}»',
				  '>=': 'Значение должно быть больше или равным значению поля «{0}»',
				  '<': 'Значение должно быть меньше значения поля «{0}»',
				  '<=': 'Значение должно быть меньше или равным значению поля «{0}»'
			  }[ me.getOperator() ];
	}



});