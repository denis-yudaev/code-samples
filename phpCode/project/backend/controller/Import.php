<?php
/**
 * Пространство имён класса.
 * Используемые типажи / классы.
 */
namespace App\project\controller;

/**
 * Используемые типажи / классы
 */
use App\common\source\filesystem\UploadedFile;
use App\common\system\Exception;
use App\common\system\Request;
use App\common\component\ArrayHelper as AH;
use App\project\component\CsvParser;
use App\project\component\FactoryModel;
use App\project\component\xlsParser\Book;
use App\project\component\XlsxToCsv\XlsxToCsv;
use App\project\system\ComponentTrait;
use App\project\system\Event;
use App\project\system\UploadManager;
use DOMDocument;
use odsgen;
use App\project\OdTools\OdsFormatter;
use ZipArchive;

//  парсинг CSV
//  парсинг XLS
//  парсинг XLSX
//  парсинг ODS


//  ODS тулзы для парсинга
require_once PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'backend' . DS . 'od-tools' . DS . 'autoloader.php';

//  генератор документов ODS для формирования шаблонов импорта данных
require_once PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'backend' . DS . 'ods' . DS . 'ods.php';

/**
 * Класс импорта. Реализует импорт данных, их первичную валидацию, отправку ошибок клиенту, либо передачу далее в БД...
 * Class Import
 *
 * @property string _templatesDir путь до папки с шаблонами импорта
 * @property Ods    ods
 * @package App\project\controller
 **/
class Import extends BaseDocController
{
	//  поддержка событий
	use ComponentTrait;

	const MESSAGE_FILE_IS_EMPTY = 'Отсутствует целевой файл';

	const MESSAGE_FILE_WRONG_TYPE = 'Данный тип файлов не поддерживается';


	public $dataErrors;

	//  защищённый признак отсутствия параметров запроса (как альтернативный вариант импорта данных)
	protected $_noRequestDataRun;
	//  защищённый признак отсутствия параметров запроса (как альтернативный вариант выгрузки шаблона)
	protected $_noRequestTemplateDownload;

	protected $_records;
	protected $_tmpDir;

	/**
	 * @var UploadedFile $_uploadedFile файл, загруженный на сервер для импорта
	 */
	private $_uploadedFile;

	/**
	 * @var odsgen\ods $_ods  генератор документов ODS
	 */
	private $_ods;
	private $_error;



	/**
	 * Констрктор класса, инициализация свойств
	 *
	 * @param bool $logging включить логирование?
	 */
	public function __construct( $logging = true )
	{
		$this->records = [];
		$this->dataErrors = 0;

		//  вызываем родительский конструктор в конце метода
		parent::__construct( $logging );
	}


	/**
	 *  Возвращает объект из сессии, предварительно десериализовав его.
	 *
	 * @param string $name   имя переменной, хранимой в сессии.
	 * @param bool|false $remove признак удаления переменной сессии, значение которой мы пытаемся получить (по-умолчанию - не удалять)
	 *
	 * @return mixed хранимое в сессии значение
	 */
	public function getStoredObject($name, $remove = false){
		$method = $remove ? 'remove' : 'getValue';
		$object = AH::$method( $_SESSION, $name );

		return $object === null ? $object : unserialize( $object );
	}


	/**
	 *  Сохраняет объект в сессию, предварительно сериализовав его.
	 *
	 * @param string $name имя переменной (ключ/индекс), под которой объект будет сохранён.
	 * @param mixed $value  значение, которое необходимо сохранить в сессию.
	 *
	 * @return self для реализации chaining'а
	 */
	public function storeObject($name, $value) {
		$_SESSION[ $name ] = serialize( $value );

		return $this;
	}


	public function cleanStore() {
		$keys = self::getStoreKeys();

		foreach( $keys as $key ) {
			if( isset($_SESSION[$key]) ) {
				unset( $_SESSION[ $key ] );
			}
		}
	}


	protected static function getStoreKeys() {
		return [
			  '_template',
			  '_uploaded_file',
			  '_inner_methods',
			  '_import_model',
			  '_docType',
			  '_data',
			  'extractedOriginalTmpDir',
			  '_records',
			  '_no_request_data_run'
		];
	}


	/**
	 * @important Первый открытый метод, предназначенный для обработки пользовательских запросов.
	 * Вслед за ним (в настоящий момент) вызывается метод @see Import::processImportData().
	 *
	 * @param array  $request
	 * @param string $template название шаблона
	 * @param array  $innerMethods внутренние методы для вставки и автопривязки записей, а также связанный с ними объект
	 * @param array  $params дополнительные параметры, которые могут понадобиться в процессе импорта

	 *
	 * @throws Exception обработчик исключений
	 * @return mixed
	 */
	public function run(array $request = [], $template, array $innerMethods = [], array $params = [] )
	{
		$this->cleanStore();

		if( AH::remove( $params, 'runWithoutRequest' )) {
			$this->_noRequestDataRun = true;
		}

		$this->storeObject( '_additional_import_params', AH::remove( $params, 'additionalImportParams', [] ) );

		//  менеджер загрузок (разрешаем грузить файлы любого)
		$manager = new UploadManager();
		//  кэшируем загруженный файл
		$file = AH::getValue( $manager->getByName( 'upload' ), 0, null );
		//  cтартуем сессию
		if( session_id() === '' ) {
			session_start();
		}

		//  записываем в неё текущие данные параметров запроса и изначальное имя загруженного файла
		$modelName = AH::getValue( $params, 'modelName' );

		//  параметры запроса (если нужны) - проверяем и записываем
		$requestParams = [];

		if( !$this->_noRequestDataRun ) {
			$requestParams = self::parseRequestParams( $request );
			$requestParamsData = AH::getValue( $requestParams, [ 0, 'data' ], [] );
			$mappedRequestParamsData = AH::map( $requestParamsData, 'name', 'value' );
			$this->storeObject( '_mapped_request_data', $mappedRequestParamsData );
		} else {
			$this->storeObject( '_mapped_request_data', [] );
		}


		$this->storeObject( '_template', $template )
		     ->storeObject( '_uploaded_file', $file )
		     ->storeObject( '_inner_methods', $innerMethods )
		     ->storeObject( '_request_params', $requestParams )
		     ->storeObject('_import_model', FactoryModel::build( $modelName ?: $template ) );


		//  парсим данные для импорта
		$data = $this->parseDocument( $file );

		$hasError = AH::getValue( $data, 'error' );

		//  если при парсинге возникла ошибка - возвращаем её на клиент
		if( $hasError ) {
			return $this->sendError( $data );
		}
		//  в противном случае сохраняем полученные данные, посылаем "добро" на клиент, и продолжаем обработку данных..
		else {

			//  разархивирование документа ODS во временную директорию, удаление загруженного шаблона
			$filePath = $file->getPath();
			$dirName = uniqid( '_doc', false );
			$extractedOriginalTmpDir = self::tmpDir( $dirName );

			$zip = new ZipArchive();

			if( $zip->open( $filePath ) === true ) {
				$zip->extractTo( $extractedOriginalTmpDir );
				$zip->close();
			}

			$this->storeObject( '_data', $data );
			$this->storeObject( 'extractedOriginalTmpDir', $extractedOriginalTmpDir );

			return $this->sendOk();
		}
	}


	/**
	 *  Возвращает ошибку на клиент
	 *
	 * @param array $data массив с данными об ошибке. В массиве должен присутствовать элемент 'error' с положительным
	 * булевым значением, и 'message' с текстом возникшей ошибки.
	 *
	 * @return string закодированные в JSON данные об ошибке
	 */
	public function sendError(array $data)
	{
		//  отправляем данные об ошибке на клиенте
		return json_encode( $data );
	}


	/**
	 *  Метод посылает на клиент сигнал о том, что текущая операция была успешно завершена.
	 *
	 * @return string JSON с положительным значением под индексом 'success', и отрицательным значением индекса 'error'.
	 */
	public function sendOk()
	{
		//  отправляем данные об успехе операции на клиент
		return json_encode( [
			'error' => false,
			'success' => true
		] );
	}


	/**
	 *  @important Второй метод, обрабатывающий запросы с клиента. Продолжаем работу с данными для импорта после
	 *  выполнения метода @see Import::run().
	 */
	public function processImportData()
	{
		$data = $this->getStoredObject( '_data' );

		//  Наполняем модели данными и производим валидацию
		$this->generateRecords( $data );

		//  Сохранаем сгенерированные модели в сессию
		$this->storeObject( '_records', $this->records );


		$error = (bool)$this->_error;
		$recordsTotal = count($this->records);
		$recordsWithErrors = $this->dataErrors;

		$result = [
			'error' => $error,
			'recordsTotal' => $recordsTotal,
			'recordsWithErrors' => $recordsWithErrors
		];

		return json_encode( $result );
	}


	/**
	 * @param array  $request  массив с параметрами запроса
	 * @param string $template имя файла шаблона
	 * @param string $filename название документа, выгружаемого пользователем
	 * @param array  $params   дополнительные данные, которые будут доступны в процессе рендеринга шаблона
	 *
	 * @throws Exception обработчик исключений
	 */
	public function downloadTemplate(array $request, $template, $filename = null, array $params = [])
	{
		//  базовые проверки, + получение массива "data" параметров запроса
		$requestParams = [];

		if( !$this->_noRequestTemplateDownload ) {
			$requestParams = self::parseRequestParams( $request );

			//  получаем данные по конкретному плану из запросов к базе, параметры которых должны быть описаны в $request
			$this->prepareData( $requestParams );
		}

		//  создаём экземпляр генератора док-тов ODS
		$this->ods = new odsgen\ods();

		//  определяем шаблон и заполняем его данными
		$this->setTemplate( $template );

		$this->renderFile( $this->_template, [
			'data' => [
				'request'  => $requestParams,
				'template' => $template,
				'params' => $params
			]
		]);

		//  имя документа, который получит пользователь
		$filename = $filename ?: $template . 'ods';

		$this->ods->downloadOdsFile( $filename );
	}

	public function downloadTemplateWithoutRequest($template, $filename = null, array $params = [])
	{
		$this->_noRequestTemplateDownload = true;

		$this->downloadTemplate( [], $template, $filename, $params );
	}


	/**
	 * Продолжаем/завершаем загрузку данных
	 *
	 * @var $wasSuccess boolean была ли вставлена хотя бы одна строка?..
	 *
	 * @return string закодированный в json результат импорта данных
	 */
	public function finishImportData()
	{
		$wasSuccess = $this->insertRecords( true );

		//  если при парсинге ошибок не возникло - оповещаем клиент
		if( $wasSuccess ) {
			return $this->sendOk();
		}
		//  в противном случае посылаем на клиент данные и текст ошибки...
		else {
			return $this->sendError([
				'error' => true,
				'success' => false,
				'message' => 'В результате операции не было импортировано ни одной строки'
			]);
		}
	}


	/**
	 *  Подсветить ошибки в документе и отправить пользователю
	 **
	 * @throws Exception обработчик исключений
	 */
	public function highlightErrors()
	{
		$uploadedFile = $this->getStoredObject('_uploaded_file');

		//  пересобираем/создаём документ, помечая ошибки
		if( $uploadedFile->getExtension() === 'ods' ) {
			$extractedOriginalTmpDir = $this->getStoredObject( 'extractedOriginalTmpDir' );
			$this->processErrorHighlighting( [ '_tmpDir' => $extractedOriginalTmpDir ] );
		} else {
			$this->generateSpreadsheetWithErrors();
		}
	}


	/**
	 * @deprecated функционал отклонён из-за сложностей с открытием оригинала после процесса импорта (файлы будут
	 * скапливаться)
	 */
	public function openOriginalDocument()
	{
		$file = $this->getStoredObject('_uploaded_file');

		$filename = $file->getName();

		$extension = $file->getExtension();
		$fullFilename = $filename . '.' . $extension;

		//        header('Content-type: application/vnd.oasis.opendocument.spreadsheet');
		header('Content-Disposition: attachment; filename="' . $fullFilename . '"');

		readfile( $file->getPath() );
	}


	/**
	 *  Собирает новый ODS документ с отметками об ошибках из разархивированного ранее
	 *
	 * @param string $filename имя нового документа
	 * @throws Exception обработчик исключений
	 */
	protected function packOds( $filename )
	{
		$zip = new ZipArchive();

		if ( $zip->open( $filename, 8 ) === true )
		{
			$dir = $this->_tmpDir . DIRECTORY_SEPARATOR;

			$zip->addFile( $dir . 'content.xml', 'content.xml' );
			$zip->addFile( $dir . 'meta.xml', 'meta.xml' );
			$zip->addFile( $dir . 'mimetype', 'mimetype' );
			$zip->addFile( $dir . 'settings.xml', 'settings.xml' );
			$zip->addFile( $dir . 'styles.xml', 'styles.xml' );
			$zip->addFile( $dir . 'Configurations2/accelerator/current.xml', 'Configurations2/accelerator/current.xml' );
			$zip->addFile( $dir . 'META-INF/manifest.xml', 'META-INF/manifest.xml' );
			$zip->addFile( $dir . 'Thumbnails/thumbnail.png', 'Thumbnails/thumbnail.png' );

			$zip->close();

		} else
		{
			throw new Exception( 'Невозможно открыть ' . $filename );
		}

	}


	/**
	 * @return string путь к шаблонам
	 */
	public function getTemplatesDir(){
		return $this->_templatesDir;
	}

	/**
	 * Устанавливает путь до шаблона
	 *
	 * @param string $name имяя шаблона
	 * @throws Exception обработчик исключений
	 */
	public function setTemplate($name) {
		$template = $this->_templatesDir. DS . $name . '.php';
		$this->_template = $template;

		parent::setTemplate( $name );
	}


	/**
	 * Устанавливает путь до шаблона
	 *
	 * @return string название шаблона
	 */
	public function getTemplate() {
		return $this->_template;
	}


	/**
	 * @return odsgen\ods Ods
	 */
	public function getOds() {
		return $this->_ods;
	}

	/**
	 * @param odsgen\ods $value
	 * @return $this
	 */
	public function setOds($value){
		$this->_ods = $value;
	}

	/**
	 *  Проверяет переменную сессии в случае, если соответствующее свойство контроллера пусто.
	 *
	 * @return odsgen\ods Ods
	 */
	public function getRecords()
	{
		return $this->_records ?: $this->getStoredObject('_records', false);
	}

	/**
	 * @param odsgen\ods $value
	 * @return $this
	 */
	public function setRecords($value){
		$this->_records = $value;
	}


	protected static function tmpDir($key = '') {
		return sprintf( '%s'. DIRECTORY_SEPARATOR .'%s', DIRECTORY_SEPARATOR . 'tmp', $key );
	}


	/**
	 * @param $event событие завершения сборки шапки шаблона
	 */
	public function onTemplateHeaderConstructed($event)
	{
		/** @var Event $event */
		$records = AH::getValue( $event->data, 'records', [] );
		$table = AH::getValue( $event->data, 'table', [] );

		/** @var _import_model $record */
		foreach ( $records as $record )
		{
			$attributes = $record->getAttributes();
			$row = new odsgen\odsTableRow();

			foreach ( $attributes as $value ) {
				$row->addCell( new odsgen\odsTableCellString( $value ) );
			}

			$table->addRow( $row );
		}
	}


	protected function generateSpreadsheetWithErrors()
	{
		//  кэшируем записи, загруженный файл и прочие данные...
		$records = $this->getStoredObject( '_records' );
		$template = $this->getStoredObject( '_template' );
		$uploadedFile = $this->getStoredObject( '_uploaded_file' );

		if( $this->_noRequestDataRun ) {
			$requestParams = [];
		} else {
			//  получаем данные по конкретному плану из запросов к базе, параметры которых должны быть описаны в $request
			$requestParams = $this->getStoredObject( '_request_params' );
			$this->prepareData( $requestParams );
		}

		//  создаём экземпляр генератора док-тов ODS
		$this->ods = new odsgen\ods();

		//  определяем шаблон и заполняем его данными
		$this->setTemplate( $template );

		//  таблица для документа
		$table = new odsgen\odsTable('t1');

		//  Обрабатываем событие завершения сборки шаблона импорта, в котором проставляем распарсенные ранее значения
		$this->on( 'templateHeaderConstructed', [ $this, 'onTemplateHeaderConstructed' ], [
			'records' => $records,
			'table' => $table
		]);

		$this->renderFile( $this->_template,
			[
				'data' => [
					'request'  => $requestParams,
					'template' => $template,
					'table'    => $table
				]
			] );


		$docName = tempnam('tmp', 'errors');
		$this->ods->genOdsFile( $docName );

		$dirName = uniqid( '_gen', false );

		$this->extractFileTo( $docName, $dirName, true );

		//  имя документа, который получит пользователь
		$filename = ( $uploadedFile ? $uploadedFile->getName() : $template ) . '.ods';
		$this->processErrorHighlighting( ['filename' => $filename ] );
	}


	/**
	 *  далее применить в @see Import::run()
	 */
	protected function extractFileTo($file, $dir, $removeFile = false)
	{
		//  разархивирование документа ODS во временную директорию, удаление загруженного шаблона
		$this->_tmpDir = self::tmpDir( $dir );

		$zip = new ZipArchive();

		if( $zip->open( $file ) === true ) {
			$zip->extractTo( $this->_tmpDir );
			$zip->close();
		}

		//        if( $removeFile && file_exists( $file ) ) {
		//            unlink( $file );
		//        }
	}


	/**
	 *  Генерирует записи из подготовленных данных, предварительно выполняя их валидацию, и отсеевая от пустых строк.
	 *  Процесс валидации происходит в отдельном классе после создания модели
	 *
	 * @param array $data данные для валидации и дальнейшей работы
	 */
	protected function generateRecords( array $data ) {
		$records = [];

		//  Среди импортируемых ODS-документов были выявлены экземпляры, которые, по какой-то причине,
		//  содержат лишние столбцы, при этом все ячейки этих столбцов - пустые строки ('').
		//  Естественно, дабы избежать постоянных и трудновыявляемых ошибок при импорте данных из документов ODS,
		//  такие столбцы необходимо отсеивать.
		if( $this->getStoredObject( '_docType' ) === 'ODS' ) {
			call_user_func(array($this->getStoredObject( '_import_model' ), 'normalizeColumnsNumberWrapper'), $data);
		}

		$importModel = $this->getStoredObject( '_import_model' );

		$oneCellItemSize = count( current($data) ) - 1;

		foreach( $data as $i => $item )
		{
			//  пустые и группировочные строки отсеиваются
			if( array_sum( array_map( 'strlen', $item ) ) > 0 && $oneCellItemSize !== array_sum( array_map( function ($val) { return $val === '' || $val === null || $val === 0; }, $item ) ) ) {
				//  создание модели, валидация данных
				$records[ $i ] = new $importModel( $item );

				if( $records[ $i ]->hasError() ) {
					++$this->dataErrors;

					if( $this->_error === null ) {
						$this->_error = true;
					}
				}

			}
		}

		$this->records = $records;
	}


	/**
	 *  Перебираем созданные записи и вызываем к каждой ф-ю вставки
	 *
	//* @param array $requestParamsData дополнительные параметры запроса: ДОВУ (заказчик) и вариант плана....
	 * @param bool  $force выполнять запросы, игнорируя наличие ошибок
	 * @return bool вставлена ли хотя бы одна строка в результате вызова этого метода?
	 */
	protected function insertRecords( $force = false )
	{
		/** @var UploadedFile $uploadedFile */

		// TODO: этот кусок написан для импорта данных с json-массивами в строках, в дальнейшем надо будет переработать
		//  если параметры запроса (request) были отключены вызовом альтернативным методом запуска импорта...
		if( $this->_noRequestDataRun )
		{
			$planYearData = [];
		} else
		{
			//  данные параметров запроса
			$requestParams = $this->getStoredObject( '_request_params', true );

			$this->prepareData( $requestParams );

			$fnName = AH::getValue( $requestParams, [ 0, 'method' ] );

			//  подготавливаем остальные данные для шаблона..
			$planData = AH::getValue( $this->getData(), [ $fnName, 0 ], [] );
			$planYearBeg = AH::getValue( $planData, 'plan_year_beg' );
			$planYearData = [ 'plan_var_data_year' => [
				  [ 'data_year' => $planYearBeg ],
				  [ 'data_year' => $planYearBeg + 1 ],
				  [ 'data_year' => $planYearBeg + 2 ]
			] ];
		}

		//  загруженный временный файл больше не требуется
		//        if( file_exists( $filePath ) ) {
		//            unlink( $filePath );
		//        }

		$records = $this->records;
		$requestParamsData = $this->getStoredObject( '_mapped_request_data', true );
		$innerMethods = $this->getStoredObject( '_inner_methods' );
		$additionalImportParams = $this->getStoredObject( '_additional_import_params', true );


		//Insert data
		$insertObject = AH::remove( $innerMethods, 'object_source' );
		$insertMethod = AH::remove( $innerMethods, 'insert_source' );
		$insertMetaData = AH::remove( $innerMethods, 'metaData_source' );

		//Import data
		$object = AH::remove( $innerMethods, 'object' );
		$import = AH::remove( $innerMethods, 'import' );
		$metaData = AH::remove( $innerMethods, 'metaData' );

		//  если записи присутствуют, закидываем их на базу
		if( ( !$this->_noRequestDataRun && $requestParamsData !== null ) && count( $records ) )
		{
			$insertParamsData = AH::merge( $requestParamsData, $planYearData );
			$insertParamsData = AH::merge( $insertParamsData, $additionalImportParams );
			// $insertParamsData = AH::merge( $requestParamsData, $planYearData );
			//  цикл, создающий новые строки предложений
			foreach( $records as $record )
			{
				/** @var $this->getStoredObject( '_import_model' ) $record */
				(new Request())->execute([
					'decode'   => true,
					'metaData' => $insertMetaData,
					'action'   => 'create',
					'object'   => $insertObject,
					'method'   => $insertMethod,
					'data'     => $record->getRequestFormattedData( $insertParamsData, $force )
				]);
			}

			if( $object && $import ) {
				$autoImportData = [
					  'decode'   => true,
					  'metaData' => $metaData,
					  'action'   => 'read',
					  'object'   => $object,
					  'method'   => $import,
					  'data'     => []
				];

				if( !empty( $requestParamsData ) ) {
					$autoImportData[ 'data' ] = [
						  'plan_var_id' => AH::getValue( $requestParamsData, 'plan_var_id' )
					];
				}

				//  инициируем процесс автоимпорта
				(new Request())->execute( $autoImportData );
			}


			$result = [ 'result' => true ];

		} else
		{
			$result = [ 'result' => false ];
		}

		return $result;
	}


	/**
	 *  Парсим данные входящего документа
	 *
	 * @param $file
	 * @return array|mixed
	 * @throws Exception обработчик ошибок
	 */
	protected function parseDocument($file)
	{
		if( $file )
		{
			$this->_uploadedFile = $file;
			$extension = $this->_uploadedFile->getExtension();
			$filePath = $this->_uploadedFile->getPath();

			//  Сохранаем сгенерированные модели в сессию
			$this->storeObject( '_docType', mb_strtoupper( $extension, 'UTF-8' ) );

			//  поддерживаемые расширения
			switch( $extension )
			{
				case 'xls':
					$data = $this->extractDataFromXls( $filePath );
					break;

				case 'xlsx':
					$data = $this->extractDataFromXlsx( $filePath );
					break;

				case 'csv':
					$data = $this->extractDataFromCsv( $filePath );
					break;

				case 'ods':
					$data = $this->extractDataFromOds( $filePath );
					break;

				default:
					$data = [
						'error' => true,
						'message' => self::MESSAGE_FILE_WRONG_TYPE
					];
					break;
			}

		} else
		{
			$message = self::MESSAGE_FILE_IS_EMPTY . ' или ' . mb_strtolower( self::MESSAGE_FILE_WRONG_TYPE );
			$data = [
				'error' => true,
				'message' => $message
			];
		}

		return $data;
	}


	/**
	 * Извлекает данные документа ODS
	 *
	 * @param string $filename Файл для извлечения данных
	 *
	 * @return array Массив данных документа
	 */
	protected function extractDataFromOds($filename) {
		//  ODS-парсер
		$formatter = new OdsFormatter( $filename );
		$result = self::parseOdsContent( $this->getStoredObject( '_import_model' ), $formatter );

		return  $result;
	}


	/**
	 * Извлекает данные документа XLS
	 *
	 * @param string $filename путь к загруженному файлу
	 *
	 * @return array извлечённые данные
	 * @throws Exception обработчик ошибок
	 */
	protected function extractDataFromXls($filename)
	{
		//  XLS-парсер
		require_once PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'backend' . DS . 'component' . DS . 'xlsParser' . DS . 'Book.php';

		$parser = new Book( file_get_contents( $filename ) );

		$sheet = $parser->getSheetByIndex(0);

		//\App\common\system\Debugger::getInstance()->put('$sheet ' .  $sheet);

		$result = call_user_func(array($this->getStoredObject( '_import_model' ), 'excludeHeaderRows'), $sheet->cell_values); //  обрезаем хэдер
		$result = call_user_func(array($this->getStoredObject( '_import_model' ), 'excludeFooterRows'), $result); //  обрезаем футер

		return $result;
	}


	/**
	 * Извлекает данные документа CSV
	 *
	 * @param string $filename путь к загруженному файлу
	 *
	 * @return array извлечённые данные
	 * @throws Exception обработчик ошибок
	 */
	protected function extractDataFromCsv($filename)
	{
		//  CSV-парсер
		require_once PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'backend' . DS . 'component' . DS . 'csvParser' . DS . 'CsvParser.php';

		$parser = new CsvParser();
		$parser->heading = false;
		$parser->auto( $filename );
		$result = call_user_func(array($this->getStoredObject( '_import_model' ), 'excludeHeaderRows'), $parser->data);
		$result = call_user_func(array($this->getStoredObject( '_import_model' ), 'excludeFooterRows'), $result);
		//        unlink( $filename );

		return $result;
	}


	/**
	 * Извлекает данные документа XLSX
	 *
	 * @param string $filename путь к загруженному файлу
	 *
	 * @return array извлечённые данные
	 * @throws Exception обработчик ошибок
	 */
	protected function extractDataFromXlsx($filename)
	{
		//  конвертер XLSX в CSV
		require_once PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'backend' . DS . 'component' . DS . 'xlsxToCsv' . DS . 'XlsxToCsv.php';

		//  сначала конвертируем XLSX в CSV, затем парсим
		$converter = new XlsxToCsv( $filename );
		$csv = $converter->convert();
		$tempName = tempnam( 'tmp', 'parsedcsv' );

		file_put_contents( $tempName, file_get_contents( $csv ) );

		//  парсим получившийся CSV
		return $this->extractDataFromCsv( $tempName );
	}


	/**
	 * Закрытый метод. Работает с @see Import::extractDataFromOds()
	 *
	 * @param $odsFormatter OdsFormatter
	 * @param int $spreadsheet
	 * @param int $start
	 * @param null $end
	 *
	 * @return array|null
	 */
	protected static function parseOdsContent( $importModel, OdsFormatter $odsFormatter, $spreadsheet = 1, $start = 1, $end = null )
	{
		$result = null;
		$workspace = $odsFormatter->getWorkspace();
		$contentPath = $workspace . DS . 'content.xml';

		if( file_exists( $contentPath ) )
		{
			$dom = new DOMDocument( '1.0', 'UTF-8' );
			$dom->load( $contentPath );

			//  с ODS-документами возможны два варианта, дополнительные обработки требуются только в том случае, если в
			//  документе отсутствует тэг TABLE:TABLE-HEADER-ROWS. Тогда нам необходимо вручную отбросить лишние
			//  строки хэдера...
			$TableHeaderRows = $dom->getElementsByTagName('table-header-rows')->item(0);
			$result = $odsFormatter->export( $spreadsheet, $start, $end );

			if( empty( $TableHeaderRows ) ) {
				$result = call_user_func(array($importModel, 'excludeHeaderRows'), $result); //  обрезаем хэдер
			}
			$result = call_user_func(array($importModel, 'excludeFooterRows'), $result);
		}

		return $result;
	}


	/**
	 * процесс подсветки ошибок (выделение содержимого невалидных ячеек красным цветом), и выгрузки файла обратно пользователю...
	 *
	 * @param array $options массив дополнительных параметров
	 *
	 * @throws Exception обработчик ошибок
	 */
	protected function processErrorHighlighting(array $options = [])
	{
		$tmpDirPath = AH::getValue( $options, '_tmpDir' );
		if( $tmpDirPath ) {
			$this->_tmpDir = $tmpDirPath;
		}

		$contentXml = $this->_tmpDir . DS . 'content.xml';
		$records = $this->records;
		$rows = [];
		$headerRows = [];
		$cells = [];
		$errors = [];
		$document = new DOMDocument('1.0', 'UTF-8');
		$document->load( $contentXml );

		foreach( $records as $index => $record )
		{
			/** @var $this->getStoredObject( '_import_model' ) $record */
			if( $record->hasError() )
			{
				$errs = $record->getErrors();

				foreach( $errs as $attribute => $err ) {
					$errors[ $index ][] = $record->getAttributeIndex( $attribute );
				}
			}
		}


		//  включаем в таблицу стилей стили ошибок с подсветкой шрифта красным
		$this->applyTableCellErrorStyle( $document );


		//  определение хэдера
		$attributesCount = AH::getValue( $records, 0 )->countAttributes();
		$tableheader = $document->getElementsByTagName('table-header-rows')->item(0);
		$tableheaderRows = AH::getValue( $tableheader, 'childNodes', [] );


		/*  Возможны небольшие расхождения в коде таблиц документов ODS - в теле таблицы может присутствовать тэг
		table-rows (по аналогии с table-header-rows), являющийся контейнером для строк таблицы не относящихся к шапке,
		с тем же успехом, в коде его может и не быть. Поэтому следующие несколько строк кода, выполнив необходимые
		проверки, определяют корректного родителя строк тела таблицы (содержащих непосредственно данные,
		предназначенные для импорта), и направляют цикл в правильное русло..
		*/
		$table = $document->getElementsByTagName('table')->item(0);
		$tableRowsTag = $document->getElementsByTagName('table-rows')->item(0);
		$tableChildNodes = $tableRowsTag? $tableRowsTag->childNodes : $table->childNodes;


		if( is_array( $tableheaderRows ) && !count( $tableheaderRows ) ) {
			$model = $this->getStoredObject( '_import_model' );
			$headerSize = $model::DEFAULT_HEADER_SIZE;
			$tableRows = $document->getElementsByTagName('table-row');
			$tableheaderRows = [];

			if( $headerSize ) {
				for( $i=0; $i<$headerSize; $i++ ) {
					$tableheaderRows[] = $tableRows->item( $i );
				}
			}
		}


		//  отметки ошибок в хэдере (цикл)
		if( AH::getValue( $tableheaderRows, 'length' ) )
		{
			foreach( $tableheaderRows as $i => $row )
			{
				if( $row->nodeName === 'table:table-row' ) {
					$rowNumber = count( $headerRows );
					$headerRows[ $rowNumber ] = new \App\project\OdTools\OdsRow( $document, $row );
					$headerCells[ $rowNumber ] = $headerRows[ $rowNumber ]->exportCells();

					if( count($headerCells[ $rowNumber ]) === $attributesCount )
					{
						foreach($errors as $rowIndex => $cellIndexes )
						{
							foreach( $cellIndexes as $cellIndex )
							{
								/** @var \DOMElement $headerCell */
								$headerCell = $headerCells[ $rowNumber ][ $cellIndex ]->getNode();
								$headerCell->setAttribute('table:style-name', 'ce-header-error');
							}
						}
					}
				}
			}
		}


		foreach( $tableChildNodes as $i => $child )
		{
			if( $child->nodeName === 'table:table-row' ) {

					$rowNumber = count( $rows );
					$rows[ $rowNumber ] = new \App\project\OdTools\OdsRow( $document, $child );
					$cells[ $rowNumber ] = $rows[ $rowNumber ]->exportCells();

			}
		}
		// перебор ошибок (формат $errors = [ int rowNumber : [ int i : int cellNumber, ... ])
		foreach( $errors as $rowNumber => $cellNumbers )
		{
			foreach( $cellNumbers as $cellNumber )
			{
				//  Учитываем кол-во строк заголовка
				$targetRowIndex = empty( $headerSize ) ? $rowNumber : $rowNumber + $headerSize;

				/** @var \DOMElement $cell */
				$cell = $cells[ $targetRowIndex ][ $cellNumber ]->getNode();
				//  установка определённого ранее стиля ошибки ячейке таблицы
				$cell->setAttribute('table:style-name', 'ce-error');
			}
		}

		//  обновляем контент XML на версию с подсвеченными ошибками
		unlink( $contentXml );
		$document->save( $contentXml );

		/* @var $file UploadedFile */
		$file = $this->getStoredObject( '_uploaded_file' );

		//  переименовываем исходный файл (дописываем пометку о наличии ошибок)
		$filename = AH::getValue( $options, 'filename', $file->getName() );
		if( strpos( $filename, ' (с ошибками)' ) === false ) {
			$filename .= ' (с ошибками)';
		}

		$extension = $file->getExtension();
		$fullFilename = $filename . '.' . $extension;

		header('Content-type: application/vnd.oasis.opendocument.spreadsheet');
		header('Content-Disposition: attachment; filename="' . $fullFilename . '"');
		$tmpFilename = tempnam( 'tmp', $filename );
		$this->packOds( $tmpFilename );

		readfile( $tmpFilename );
		unlink( $tmpFilename );
		exit(0);
	}


	/**
	 * Метод добавляет в тэг automatic-styles файла content.xml ODF документа стиль наличия ошибки
	 * для табличной ячейки. Стиль выделяет имеющийся в ячейке таблицы (+ соответствующей ячейке хэдера таблицы)
	 * текст красным цветом...
	 *
	 * @param DOMDocument $document экземпляр модели активного XML-документа
	 */
	protected function applyTableCellErrorStyle( DOMDocument $document )
	{
		$automaticStyles = $document->getElementsByTagName('automatic-styles')->item(0);


		/** @var \DOMElement $errorStyle */
		$errorCellStyle = $document->createElement( 'style:style' );
		$errorCellStyle->setAttribute('style:name', 'ce-error');
		$errorCellStyle->setAttribute('style:family', 'table-cell');
		$errorCellStyle->setAttribute('style:parent-style-name', 'Default');
		$automaticStyles->appendChild( $errorCellStyle );

		$errorTableCellProperties = $document->createElement( 'style:table-cell-properties' );
		$errorCellStyle->appendChild( $errorTableCellProperties );

		$errorParagraphProperties = $document->createElement( 'style:paragraph-properties' );
		$errorCellStyle->appendChild( $errorParagraphProperties );

		$errorTextProperties = $document->createElement( 'style:text-properties' );
		$errorTextProperties->setAttribute( 'fo:color', '#c90016');
		$errorTextProperties->setAttribute( 'style:text-outline', 'false');
		$errorTextProperties->setAttribute( 'style:text-line-through-style', 'none');
		$errorTextProperties->setAttribute( 'fo:font-style', 'normal');
		$errorTextProperties->setAttribute( 'style:font-style-asian', 'normal');
		$errorTextProperties->setAttribute( 'style:font-style-complex', 'normal');
		$errorTextProperties->setAttribute( 'fo:text-shadow', 'none');
		$errorCellStyle->appendChild( $errorTextProperties );


		/** @var \DOMElement $headerErrorStyle */
		$headerErrorCellStyle = $document->createElement( 'style:style' );
		$headerErrorCellStyle->setAttribute('style:name', 'ce-header-error');
		$headerErrorCellStyle->setAttribute('style:family', 'table-cell');
		$headerErrorCellStyle->setAttribute('style:parent-style-name', 'Default');
		$automaticStyles->appendChild( $headerErrorCellStyle );

		$headerErrorTableCellProperties = $document->createElement( 'style:table-cell-properties' );
		$headerErrorTableCellProperties->setAttribute( 'style:text-align-source', 'fix');
		$headerErrorTableCellProperties->setAttribute( 'style:repeat-content', 'false');
		$headerErrorTableCellProperties->setAttribute( 'fo:wrap-option', 'wrap');
		$headerErrorTableCellProperties->setAttribute( 'fo:border', '0.002cm solid #000000');
		$headerErrorTableCellProperties->setAttribute( 'style:vertical-align', 'middle');
		$headerErrorCellStyle->appendChild( $headerErrorTableCellProperties );

		$headerErrorParagraphProperties = $document->createElement( 'style:paragraph-properties' );
		$headerErrorParagraphProperties->setAttribute( 'fo:text-align', 'center' );
		$headerErrorParagraphProperties->setAttribute( 'fo:margin-left', '0cm' );
		$headerErrorCellStyle->appendChild( $headerErrorParagraphProperties );

		$headerErrorTextProperties = $document->createElement( 'style:text-properties' );
		$headerErrorTextProperties->setAttribute( 'fo:color', '#c90016');
		$headerErrorTextProperties->setAttribute( 'style:font-name', 'Times New Roman');
		$headerErrorTextProperties->setAttribute( 'fo:font-size', '12pt');
		$headerErrorTextProperties->setAttribute( 'style:font-size-asian', '12pt');
		$headerErrorTextProperties->setAttribute( 'style:font-size-complex', '12pt');
		$headerErrorCellStyle->appendChild( $headerErrorTextProperties );
	}



}