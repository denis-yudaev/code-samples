<?php
/**
 * Пространство имёно класса
 */
namespace App\project\controller;

/**
 * Используемые типажи / классы
 */
use App\common\system\AbstractCRUD;
use App\common\system\Exception;
use App\common\system\Request;

use App\common\Utilities;
use App\common\component\ArrayHelper as AH;
use App\project\system\Event;
use odtphpgenerator as odtgen;

/**
 * базовый класс для импорта/экспорта данных. Содержит общие методы наследующих контроллеров.
 * Class BaseDocController
 *
 * @package App\project\controller
 */
class BaseDocController extends AbstractCRUD
{
    CONST MESSAGE_MISSING_REQUEST_PARAMS = 'Отсутствует параметры запроса для получение от сервера данных';
    const MESSAGE_TEMPLATE_NOT_FOUND = 'Шаблон не найден';


    //  Контейнер для данных, которые будет необходимо сформировать, и далее использовать при формировании печатной формы
    protected $_data;

    //  Путь к файлу шаблона
    protected $_template;

    //  Путь к папке с шаблонами
    protected $_templatesDir;


    /**
     * BaseDocController constructor.
     * @param bool $logging вкл/откл логгирование
     */
    public function __construct( $logging = true )
    {
        // Краткое наименование класса
        $class = strtolower( ( new \ReflectionClass( $this ) )->getShortName() );
        $this->_templatesDir = PATH_SYSTEM . DS . PROJECT_DIRECTORY . DS . 'templates' . DS . $class;

        parent::__construct( $logging );
    }


    /**
     * Базовые проверки для стандартных публичных методов дочерних контроллеров
     *
     * @param array $request параметры запроса (обязательны)
     *
     * @return array параметры запроса из массива "data" свойства "request"
     * @throws Exception обработчик исключений
     */
    protected static function parseRequestParams( array $request ) {
        //  параметры запроса, приведённые к правильному формату
        $requestParamsData = Utilities::isAssociativeArray( $request ) ? [ $request ] : $request;

        //  если отсутствуют параметры запроса - вызываем исключение
        if ( !count( $requestParamsData ) ) {
            throw new Exception( self::MESSAGE_MISSING_REQUEST_PARAMS );
        }

        return $requestParamsData;
    }


    /**
     * Абстрактный метод. Проверяет на наличие шаблона
     **
     * @param string $name
     * @throws Exception обработчик исключений
     */
    public function setTemplate($name)
    {
        // Если шаблон не существует, то продолжать нет смысла
        if ( !file_exists( $this->_template ) ) {
            throw new Exception (static::MESSAGE_TEMPLATE_NOT_FOUND);
        }
    }


    /**
     * @param array $requestData параметры запроса(-ов) к базе, который(-ые) собирает(-ют) данные для выходного документа
     *
     * @return mixed значение, возвращённое соответствующим геттером
     * @throws Exception обработчик исключений
     */
    public function prepareData(array $requestData){
        if(empty($this->data)){
            $request = new Request();
            $data = [];

            foreach($requestData as $n => $params){
                $params[ 'decode' ] = true;
                $params[ 'action' ] = self::ACTION_READ;
                empty($params[ 'metaData' ]) && $params[ 'metaData' ] = false;

                $object = $request->execute($params);

                $methodName = $params[ 'method' ];
                $dataIndex = empty( $data[ $methodName ] )? $methodName : $methodName . '_' . $n;

                if(!empty($object[ 'data' ])){
                    $data[ $dataIndex ] = $object[ 'data' ];
                } else {
                    $data[ $dataIndex ] = [];
                }
            }

            $this->data = $data;
        }
    }

    /**
     * Интерпретирует переданный файл как PHP-скрипт и возвращает результат его выполнения в виде строки. При этом в область видимости выполняемого
     * PHP-файла передаются переменные, переданные в ассоц. массиве @param array $params.
     *
     * @param string $file путь к файлу PHP, результат выполнения которого необходимо получить
     *
     * @return string результат выполнения файла PHP в виде строки
     */
    public function renderPhpFile($file, array $params = array())
    {
        ob_start();
        ob_implicit_flush(false);
        extract($params, EXTR_OVERWRITE);
        require($file);

        return ob_get_clean();
    }


    public function renderFile($file, array $params = array())
    {
        ob_start();
        extract($params, EXTR_OVERWRITE);
        require($file);

        return ob_get_clean();
    }


    /**
     * Магический метод вызываемый при запросе одно из действий CRUD
     *
     * @param string $name      CRUD действие
     * @param array  $arguments параметры вызова
     *
     * @return mixed данные ответа действия
     * @throws Exception обработчик исключений
     */
    public function __call($name, array $arguments){
        // Преобразуем вызываемый метод к нижнему регистру
        $name = strtolower($name);

        // Если вызываемый метод не является CRUD операцией Create
        if($name !== static::ACTION_CREATE){
            throw new Exception (static::MESSAGE_ACTION_IS_DISABLED);
        }

        // Параметры вызова
        $parameters = array_pop($arguments);
        // Метод контроллера
        $method = strtolower(AH::getValue($parameters, 'method', 'run'));

        //  Вызываем запрашиваемый метод...
        return call_user_func_array([$this, $method],
            Utilities::validateCallParameters(
                get_class($this),
                $method,
                AH::getValue($parameters, 'data', [])
            ));
    }


    /**
     * Магический метод. Геттер свойств объекта. Не использовать непосредственно. Вызывается автоматически при попытке получить значение
     * несуществующего свойства ($this->undefinedProperty).
     *
     * @param string $name имя свойства, значение которого необходимо получить
     *
     * @return mixed значение, возвращённое соответствующим геттером
     * @throws Exception обработчик исключений
     */
    public function __get($name){
        $getter = 'get' . $name;
        if(method_exists($this, $getter)){
            return $this->$getter();
        } else {
            throw new Exception('Указанное свойство не существует: ' . get_class($this) . '::' . $name);
        }
    }


    /**
     * Магический метод. Сеттер значений свойств. Не использовать непосредственно. Вызывается автоматически при попытке установить значение
     * несуществующего свойства ($this->undefinedProperty = 'newStringValue';).
     *
     * @param string $name  имя изменяемого свойства
     * @param string $value новое значение свойства
     *
     * @throws Exception обработчик исключений
     */
    public function __set($name, $value){
        $setter = 'set' . $name;
        if(method_exists($this, $setter)){
            $this->$setter($value);
        } else {
            throw new Exception('Попытка установить неизвестное свойство: ' . get_class($this) . '::' . $name);
        }
    }


    /**
     * @return array данные для заполнения шаблона и дальнейшего импорта/экспорта
     */
    public function getData(){
        return $this->_data;
    }


    /**
     * @param array $data
     */
    public function setData(array $data){
        $this->_data = $data;
    }



    /**
     * Запускает событие.
     * С помощью этого метода мы можем заставлять события происходить. Метод запускает все связанные события, в том числе события классов.
     *
     * @param string $name имя события
     * @param Event $event событие. Если событие не было передано, дефолтное событие @see Event.
     */
    public function trigger($name, Event $event = null)
    {
        if (!empty($this->_events[$name])) {
            if ($event === null) {
                $event = new Event;
            }
            if ($event->sender === null) {
                $event->sender = $this;
            }
            $event->handled = false;
            $event->name = $name;
            foreach ($this->_events[$name] as $handler) {
                $event->data = $handler[1];
                call_user_func($handler[0], $event);
                // stop further handling if the event is handled
                if ($event->handled) {
                    return;
                }
            }
        }
        // invoke class-level attached handlers
        Event::trigger($this, $name, $event);
    }


	public static function getLocaleMonthName($m, $subjective = true) {
		$monthes = [
			  [ 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря' ],
			  [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ]
		];

		return $monthes[ (int)$subjective ][ ( (int)$m ) - 1 ];
	}

}