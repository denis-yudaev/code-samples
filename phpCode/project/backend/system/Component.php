<?php

/**
 * Пространство имён класса
 */
namespace App\project\system;

/**
 * Класс компонента предоставляет основные инструменты расширения имеющихся у объектов возможностей,
 * и некоторые, облегчающие жизнь фичи, типа @see Event'ов...
 *
 * TODO: описать
 */
class Component extends Object
{
    /**
     * @var array назначенные обработчики событий (имя => обработчики)
     */
    private $_events = [];


    /**
     * Магический метод, сбрасывающий обработчики событий при клонировании компонента
     */
    public function __clone()
    {
        $this->_events = [];
    }

    /**
     * Признак наличия хотя бы одного обработчика для указанного события.
     * @param string $name имя события, об обработчиках которого необходимо получить информацию...
     * @return boolean результат проверки
     */
    public function hasEventHandlers($name)
    {
        return !empty($this->_events[$name]) || Event::hasHandlers($this, $name);
    }

    /**
     * Устанавливает обработчик события.
     *
     * Обработчиком должен быть валидный callback, возвращающий true при проверке @see is_callable(), например:
     *
     * ~~~
     * // 1. Анонимная ф-я:
     * function ($event) { ... }
     * // 2. $object->handleEvent():
     * [ $object, 'handleEvent' ]
     * // 3. Page::handleEvent():
     * [ 'Page', 'handleEvent' ]
     * // 4. глобальная функция handleEvent():
     * 'handleEvent'
     * ~~~
     *
     * Обработчик определяется с одним аргументом:
     *
     * ~~~
     * function ($event)
     * ~~~
     *
     * где `$event` объект класса [[Event]]
     *
     * @param string $name имя события
     * @param callable $handler обработчик для данного события
     * @param mixed $data данные, которые будут переданы в обработчик с объектом события в момент его срабатывания.
     * получить эти данные можно обратившись к свойству [[Event::data]].
     * @param boolean $append установить ли обработчик в конец очереди обработчиков этого события. В случае отрицательного значения,
     * обработчик будет поставлен в начало цепочки обработки вызова данного события..
     * @see off()
     */
    public function on($name, $handler, $data = null, $append = true)
    {
        if ($append || empty($this->_events[$name])) {
            $this->_events[$name][] = [$handler, $data];
        } else {
            array_unshift($this->_events[$name], [$handler, $data]);
        }
    }

    /**
     * Удаляет существующие обработчики с события под указанным именем.
     * Метод обратный методу [[on()]].
     * @param string $name имя целевого события
     * @param callable $handler обработчик, который необходимо деактивировать...
     * Если значение пусто - снимаются все обработчики относящиеся к данному событию.
     *
     * @return boolean был ли найден и снят указанный обработчик...
     * @see on()
     */
    public function off($name, $handler = null)
    {
        if (empty($this->_events[$name])) {
            return false;
        }
        if ($handler === null) {
            unset($this->_events[$name]);
            return true;
        } else {
            $removed = false;
            foreach ($this->_events[$name] as $i => $event) {
                if ($event[0] === $handler) {
                    unset($this->_events[$name][$i]);
                    $removed = true;
                }
            }
            if ($removed) {
                $this->_events[$name] = array_values($this->_events[$name]);
            }
            return $removed;
        }
    }

    /**
     * Запускает событие.
     * Этот метод вызывает все обработчики указанного события, в том числе классовые.
     * @param string $name имя события
     * @param Event $event параметр с экземпляром события [[Event]], или другого дочернего класса.
     */
    public function trigger($name, Event $event = null)
    {
        if (!empty($this->_events[$name])) {
            if ($event === null) {
                $event = new Event();
            }
            if ($event->sender === null) {
                $event->sender = $this;
            }
            $event->handled = false;
            $event->name = $name;
            foreach ($this->_events[$name] as $handler) {
                $event->data = $handler[1];
                call_user_func($handler[0], $event);
                // если уже обработано - прекращаем выполнение
                if ($event->handled) {
                    return;
                }
            }
        }
        // запускаем имеющиеся обработчики событий класса
        Event::trigger($this, $name, $event);
    }

}
