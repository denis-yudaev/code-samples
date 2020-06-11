<?php

/**
 * Пространство имён класса
 */
namespace App\project\system;

/**
 * Trait ComponentTrait Трейт, предоставляющий классу функционал @see Component'а.
 * Описание методов/свойств можно найти там же в @see Component'е, возможности которого он по-сути дублирует.
 *
 * @package App\project\system
 */
trait ComponentTrait
{
    private $_events = [];


    public function __clone()
    {
        $this->_events = [];
    }


    public function hasEventHandlers($name)
    {
        return !empty($this->_events[$name]) || Event::hasHandlers($this, $name);
    }


    public function on($name, $handler, $data = null, $append = true)
    {
        if ($append || empty($this->_events[$name])) {
            $this->_events[$name][] = [$handler, $data];
        } else {
            array_unshift($this->_events[$name], [$handler, $data]);
        }
    }


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
                if ($event->handled) {
                    return;
                }
            }
        }
        Event::trigger($this, $name, $event);
    }


}