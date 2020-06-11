<?php
/**
 * @file
 *  Вспомогательный статический класс для упрощения процесса разработки печатных форм.
 */
namespace App\project\component;
use App\common\component\ArrayHelper as AH;
use App\common\system\Exception;
use App\common\Utilities;
use odtphpgenerator as odt;
use odsgen;

/**
 * Class ExportTemplateHelper
 *
 * @package App\common\component
 */
class ExportTemplateHelper
{
	/**
	 *  Простейший метод, форматирующий переданное числовое(либо иного типа) значение для валидной его обработки,
	 * и дальнейшего отображения в тэге table:table-cell, типа «float» (office:value-type="float").
	 *
	 * TODO: есть предположение, что неверная интерпретация разделителя дробной части числа (в частности - точки) связана с указанием в стилях формируемого документа местного регионального стандарта обработки числовых данных, который предпологает, что отделять дробную часть от целой в числе должна запятая. На будущее, будет целесообразным покапать в этом направлении в поисках оптимальных вариантов решения возникающих трудностей, связанных с описаным выше поведением формата ODF.
	 *
	 * @param string|integer|float|null $value "сырое" значение для форматирования, как числового, для ячеек с атрибутом value-type="float"
	 * @return mixed значение, приемлемое для распознания ячейками типа «float» и корректного форматирования, как числового формата
	 */
	public static function parsePrice($value) {
		$result = $value ?: '0';

		return $result === '0' ? $result : str_replace( '.', ',', "$result" );
	}


	/**
	 *  Метод, форматирующий значение в региональный денежный формат, применимый для случаев, когда ячейка, по тем, или иным обстоятествам не может быть
	 * титпа «float» (иметь атрибут office:value-type со значением "float")
	 *
	 * @param string|float $value дробное число для форматирования
	 * @param array        $opts массив дополнительных параметров, которые могут пригодиться для уточнения условий форматирования
	 * @return mixed|string строковое представление числа, отформатированное в соответствии с региональным денежным стандартом
	 */
	public static function formatNumber($value, array $opts = []) {
		return is_numeric( $value ) ? number_format( + $value,
			  AH::getValue( $opts, 'decimals', 2 ),
			  AH::getValue( $opts, 'separator', ',' ),
			  AH::getValue( $opts, 'grouper', ' ' )
		) : AH::getValue( $opts, 'default' );
	}


	/**
	 *  Приводит начало строки в нижний регистр (игнорирует аббривеатуры)
	 *
	 * @param string $string входная строка
	 * @return string строка, первая буква которой приведена в нижний регистр
	 */
	public static function lcFirst($string) {
		$result = $string;
		$length = strlen( $string );

		if( is_string( $string ) && $length > 1 )
		{
			if( mb_strtoupper( mb_substr( $string, 1, 2, 'UTF-8' ), 'UTF-8' ) !== mb_substr( $string, 1, 2, 'UTF-8' )) {
				$result = mb_strtolower( mb_substr( $string, 0, 1, 'UTF-8' ), 'UTF-8' ) . mb_substr( $string, 1, $length, 'UTF-8' );
			}
		}

		return $result;
	}


	/**
	 *  Приводит объект даты @see \DateTime к виду «1 января 2007»
	 *
	 * @param \DateTime $date
	 * @return string отформатированная дата
	 */
	public static function dateToLocale( $date ) {
		return $date->format('d') . ' ' . static::getLocaleMonthName( $date->format('m'), false ) . ' ' . $date->format('Y');
	}


	/**
	 *  Трансформирует числовое (приводит к типу в случае необходимости) представление месяца в строковое
	 *
	 * @param int|string $m порядковый номер месяца (например, возвращаемый вызовом `date('m')`)
	 * @param bool $subjective склонить название месяца в родительный падеж? По-умолчанию `true`
	 * @return string строковое представление месяца
	 */
	public static function getLocaleMonthName($m, $subjective = true) {
		$monthes = [
			  [ 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря' ],
			  [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ]
		];

		return $monthes[ (int)$subjective ][ ( (int)$m ) - 1 ];
	}


	/**
	 * @param string $date
	 * @return null|string
	 */
	public static function dateToLocaleShort($date) {
		$dateTime = \DateTime::createFromFormat( 'Y-m-d', $date );
		return $dateTime ? $dateTime->format('d.m.Y') : null;
	}


	/**
	 *  Для ячейки таблицы ODS/ODF с количественными значениями на проекте «Алмаз» предъявлены следующие требования:
	 * 1) если значение имеет дробную часть в составе - дробная часть отображается;
	 * 2) если значение целое или отсутствует/равно нулю - дробная часть отбрасывается.
	 *
	 *  Для удовлетворения вышеописанным требованиям реализован следующий метод. Он принимает числовое значение, и на его основе вычисляет какой из 2-х
	 * переданных стилей необходимо применить: отображающий дробную часть, или нет. Также методу необходимо указать -
	 * какой класс использовать при создании нового экземпляра ячейки (типа ODS, или ODT?..)
	 *
	 * @param $value        mixed   значение ячейки
	 * @param $floatStyle   mixed   имя класса/класс ячейки с дробной частью
	 * @param $integerStyle mixed   имя класса/класс ячейки без дробной части
	 * @param $cellClass    odsgen\odsTableCellFloat|odt\OdtTableCellFloat  класс ячейки
	 *
	 * @return odsgen\odsTableCellFloat|odt\OdtTableCellFloat   новый экземпляр табличной ячейки с вычисленным количественным значением и стилем
	 */
	public static function amountTableCell($value, $floatStyle, $integerStyle, $cellClass) {
		$cellStyle = $integerStyle;
		$cellValue = +$value;

		if( $value > 0 && is_float( $value ) ) {
			$cellStyle = $floatStyle;
			$cellValue = self::parsePrice( $cellValue );
		}

		return new $cellClass( $cellValue, $cellStyle );
	}


	/**
	 *  Трансформирует строку в соответствии с заявленными на ГИ замечаниями к ПФ №5 {@link http://srv-redmine.crvas.rbt/issues/58392} :
	 * "Параметры заполнения:
	 *    - каждая характеристика разделяется от другой характеристики переводом строки в рамках одной ячейки;
	 *    - для реализации выравнивания справа используется спецсимвол #;
	 *    - для реализации табуляции используется спецсимвол $;
	 *    - для реализации возведения в степень используется спецсимвол ^."
	 *
	 * @param string $string
	 * @param string|null   $styleName - имя стиля, которое необходимо применить к каждому результирующему параграфу
	 * @return string
	 */
	public static function gpvTthFormat($string, $styleName = null) {
		$str = Utilities::removeHtml( (string)$string );
		$result = [];

		$str = str_replace( ['$', '#', '^'], ['	', '				', '%' ], $str );
		$str = preg_replace( '/\t{5,}/iu', '				', $str);

		$paragraphs = explode( '
', $str );


		foreach( $paragraphs as $i => $text  ){
			preg_match_all( "/(^[^%^\t]+)|(%[\S]+)|([^%^\t.]+)|(\t{4,}|\t)|([^%^\t]+$)/iu", $text, $matches);
			$pieces = AH::getValue( $matches, 0, [] );
			$result[$i] = new odt\OdtParagraph( null, $styleName );

			if( count( $pieces ) ) {
				foreach( $pieces as $n => $match ) {
					if( preg_match( '/\t{4,}/iu', $match ) ) {
						$result[$i]->addTab();
						continue;
					}
					if( preg_match( '/\t/iu', $match ) ) {
						$result[$i]->addSpace( 4 );
						continue;
					}
					if( false !== strpos( $match, '%' ) ) {
						$match = str_replace( '%', '', $match );
						$result[$i]->addChild( new odt\OdtSpan( $match, 'T1' ) );
						continue;
					}

					$result[$i]->addChild( $match );
				}
			}
		}

		return $result;
	}


	/**
	 *  Возвращает класс ячейки, соответствующий переданному значению (актуально, например, для реализации ячеек со сносками)
	 *
	 * @param mixed $value
	 * @param odt\Odt|odsgen\ods $generator
	 * @param mixed $style имя стиля для ячейки
	 *
	 * @return string имя подходящего класса ячейки
	 */
	// public static function evaluateRightCell($generator, $value, $style = null){
	// 	$cellClassName = ( $generator instanceof odt\Odt ) ? '\odtphpgenerator\Odt' : '\odsgen\ods';
	// 	$cellClassName .= ( ( is_string( $value ) || is_numeric( $value ) ) && +$value > 0 ) ? 'TableCellFloat' : 'TableCellComplex';
	//
	// 	return new $cellClassName( $value, $style );
	// }


}