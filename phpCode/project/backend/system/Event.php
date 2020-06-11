<?php

/**
 * Пространство имён класса
 */
namespace App\project\system;

/**
 * Class Event Базовый класс событий
 *
 * @package App\project\system
 */
class Event extends Object
{
    /**
     * @var string имя события. Через имя происходит управление событиями.
     */
    public $name;
    /**
     * @var object отправитель события. Если не указан явно, то отправителем будет считаться объект, запустивший событие через метод "trigger()".
     * Это значение также может быть равно null, если было вызвано, например из статического окружения (пример - события классов).
     */
    public $sender;
    /**
     * @var boolean обработано ли событие? По-умолчанию - false.
     * Когда обработчик устанавливает это св-во в true, дальнейшая обработка этого события прекращается.
     *
     */
    public $handled = false;
    /**
     * @var mixed данные, переданные в [[Component::on()]] во время установки обработчика...
     */
    public $data;

    private static $_events = [];


    /**
     * Добавляет событие класса.
     *
     * Классовое событие вызывает отработку всех созданных для данного и родительских классов обработчиков.
     *
     * Например, так устанавливался бы обработчик события 'render' на класс `Import`:
     *
     * ~~~
     * Event::on(get_class(Import), Import::EVENT_RENDER, function ($event) {
     *     echo 'Сработало событие ' . $event->name . ' класса ' . get_class(Import) . '!';
     * });
     * ~~~
     *
     *
     * @param string $class уточнённое имя класса, для которого необходимо объявить новый обработчик событий.
     * @param string $name имя события.
     * @param callable $handler обработчик событий.
     * @param mixed $data данные, которые будут переданы в обработчик с объектом события в момент его срабатывания.
     * получить эти данные можно обратившись к свойству [[Event::data]].
     * @param boolean $append установить ли обработчик в конец очереди обработчиков этого события. В случае отрицательного значения,
     * обработчик будет поставлен в начало цепочки обработки вызова данного события..
     * handler list.
     * @see off()
     */
    public static function on($class, $name, $handler, $data = null, $append = true)
    {
        $class = ltrim($class, '\\');
        if ($append || empty(self::$_events[$name][$class])) {
            self::$_events[$name][$class][] = [$handler, $data];
        } else {
            array_unshift(self::$_events[$name][$class], [$handler, $data]);
        }
    }

    /**
     * Снимает с класса обработчик событий.
     *
     * Метод обратный методу [[on()]].
     *
     * @param string $class уточнённое имя класса, для которого необходимо деактивировать существующий обработчик.
     * @param string $name имя целевого события
     * @param callable $handler обработчик, который необходимо деактивировать...
     * Если значение пусто - снимаются все обработчики относящиеся к данному событию.
     *
     * @return boolean был ли найден и снят указанный обработчик...
     * @see on()
     */
    public static function off($class, $name, $handler = null)
    {
        $class = ltrim($class, '\\');
        if (empty(self::$_events[$name][$class])) {
            return false;
        }
        if ($handler === null) {
            unset(self::$_events[$name][$class]);
            return true;
        } else {
            $removed = false;
            foreach (self::$_events[$name][$class] as $i => $event) {
                if ($event[0] === $handler) {
                    unset(self::$_events[$name][$class][$i]);
                    $removed = true;
                }
            }
            if ($removed) {
                self::$_events[$name][$class] = array_values(self::$_events[$name][$class]);
            }

            return $removed;
        }
    }

    /**
     * Признак наличия обработчиков для событий под указанным именем. Данный метод также проверяет родительские классы на наличие обработчиков.
     *
     * @param string|object $class экземпляр объекта, или уточнённое имя класса.
     * @param string $name имя события.
     * @return boolean присутствует ли хотя бы один обработчик для данного события?..
     */
    public static function hasHandlers($class, $name)
    {
        if (empty(self::$_events[$name])) {
            return false;
        }
        if (is_object($class)) {
            $class = get_class($class);
        } else {
            $class = ltrim($class, '\\');
        }
        do {
            if (!empty(self::$_events[$name][$class])) {
                return true;
            }
        } while (($class = get_parent_class($class)) !== false);

        return false;
    }

    /**
     * Запускает событие класса.
     *
     * @param string|object $class экземпляр объекта, или уточнённое имя класса, относящееся к вызываемому классовому событию.
     * @param string $name имя.
     * @param Event $event параметр объекта события. Если пустое значение - будет создан стандартный объект Event'а.
     */
    public static function trigger($class, $name, $event = null)
    {
        if (empty(self::$_events[$name])) {
            return;
        }
        if ($event === null) {
            $event = new static;
        }
        $event->handled = false;
        $event->name = $name;

        if (is_object($class)) {
            if ($event->sender === null) {
                $event->sender = $class;
            }
            $class = get_class($class);
        } else {
            $class = ltrim($class, '\\');
        }
        do {
            if (!empty(self::$_events[$name][$class])) {
                foreach (self::$_events[$name][$class] as $handler) {
                    $event->data = $handler[1];
                    call_user_func($handler[0], $event);
                    if ($event->handled) {
                        return;
                    }
                }
            }
        } while (($class = get_parent_class($class)) !== false);
    }
}
