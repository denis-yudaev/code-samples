<?php

/**
 * Пространство имёно класса
 */
namespace App\project\controller;

require_once(sprintf('%s/libraries/odtools/autoloader.php', PATH_SYSTEM));

/**
 * Используемые типажи / классы
 */
use App\common\system\Exception;
use App\common\system\Request;
use App\common\Utilities;
use odsgen;
use odtphpgenerator as odtgen;
use App\common\source\database\Condition;
use OdTools\OdConfigurator;
use App\common\source\filesystem\File;
use App\common\component\ArrayHelper as AH;


/**
 * Класс экспорта
 * Class Export
 *
 * @property odtgen\Odt odt
 * @property array      data
 * @package App\project\controller
 * @property string     partialsDir путь до директории, где лежат "частичные шаблоны"
 */
class Export extends BaseDocController
{
	/**
	 * Формат пути до домашней директории.
	 */

	const FORMAT_HOME = '%s/files/%s_%d_%d';

	/**
	 * Формат пути назначения загруженного файла ИБД.
	 */

	const FORMAT_DESTINATION_PATH = '%s/%d.%s';

	//  защищённый признак отсутствия параметров запроса (как альтернативный вариант формирования ПФ)
	protected $_noRequestDataRun;

	// Контейнер для экземпляра .odt генератора
	protected $_odt;

	// Контейнер для экземпляра .ods генератора
	protected $_ods;

	//  путь к "частичным шаблонам"
	protected $_partialsDir;

	//  вспомогательный массив для хранения сквозной для частичных шаблонов информации в контроллере
	protected $_params;



	/**
	 * @param       $name    - имя параметра
	 * @param mixed $default - дефолтное значение
	 * @return mixed - значение параметра
	 */
	public function getParam( $name, $default = null ) {
		return AH::getValue( $this->_params, $name, $default );
	}


	/**
	 * @param        $name - имя параметра с функцией, которую необходимо вызвать
	 * @param  array $args - аргументы для вызываемой функции
	 * @return mixed - результат выполнения функции
	 */
	public function callParam($name, array $args = []) {
		$fn = $this->getParam( $name );
		return is_callable( $fn ) ? call_user_func_array( $fn, $args ) : null;
	}


	/**
	 * @param mixed $name  - имя параметра
	 * @param mixed $value - значение параметра
	 * @return $this для возможности чэйнинга
	 */
	public function setParam($name, $value) {
		$this->_params[ $name ] = $value;
		return $this;
	}


	/**
	 * Конструктор.
	 */
	public function __construct()
	{
		parent::__construct();
		$this->_partialsDir = PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'templates' . DS . 'export' . DS . 'partials' . DS;
		$this->_params = [];

		OdConfigurator::setHome(sprintf(self::FORMAT_HOME,
			PATH_SYSTEM,
			USER_LOGIN,
			USER_LEVEL,
			USER_CATEGORY));

		$home = OdConfigurator::getHome();
		if (is_dir($home) === false) {
			mkdir($home, 0700, true);
		}
	}


	/**
	 * Устанавливает путь до шаблона
	 *
	 * @param string $name имяя шаблона
	 *
	 * @throws Exception обработчик исключений
	 */
	public function setTemplate($name) {
		// определяет путь к файлу шаблона
		$this->_template = $this->_templatesDir . DS . $name . '.phtml';

		parent::setTemplate($name);
	}


	/**  @return string путь к частичным шаблонам */
	public function getPartialsDir() {
		return $this->_partialsDir;
	}


	/**  выставляет путь к частичным шаблонам
	 *
	 * @param string $dirName имя вложенной в папку "/project/templates/export/partials/" директории
	 */
	public function setPartialsDir($dirName) {
		$dir = trim($dirName, "/\\");
		$this->_partialsDir = PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'templates' . DS . 'export' . DS . 'partials' . DS . $dir . DS;
	}

	/**
	 * Альтернативная реализация экспорта, без вызова каких-либо функций БД
	 *
	 * @param string $template имя файла шаблона
	 * @param string $filename название выходного документа
	 * @param array  $params   дополнительные данные, которые будут доступны в процессе рендеринга шаблона ПФ
	 *
	 * @throws Exception
	 */
	public function runWithoutRequest($template, $filename = null, array $params = []){
		$this->_noRequestDataRun = true;
		$this->run( $template, [], $filename, $params );
	}


	/**
	 * Экспорт данных из таблицы
	 *
	 * @param string $template имя файла шаблона
	 * @param array  $request  массив с параметрами запроса данных
	 * @param string $filename название выходного документа
	 * @param array  $params   дополнительные данные, которые будут доступны в процессе рендеринга шаблона ПФ
	 *
	 * @throws Exception
	 * @return mixed
	 */
	public function run($template, array $request, $filename = null, array $params = [])
	{
		$requestParamsData = [];

		if( !$this->_noRequestDataRun )
		{
			//  базовые проверки, + получение массива "data" параметров запроса
			$requestParamsData = self::parseRequestParams( $request );

			//  получаем данные для печатной формы из запросов к базе, параметры которых должны быть описаны в $request
			$this->prepareData( $requestParamsData );

			//фильтры в запросе
			if( !empty( $requestParamsData ) && !empty( $requestParamsData[ 0 ] ) && !empty( $requestParamsData[ 0 ][ 'data' ] ) ) {
				foreach( $requestParamsData[ 0 ][ 'data' ] as $filter ){
					if (!empty($filter[ 'name' ])) {
						$params[ 'filters' ][] = $filter[ 'name' ];
					}
				}
			}

		}

		//если необходимы данные для плана
		if (!empty($params['planVarId'])) {
			// получаем данные о плане
			$planData = $this->getPlanData($params['planVarId']);
			$params['planData'] = $planData;
		}

		//  определяем шаблон и заполняем его данными
		$this->setTemplate($template);
		$this->renderFile(
			$this->_template,
			[
				'params' => $params,
				'_request'  => $requestParamsData,
				'_template' => $template,
			]
		);

		$generatorName = $this->_odt === null ? 'ods' : 'odt';
		$methodName = 'download' . ucfirst($generatorName) . 'File';

		$extension = '.' . $generatorName;
		$fullFilename = $filename ? : $template . $extension;

		//  отдаём клиенту сгенерированный файл и закрываем процесс
		/** @var odtgen\Odt|odsgen\ods $generatorName */
		$this->$generatorName->$methodName($fullFilename);
		exit(0);
	}


	/**
	 * Возвращает генератор документов
	 *
	 * @return odtgen\Odt
	 */
	public function getOdt() {
		if ($this->_odt === null) {
			include_once PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'backend' . DS . 'odt' . DS . 'Odt.php';
			$this->_odt = new odtgen\Odt();
		}

		return $this->_odt;
	}

	/**
	 * Возвращает генератор документов
	 *
	 * @return odsgen\ods
	 */
	public function getOds() {
		if ($this->_ods === null) {
			include_once PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'backend' . DS . 'ods' . DS . 'ods.php';
			$this->_ods = new odsgen\ods();
		}

		return $this->_ods;
	}


	/**
	 * Обёртка для @link {App\project\controller\Export::renderPhpFile}. Дописывает префикс и постфикс в название
	 * частичного шаблона...
	 *
	 * @param string $name   наименование частичного шаблона, который необходимо включить в документ
	 * @param array  $params параметры, передаваемые в шаблон
	 *
	 * @return string строку с результатом обработки шаблона
	 * @throws Exception обработчик исключений
	 */
	public function renderPartial($name, array $params = array()) {
		$file = $this->partialsDir . '_' . $name . '.php';

		if (file_exists($file)) {
			return $this->renderPhpFile($file, $params);
		} else {
			throw new Exception ( self::MESSAGE_TEMPLATE_NOT_FOUND. ': ' . $file );
		}
	}


	//  метод схож с рендером частичных шаблонов, только предназначен для подключения частных вспомогательных классов для формирования ПФ
	public function includeHelper($name, array $params = array()) {
		$file = PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'templates' . DS . 'export' . DS . 'helpers' . DS . $name . '.php';

		if (file_exists($file)) {
			return $this->renderPhpFile($file, $params);
		} else {
			throw new Exception ( self::MESSAGE_TEMPLATE_NOT_FOUND. ': ' . $file );
		}
	}


	/**
	 * Интерпретирует переданный файл как PHP-скрипт и возвращает результат его выполнения в виде строки. При этом в
	 * область видимости выполняемого PHP-файла передаются переменные, переданные в ассоц. массиве @param array $params
	 * .
	 *
	 * @param string $file путь к файлу PHP, результат выполнения которого необходимо получить
	 *
	 * @return string результат выполнения файла PHP в виде строки
	 */
	public function renderPhpFile($file, array $params = array()) {
		ob_start();
		ob_implicit_flush(false);
		extract($params, EXTR_OVERWRITE);
		require($file);

		return ob_get_clean();
	}


	/**
	 * @throws Exception обработчик исключения
	 * @param array $requestData параметры запроса(-ов) к базе, который(-ые) собирает(-ют) данные для выходного документа
	 * @return mixed|void
	 */

	public function prepareData(array $requestData) {
		$data = [];
		$object = [];

		if ( empty( $this->data ) && count( $requestData ) ) {
			foreach ($requestData as $n => $params)
			{
				$params['decode'] = false;
				$params['action'] = self::ACTION_READ;

				$object = (new Request())->execute($params);

				$methodName = $params[ 'method' ];
				$dataIndex = empty( $data[ $methodName ] )? $methodName : $methodName . '_' . $n;

				if(!empty($object[ 'data' ])){
					$data[ $dataIndex ] = $object[ 'data' ];
				} else {
					$data[ $dataIndex ] = [];
				}
			}

			$result = count( $requestData ) > 1 ? $data : $object;

			$this->setData( $result );
		}
	}

	/**
	 * Получаем данные плана
	 * @param integer $planVarId id плана
	 *
	 * @throws Exception
	 * @return array
	 * */
	public function  getPlanData($planVarId) {
		$result = (new Request())->execute(
			[
				'decode' => true,
				'action' => self::ACTION_READ,
				'object' => 'pln.plan_var',
				'method' => 'pln.plan_var_s',
				'data'   => [
					Condition::eq('plan_var_id', $planVarId)
				]
			]
		);

		if (!empty($result) && !empty($result['data']) && !empty($result['data'][0])) {
			return $result['data'][0];
		} else {
			return null;
		}
	}


	public static function getFile($path, $filename)
	{
		$path = PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'templates' . DS . 'export' . DS . $path;
		$file = new File($path);
		$header = 'Content-Disposition: attachment;filename="%s"';
		header(sprintf($header, $filename));
		return $file->read();
	}


	private static function sendFile($filename)
	{
		$file = new File($filename);
		$header = 'Content-Disposition: attachment;filename="%s"';
		header(sprintf($header, $filename));
		return $file->read();
	}

}