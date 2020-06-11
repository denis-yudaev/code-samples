<?php

/**
 * @file
 *  Вспомогательный класс для работы с массивами
 */
namespace App\common\component;

use App\common\system\Exception;

/**
 * Class ArrayHelper Вспомогательный класс для работы с массивами
 *
 * @package App\common\component
 */
class ArrayHelper
{
    /**
     * Возвращает значения указанного строкового индекса массива или имени свойства объекта.
     * Если указанный ключ отсутствует, возвращает дефолтное значение.
     *
     * Можно передавать ключи через точку, чтобы получить значение вложенного массива или объекта,
     * тоесть, если передан ключ `x.y.z`, то возвращаться к нам будет `$array['x']['y']['z']`
     * или `$array->x->y->z`, если $array - объект.
     *
     * Немного примеров:
     *
     * ~~~
     * // массив
     * $username = ArrayHelper::getValue($_POST, 'username');
     * // объект
     * $username = ArrayHelper::getValue($user, 'username');
     * // функция анонимуса
     * $fullName = ArrayHelper::getValue($user, function ($user, $defaultValue) {
     *     return $user->firstName . ' ' . $user->lastName;
     * });
     * // пробуем "точечный" формат
     * $street = ArrayHelper::getValue($users, 'address.street');
     * // юзаем массив ключей
     * $value = ArrayHelper::getValue($versions, ['1.0', 'date']);
     * ~~~
     *
     * @param array|object $obj массив или объект
     * @param string|array|\Closure $key ключ, массив ключей, или ф-я анонимуса. Ф-я должна иметь вид: `function($array, $default)`.
     * @param mixed $default дефолтное значение, возвращаемое в случае отсутствия переданного ключа. Не работает с объектами.
     * @return mixed значение элемента или дефолт.
     */
    public static function getValue($obj, $key, $default = null)
    {
        if ($key instanceof \Closure) {
            return $key($obj, $default);
        }

        if (is_array($key)) {
            $lastKey = array_pop($key);
            foreach ($key as $keyPart) {
                $obj = self::getValue($obj, $keyPart);
            }
            $key = $lastKey;
        }

        if (is_array($obj) && array_key_exists($key, $obj)) {
            return $obj[$key];
        }

        if (($pos = strrpos($key, '.')) !== false) {
            $obj = self::getValue($obj, substr($key, 0, $pos), $default);
            $key = substr($key, $pos + 1);
        }

        if (is_object($obj)) {
            return property_exists($obj, $key) ? $obj->$key : $default;
        } elseif (is_array($obj)) {
            return array_key_exists($key, $obj) ? $obj[$key] : $default;
        } else {
            return $default;
        }
    }


    /**
     * Рекурсивно объединяет два массива в один.
     * Если массивы содержат элементы с одинаковыми строковыми индексами,
     * то элемент второго массива заменит элемент первого (в этом отличие
     * от стандартной ф-и "array_merge_recursive"). Вложенные массивы
     * с равными строковыми индексами будут рекурсивно объединены
     * по тому-же принципу, а элементы с числовыми индексами будут
     * перенесены из второго массива в первый.
     *
     * @param array $former базовый массив, в который войдут элементы последующих массивов
     * @param array $latter массив для слияния с первым. Можно передавать сколько-угодно
     * массивов для слияния с предшествующим третим, четвёртым, пятым параметром, и т.д.
     *
     * @return array результат объединения переданных массивов. Исходный массив
     * остаётся без изменений.
     */
    public static function merge(array $former, array $latter)
    {
        $args = func_get_args();
        $res = array_shift($args);
        while (!empty($args)) {
            $next = array_shift($args);
            foreach ($next as $k => $v) {
                if (is_int($k)) {
                    if (isset($res[$k])) {
                        $res[] = $v;
                    } else {
                        $res[$k] = $v;
                    }
                } elseif (is_array($v) && isset($res[$k]) && is_array($res[$k])) {
                    $res[$k] = self::merge($res[$k], $v);
                } else {
                    $res[$k] = $v;
                }
            }
        }

        return $res;
    }


    /**
     * Индексирует массив по переданному ключу.
     * Работает с вложенными ассоциативными массивами и массивами объектов.
     *
     * Передаваемый ключ должен быть либо строковым индексом ассоциативного массива, либо именем свойства объекта, либо анонимной функцией, возвращающей строковой индекс.
     *
     * Если искомое значение равно null, элемент массива будет пропущен и не войдёт в результат.
     *
     * Примеры:
     *
     * ~~~
     * $array = [
     *     ['id' => '123', 'data' => 'abc'],
     *     ['id' => '345', 'data' => 'def'],
     * ];
     * $result = ArrayHelper::index($array, 'id');
     * // Результатом будет:
     * // [
     * //     '123' => ['id' => '123', 'data' => 'abc'],
     * //     '345' => ['id' => '345', 'data' => 'def'],
     * // ]
     *
     * // вариант с ф-ей анонимуса
     * $result = ArrayHelper::index($array, function ($element) {
     *     return $element['id'];
     * });
     * ~~~
     *
     * @param array $array массив, который необходимо проиндексировать
     * @param string $key строка или анон. функция, которая будет использована для поиска значений с соответствующими индексами
     * @return array проиндексированный массив
     */
    public static function index(array $array, $key)
    {
        $result = array();
        foreach ($array as $element) {
            $value = self::getValue($element, $key);
            $result[$value] = $element;
        }

        return $result;
    }


    /**
     * Возвращает значение столбца массива/объекта (массив должен быть ассоциативным)
     *
     * Пример:
     *
     * ~~~
     * $array = [
     *     ['id' => '123', 'data' => 'abc'],
     *     ['id' => '345', 'data' => 'def'],
     * ];
     * $result = ArrayHelper::getColumn($array, 'id');
     * // результат: ['123', '345']
     *
     * // ф-я анонимуса
     * // юзаем анонимуса
     * $result = ArrayHelper::getColumn($array, function ($element) {
     *     return $element['id'];
     * });
     * ~~~
     *
     * @param array $array
     * @param string $name название (строковой указатель) целевого столбца
     * @param boolean $keepKeys сохранять ключи, или нет. В последнем случае ключи массива будут заново заполнены числовыми индексами.
     * @return array массив со значениями указанного столбца
     */
    public static function getColumn(array $array, $name, $keepKeys = true)
    {
        $result = array();
        if ($keepKeys) {
            foreach ($array as $k => $element) {
                $result[$k] = self::getValue($element, $name);
            }
        } else {
            foreach ($array as $element) {
                $result[] = self::getValue($element, $name);
            }
        }

        return $result;
    }

    /**
     * Сортировка объектов, либо массивов с аналогичной структурой по одному полю, нескольким, или с помощью ф-и анонимуса.
     * @param array $array Массив для сортировки. После применения метода, исходный массив будет изменен.
     * @param string|array $key ключ(и) дочерних массивов или имена свойств объектов, по которому(ым) будет производиться сортировка.
     * При передаче анонимной ф-и, убедитесь, что она возвращает какое-либо значение - по ним и будет происходить сравнение для сортировки.
     * Ф-я должна иметь вид: `function($item)`
     * @param integer|array $direction направление сортировки. Варианты: `SORT_ASC`, `SORT_DESC`.
     * Если используете массив ключей - можете передавать и массив значений направления сортировки.
     * @param integer|array $sortFlag все вопросы к PHP. Сортировочный "флаг". Возможные варианты:
     * `SORT_REGULAR`, `SORT_NUMERIC`, `SORT_STRING`, `SORT_LOCALE_STRING`, `SORT_NATURAL` и `SORT_FLAG_CASE`.
     * Последний - самый непонятный. Если сомневаетесь, пхпшный мануал Вам в руки: http://php.net/manual/en/function.sort.php
     */
    public static function multisort(array &$array, $key, $direction = SORT_ASC, $sortFlag = SORT_REGULAR)
    {
        $keys = is_array($key) ? $key : array($key);
        if (empty($keys) || empty($array)) {
            return;
        }
        $n = count($keys);
        if (is_scalar($direction)) {
            $direction = array_fill(0, $n, $direction);
        } elseif (count($direction) !== $n) {
            throw new Exception('Кол-во $direction должно совпадать с кол-вом $keys.');
        }
        if (is_scalar($sortFlag)) {
            $sortFlag = array_fill(0, $n, $sortFlag);
        } elseif (count($sortFlag) !== $n) {
            throw new Exception('Кол-во $sortFlag должно совпадать с кол-вом $keys.');
        }
        $args = array();
        foreach ($keys as $i => $key) {
            $flag = $sortFlag[$i];
            $args[] = self::getColumn($array, $key);
            $args[] = $direction[$i];
            $args[] = $flag;
        }
        $args[] = &$array;
        call_user_func_array('array_multisort', $args);
    }


    /**
     * Трансформирует объект или массив объектов в многомерный ассоциативный массив.
     * @param object|array $obj объект, который нужно трансформировать в массив.
     * @param array $props карта классов и соответствующих им свойств, которые необходимо перенести в выходной массив.
     * Свойства перечисляются для каждого класса, как массив, следующего формата:
     *
     * ~~~
     * [
     *     'app\smpath\ObjectBaseClassName' => [
     *         //  можно просто перечислять названия свойств:
     *         'id',
     *         'name',
     *         //  можно использовать формат: 'нужныйСтроковойИндекс' => 'имяСвойства':
     *         'createTime' => 'created_at',
     *         //  можно возвращать: 'нужныйСтроковойИндекс' => результат_выполнения_анонимной_функции:
     *         'price' => function ($object) {
     *             return number_format( $object->price, 2, ',', ' ' ) . ' тыс. руб.';
     *         }
     *     ],
     * ]
     * ~~~
     *
     * Результат выполнения ArrayHelper::toArray($object, $props); будет примерно таким:
     *
     * ~~~
     * [
     *     'id' => 123,
     *     'title' => 'test',
     *     'createTime' => '2013-01-01 12:00AM',
     *     'length' => 301,
     * ]
     * ~~~
     *
     * @param boolean $recursive - трансформировать ли объекты, представленные значениями свойств родительских объектов/массивов.
     * @return array массив с результатами трансформации
     */
    public static function toArray($obj, array $props = array(), $recursive = true)
    {
        if (is_array($obj)) {
            if ($recursive) {
                foreach ($obj as $key => $value) {
                    if (is_array($value) || is_object($value)) {
                        $obj[$key] = self::toArray($value, $props, true);
                    }
                }
            }
            return $obj;
        } elseif (is_object($obj)) {
            if (!empty($props)) {
                $className = get_class($obj);
                if (!empty($props[$className])) {
                    $result = array();
                    foreach ($props[$className] as $key => $name) {
                        if (is_int($key)) {
                            $result[$name] = $obj->$name;
                        } else {
                            $result[$key] = self::getValue($obj, $name);
                        }
                    }

                    return $recursive ? self::toArray($result, $props) : $result;
                }
            }
            $result = array();
            foreach ($obj as $key => $value) {
                $result[$key] = $value;
            }

            return $recursive ? self::toArray($result) : $result;
        } else {
            return array($obj);
        }
    }


    /**
     * Удаляет указанный элемент из массива и возвращает его значение. Если указанный индекс в массиве отсутствует,
     * будет возвращено дефолтное значение ($default).
     *
     * Пример:
     *
     * ~~~
     * // $list = [ 'type' => 'A', 'options' => [1, 2] ];
     * // работаем с массивом:
     * $type = ArrayHelper::remove($list, 'type');
     * // новые значения:
     * // $type === 'A';
     * // $list === [ 'options' => [1, 2] ];
     * ~~~
     *
     * @param array $array массив, из которого будем извлекать значение.
     * @param string $key индекс элемента, который необходимо извлечь.
     * @param mixed $default дефолтное значение, возвращаемое в случае отсутствия в массиве указанного ключа .
     *
     *@return mixed|null значение удалённого элемента, или переданный дефолт, в случае отсутствия такового.
     */
    public static function remove(array &$array, $key, $default = null)
    {
        if (is_array($array) && (isset($array[$key]) || array_key_exists($key, $array))) {
            $value = $array[$key];
            unset($array[$key]);

            return $value;
        }

        return $default;
    }


    /**
     * Создаёт мэппинг пар ключ->значение элементов асоцциативного массива, или свойств объекта.
     * Значения `$key` и `$val` будут использоваться в качестве ключа/значения для нового мэппинга.
     * Можно указать необязательный атрибут `$group`, если требуется группировка значений.
     *
     * Пример:
     *
     * ~~~
     * $list = [
     *     ['id' => '123', 'name' => 'aaa', 'class' => 'x'],
     *     ['id' => '124', 'name' => 'bbb', 'class' => 'x'],
     *     ['id' => '345', 'name' => 'ccc', 'class' => 'y'],
     * ];
     *
     * $result = ArrayHelper::map($list, 'id', 'name');
     * // Значение массива $result:
     * // [
     * //     '123' => 'aaa',
     * //     '124' => 'bbb',
     * //     '345' => 'ccc',
     * // ]
     *
     * $result = ArrayHelper::map($list, 'id', 'name', 'class');
     * // Значение массива $result:
     * // [
     * //     'x' => [
     * //         '123' => 'aaa',
     * //         '124' => 'bbb',
     * //     ],
     * //     'y' => [
     * //         '345' => 'ccc',
     * //     ],
     * // ]
     * ~~~
     *
     * @param array $list массив, карту значений которого необходимо получить
     * @param string $key значение, которое будет использоваться в качастве ключа мэппинга
     * @param string $val значение, которое будет использоваться в качастве значения нашей, т.н. "карты"
     * @param string $group значение для группировки (необязательное)
     * @return array построенный мэппинг
     */
    public static function map(array $list, $key, $val, $group = null)
    {
        $result = array();
        foreach ($list as $element) {
            $k = self::getValue($element, $key);
            $v = self::getValue($element, $val);
            if ($group !== null) {
                $result[self::getValue($element, $group)][$k] = $v;
            } else {
                $result[$k] = $v;
            }
        }

        return $result;
    }


	/**
	 *  Статический метод, позволяющий совершать переданное в $cb действие рекурсивно над значением параметра $args. В случае, если в качестве значения $args
	 * передан массив, метод вызывает новый цикл над каждым его элементом.
	 *
	 * @param mixed    $args элементы для обхода
	 * @param callable $cb   валидный объект типа callable
	 */
	public static function loopWith( $args, $cb ) {
		if( is_array( $args ) ) {
			if ( count( $args ) ) {
				foreach( $args as $arg ){
					self::loopWith( $arg, $cb );
				}
			}
		} else {
			$cb( $args );
		}
	}

}