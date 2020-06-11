<?php
/**
 * Пространство имён класса
 */
namespace App\project\component;
use App\common\system\Exception;
use App\common\component\ArrayHelper as AH;


/**
 * Class OrgModel импорта ГПВ по форме №6
 *
 * @package App\project\component
 */
class OrgModel
{
	//  количество заглавных строк, которые стоит опустить при парсинге данных (значение по-умолчанию)
	const DEFAULT_HEADER_SIZE = 2;

	/** @var array $_errors массив собранных ошибок
	 * */
	protected $_errors;

	/** @var array $_attributes занесённые в экземпляр модели значения атрибутов
	 * */
	protected $_attributes = [];


	/**
	 * Отрезает n первых записей из массива, где n - количество строк шапки таблицы (не относящихся к данным)
	 *
	 * @param array $records массив с записями
	 *
	 * @return array массив с данными таблицы, без данных шапки
	 *
	 * @deprecated в соответствии с проектными требованиями, данный метод потерял свою астуальность и неперь
	 * необходимо использовать более сложные проверки, допускающие в документе произвольное число заглавных строк...
	 */
	public static function excludeHeaderRows_deprecated(array $records) {
		$headerRowRange = range( 0, self::DEFAULT_HEADER_SIZE );
		$headerRowKeys = array_flip( $headerRowRange );

		return array_values( array_diff_key( $records, $headerRowKeys ) );
	}

	/**
	 * Вторая версия исключения заглавных строк из данных.
	 * Сначала ищет строку (последнее её вхождение), полностью состоящую из ячеек с положительными значениями типа int
	 * (допускается не более 3-х исключений) (1, 2, 3, 4, 5, 6, '', 8, 9 ...), если не находит её в пределах 30 строк -
	 * обрезает количество строк, установленное по-умолчанию константой self::HEADER_SIZE
	 *
	 * @param array $records массив с записями
	 *
	 * @return array массив исключительно данными таблицы
	 * @throws Exception обработка ошибок
	 */
	public static function excludeHeaderRows(array $records) {
		if(count( $records ))
		{
			function isMostlyNumeric(array $array) {
				$control = count($array) - 3;
				return  array_sum( array_map( 'is_numeric', $array ) ) >= $control;
			}
			$numericRowsIndexes = [];
			$q = 0;

			foreach ($records as $index => $record) {
				//  если пробежали 30 записей - завершить цикл
				if( $q >= 30 ) { break; }

				// если в записи почти все значения - числовые, добавляем её в массив результатов поиска...
				if( isMostlyNumeric( $record ) ) {
					$numericRowsIndexes[] = $index;
				}

				$q++;
			}

			$lastHeaderRowIndex = array_pop($numericRowsIndexes) ?: self::DEFAULT_HEADER_SIZE;
			$headerRowRange = range( 0, $lastHeaderRowIndex);
			$headerRowKeys = array_flip($headerRowRange);

			$result = array_values(array_diff_key($records, $headerRowKeys));
		} else {
			$result = [];
		}

		return $result;
	}


	/**
	 * @param array $data
	 * @throws Exception
	 */
	public static function normalizeColumnsNumber(array &$data) {
		if( count( $data ) )
		{
			$attributesCount = count( self::attributes() );
			$sample = $data[ 0 ];

			if( count( $sample ) > $attributesCount )
			{
				$refusedRow = AH::getColumn( $data, $attributesCount );

				//  если лишний столбец не пуст - кидаем Exception...
				if( array_sum( array_map( 'strlen', $refusedRow ) ) > 0 )
				{
					header('HTTP/1.1 403 Action Forbidden');
					throw new Exception( DataValidator::MESSAGE_WRONG_DOCUMENT_FORMAT );

				} else
				{
					array_walk( $data, /**
					 * @param array $item
					 * @param integer $i
					 * @param integer $count
					 */ function ( &$item, $i, $count ) {
						$item = array_slice( $item, 0, $count );
					}, $attributesCount );
				}
			}
		}
	}

	public static function normalizeColumnsNumberWrapper(array $data) {
		self::normalizeColumnsNumber($data);
		return $data;
	}

	//  отсеивает строки, где преобладают пустые ячейки, а также строки короче/равные 3 ячеек
	public static function excludeFooterRows(array $records) {
		if(count( $records ))
		{
			$isMostlyEmptyOrVeryShort = function(array $array) {
				$arraySize = count( $array );
				$control = $arraySize - 3;

				$isMostlyEmpty = array_sum( array_map( function ($val){ return $val === ''; }, $array ) ) >= $control;
				$isVeryShort = $arraySize <= 3;

				return $isMostlyEmpty || $isVeryShort;
			};

			while( $isMostlyEmptyOrVeryShort( end( $records ) ) ){
				array_pop( $records );
			}
		}

		return $records;
	}


	/**
	 * GozOfferModel constructor.
	 * @param array $attributes
	 *
	 * @throws Exception обработчик исключений
	 */
	public function __construct($attributes)
	{
		//  предварительная проверка на соответствие шаблону - сравнивается количество столбцов, и если полей
		//  в строке больше, чем предусматривает шаблон - вызывается исключение с сообщением о несоответствии формата...
		if( count( $attributes ) === $this->countAttributes() )
		{
			$this->_attributes = array_combine( $this->attributes(), $attributes );
			DataValidator::validate( $this );
		}
		else {
			header('HTTP/1.1 403 Action Forbidden');
			throw new Exception( DataValidator::MESSAGE_WRONG_DOCUMENT_FORMAT );
		}

	}

	public function setAttribute($name, $value){
		$this->_attributes[ $name ] = $value;
	}


	public function countAttributes() {
		return count( self::attributes() );
	}


	public function hasError(){
		return $this->_errors !== null;
	}

	public function addError($text, $attribute){
		$this->_errors[ $attribute ] = $text;
	}



	public static function attributes(){
		return [
			  'company_namef',
			  'company_names',
			  'company_name_mpe',
			  'company_inn',
			  'company_kpp',
			  'company_ogrn',
			  'company_okpo',
			  'company_contact',
			  'company_history'
		];
	}


	public function attributeLabels(){
		return [
			  'company_namef' => 'Наименование полное',
			  'company_names' => 'Наименование краткое',
			  'company_name_mpe' => 'Наименование в МПЭ',
			  'company_inn' => 'ИНН',
			  'company_kpp' => 'КПП',
			  'company_ogrn' => 'ОГРН',
			  'company_okpo' => 'ОКПО',
			  'company_contact' => 'Контакты',
			  'company_history' => 'Историческая справка'
		];
	}


	public function rules(){
		return [
			  'company_inn' => 'inn',
			  'company_ogrn' => 'numeric',
			  'company_okpo' => 'numeric',
			  'company_kpp' => 'kpp'
		];
	}

	/**
	 * @return array
	 */
	public function getErrors(){
		return $this->_errors;
	}


	/**
	 * @param string $name
	 * @return mixed
	 */
	public function getAttributeIndex($name){
		$indexes = array_flip( self::attributes() );
		return $indexes[ $name ];
	}


	/**
	 *  Возвращает массив значений атрибутов объекта
	 *
	 * @param bool $fixed возвращать ли атрибуты с автоматически исправленными ошибками (true), или возвращать значения "как есть" (false)
	 * @return array
	 */
	public function getAttributes($fixed = false){
		$attributes = $this->_attributes;
		$errors = $this->_errors;

		if( $fixed && $this->hasError() ) {
			foreach( $errors as $attribute => $error ) {
				$attributes[ $attribute ] = null;
			}
		}

		return $attributes;
	}


	/**
	 * Приводит данные атрибутов объекта в приемлемый для ф-и БД вид, и возвращает их массив...
	 *
	 * @param array $paramsData дополнительные данные, которые стоит включить в массив
	 * @param bool $force исправлять невалидные данные?
	 *
	 * @return array
	 */
	public function getRequestFormattedData(array $paramsData = [], $force = false)
	{
		return $this->prepareDataForRequest( (array) $paramsData, $force );
	}


	/**
	 * TODO: Готовит данные в соответствии с имеющимися правилами (e.g. dataPreparationRules()...)
	 * Пока просто трансформирует данные в соответствии с описанным сценарием...
	 * @param array $data дополнительные данные, которые стоит включить в массив
	 * @param bool $force исправлять невалидные данные?
	 * @return array
	 */
	protected function prepareDataForRequest(array $data = [], $force = false)
	{
		$attributesData = $this->getAttributes( $force );
		$result = AH::merge( $attributesData, $data );

		return $result;
	}

}