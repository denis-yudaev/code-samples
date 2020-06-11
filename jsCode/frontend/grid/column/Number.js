/**
 *  Колонка таблицы, обеспечивающая поддержку нескольких вариантов форматирования денежных и количественных числовых значений.
 *  Используем:
 * {
		xtype : 'project-numbercolumn',
		rendererFormatType: 'responsive',
		precisionMax: 2,
		...
	}
 *
 *  @class App.project.grid.column.Number
 */
Ext.define('App.project.grid.column.Number', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.project-numbercolumn',

	align: 'right',
	width: 110,


	//  форматирование значений по-умолчанию. Возможные варианты: 'simple', 'responsive', или false, чтобы отключить специфическое форматирование...
	rendererFormatType: 'responsive',

	//  ограничение строки формата по количеству символов после запятой. Может быть полезно, когда нужно избавится от большого количества лишних знаков
	precisionMax: null,


	initComponent: function(){
		var me = this;

		if( me.rendererFormatType !== false ) {
			me.defaultRenderer = me.renderers[ me.rendererFormatType ];
		}

		if( ! me.editor && me.editor !== false ) {
			me.editor = {
				xtype: 'numberfield',
				decimalPrecision: 2,
				allowDecimals: true,
				hideTrigger: true,
				minValue: 0
			}
		}

		me.callParent( arguments );
	},


	privates: {

		//  private: предусмотренные варианты форматирования значений.
		renderers: {
			//  основной "рендерер", разделяющий разряды пробелом, и отображающий n-количество знаков после запятой в случае их наличия.
			//  целые числа отображает без дробной части.
			responsive: function(value, meta, record) {
				var me = this,
				    precisionArray, precision, format, result;

				if ( !record || record.phantom ) {
					result = value;
				} else {
					precisionArray = String( +value ).split( '.' );
					precision = precisionArray[ 1 ] && precisionArray[ 1 ].length;
					format = '0,000';

					if ( precision ) {
						format += '.';
						format += '0'.repeat( me.precisionMax !== null && precision > me.precisionMax ? me.precisionMax : precision );
					}

					result = Ext.util.Format.number( value, format );
				}

				return result;
			},

			//  рендерер, предназначенный для целочисленных значений (таких как количество), разделяющий разряды пробелами.
			simple: function(value, meta, record) {
				var format = this.format || '0,000'
				return record && !record.phantom ? Ext.util.Format.number( value, format ) : value;
			}
		}
	}

});