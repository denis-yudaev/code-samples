/**
 *  Колонка для обработки многострочных текстовых значений. Предоставляет возможность построчного применения пользовательских преобразований, возвращая
 * на выходе HTML-код.
 *  По-умолчанию метод отрисовки преобразует переносы строк (\n) в тэги `BR` (отключается параметром конфигурации `disableLineBreaks`)
 *
 * @class App.project.grid.column.TextToHtml
 */
Ext.define('App.project.grid.column.TextToHtml', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.project-text2html-column',

	//  не кодируем HTML изначально, делаем это вручную, позже в defaultRenderer'е
	allowMarkup: true,

	//  разрешаем колонке формировать HTML
	producesHTML: true,

	//  предопределённые правила преобразований
	defaultRules: [
		{
			'char': '#',
			transform: function(input) {
				var chr = this['char'],
					pos = input.indexOf( chr );

				return pos < 0 ? input : input.replace( new RegExp( '/\\' + chr + '(.+)/gi' ), '<span class="x-title-align-right">$1</span>' );
			}
		},
		{
			'char': '$',
			transform: function(input) {
				var chr = this['char'],
				    pos = input.indexOf( chr );

				return pos < 0 ? input : input.split( chr ).join( '\t' );
			}
		},
		{
			'char': '^',
			transform: function(input) {
				var chr = this['char'],
				    pos = input.indexOf( chr );

				return pos < 0 ? input : input.replace( new RegExp( '/\\' + chr + '(.+)/gi' ), '<span class="text-position-super">$1</span>' );
			}
		}
	],


	config: {
		//  отключить преобразование \n в <br />
		disableLineBreaks: null,
		//  правила преобразований
		rules: null,
		//  не использовать предопределённые правила преобразований
		clearDefaultRules: null
	},




	/**
	 * default renderer
	 * @method defaultRenderer
	 * @param {String} str
	 * @return {String} value
	 */
	defaultRenderer: function(str) {
		var me = this,
		    value = str && Ext.String.htmlEncode( str + '' ),
		    pieces = value && value.split('\n'),
		    glue = me.getDisableLineBreaks() ? '\n' : '<br />',
		    rules = me.getClearDefaultRules() ? me.getRules() : Ext.Object.merge( me.defaultRules, me.getRules() );


		pieces && pieces.length && pieces.forEach( function(item, i, arr){
			rules.forEach( function( rule ) {
				arr[ i ] = rule.transform( item );
			});
		});

		return pieces.join( glue );
	}

});