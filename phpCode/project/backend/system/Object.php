<?php

/**
 * Пространство имёно класса
 */
namespace App\project\system;
use App\common\system\Exception;

/**
 * Class Object Базовый класс с минимальным набором необходимого функционала, от которого должны наследоваться остальные компоненты системы.
 *
 * @package App\project\system
 */
class Object
{

    /**
     * Возвращает уточнённое строковое представление класса данного объекта.
     *
     * @return string полное имя класса.
     */
    public static function className(){
        return get_called_class();
    }


    /**
     * Конструктор объекта. Пара реккомендаций для реализаций, наследующих от этого класса:
     * - последним параметром конструктора делайте конфигурационный массив (как $config в этом примере);
     * - в конце конструктора дочернего класса вызывайте родительскую имплементацию: parent::__construct( $config );
     *
     * @param array $config массив с параметрами конфигурации объекта.
     */
    public function __construct(array $config = [ ]){
        if( !empty( $config ) ) {
            foreach( $config as $name => $value ) {
                $this->$name = $value;
            }
        }
        $this->init();
    }


    /**
     *  Действия инициализирующие созданный объект.
     */
    public function init(){
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
        if( method_exists( $this, $getter ) ) {
            return $this->$getter();
        } else {
            throw new Exception( 'Указанное свойство не существует: ' . get_class( $this ) . '::' . $name );
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
        if( method_exists( $this, $setter ) ) {
            $this->$setter( $value );
        } else {
            throw new Exception( 'Попытка установить неизвестное свойство: ' . get_class( $this ) . '::' . $name );
        }
    }


}