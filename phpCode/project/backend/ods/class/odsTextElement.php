<?php
namespace odsgen;

use App\common\component\ArrayHelper as AH;


/**
 * Class odsSpan XML тэг <text:span>
 */
class odsSpan
{
	/** @var array $childList массив дочерних элементов текстового узла. Может содержать строки, или другие элементы <SPAN>... */
	protected $childList;
	/** @var string $styleName */
	protected $styleName;

	protected $tagName;


	/**
	 * odsSpan - конструктор объекта.
	 * @param mixed $children                 список дочерних элементов тэга <SPAN>. Может быть опущен, или быть равным пустому значению, если,
	 *                                        например, необходимо
	 *                                        создать комплексный элемент параграфа (с дочерними элементами типа <SPAN> итд.), последовательно добавляя его потомков.
	 * @param odsStyleText|string $style      объект стиля параграфов, или название стиля
	 */
	public function __construct($children = null, $style = null) {
		$this->setChildList($children);
		$this->initStyle($style);
		$this->tagName = 'text:span';
	}


	public function getContent(ods $ods, \DOMDocument $dom){
		$element = $dom->createElement($this->tagName);
		$childList = $this->childList;
		$styleName = $this->styleName;

		if(!empty($childList))
		{
			foreach($childList as $child)
			{
				if( $child || $child === '0' || $child === 0 ){
					$node = is_object($child)? $child->getContent($ods, $dom) : $dom->createTextNode((string) $child);
					$element->appendChild($node);
				}
			}
		}

		if($styleName)
		{
			if(is_array($styleName)) {
				/**  @important  к сожалению libreOffice не поддерживает эту часть стандарта (тэг text:class-names игнорируется)
				 */// TODO: удалить функционал, реализующий поддержку тэга 'text:class-names' и обработку свойства self::styleName как массива...

				$element->setAttribute('text:class-names', implode(' ', $styleName));
			}
			elseif(is_string($styleName)) {
				$element->setAttribute('text:style-name', $styleName);
			}
		}

		return $element;
	}


	public function setStyle($style){
		$this->styleName = $this->parseStyleName( $style );

		return $this;
	}


	public function setChildList($children){
		if(empty($children) && $children !== 0 && $children !== '0'){
			$this->childList = [];
		} else{
			$this->childList = is_array($children)? $children : [ $children ];
		}
	}


	public function addChild($children){
		AH::loopWith($children, [ $this, 'toChildList' ]);

		return $this;
	}


	protected function initStyle($style, $default = false)
	{
		if(empty($style)) {
			$this->styleName = $default;
		} else {
			if( is_array( $style ) ) {
				foreach($style as $i => $obj) {
					$style[$i] = $this->parseStyleName( $obj );
				}
			}

			$this->setStyle( $style );
		}
	}


	/** @param odsStyleText|string $style объект стиля параграфов, или название стиля.
	 * @return string название класса стилей
	 */
	private function parseStyleName($style) {
		return is_object($style) ?  $style->getName() : $style;
	}


	public function toChildList($item){
		$this->childList[] = $item;
	}

}


/**
 * Class odsParagraph XML тэг <text:p>
 */
class odsParagraph extends odsSpan
{
	/**
	 * odsSpan - конструктор объекта.
	 * @param mixed $children массив дочерних элементов параграфа. Может содержать строки, или объекты некоторых текстовых элементов...
	 * @param odsStyleText|string $style    объект стиля параграфов, или название стиля
	 */
	public function __construct($children = null, $style = null){
		parent::__construct($children, $style);

		$this->tagName = 'text:p';
	}

	public function addLineBreak( ){
		$this->childList[] = new odsTextElement('lineBreak');

		return $this;
	}

	public function addTab( ){
		$this->childList[] = new odsTextElement('tab');

		return $this;
	}


	public function addSpace( $count = 1 ){
		$this->childList[] = new odsTextElement('space', [ 'count' => $count ]);

		return $this;
	}

}


class odsTextElement
{
	protected $tagName;
	protected $attributes;

	//                                        <text:page-number text:select-page="current" />
	/**
	 * odsTextElement конструктор.
	 * @param string $name имя элемента
	 * @param array $params параметры элемента
	 */
	public function __construct($name, array $params = []) {
		$this->attributes = [];

		switch($name)
		{
			//  разрыв строки (напр. абзаца)
			case 'lineBreak':
				$this->tagName = 'text:line-break';
				break;

			//  TODO: не знаю - работает в таблицах, нет?..
			//  табуляция
			// case 'tab':
			// 	$this->tagName = 'text:tab';
			// 	break;

			//  пробел (можно указать необходимое количество символов)
			case 'space':
				$this->tagName = 'text:s';
				$this->attributes['text:c'] = empty($params['count'])? 1 : $params['count'];
				break;

			//  TODO: не знаю - работает в таблицах, нет?..
			//  перенос на следующую страницу
			// case 'softPageBreak':
			// 	$this->tagName = 'text:soft-page-break';
			// 	break;

			//  номер страницы
			case 'pageNumber':
				$this->tagName = 'text:page-number';
				$this->attributes['text:select-page'] = empty($params['page'])? 'current' : $params['page']; // previous, current, next
				$this->attributes['text:page-adjust'] = empty($params['adjust'])? null : $params['adjust']; // integer
				$this->attributes['style:num-format'] = empty($params['style'])? null : $params['style']; // number style name
				/* Example: Displaying the current page number on all pages except the first page:
					<text:page-number text:select-page="previous" text:page-adjust="1" style:num-format="1" /> */
				break;

			default:
				$this->tagName = 'text:text';
				break;
		}
	}


	public function getContent(ods $ods, \DOMDocument $dom)
	{
		$el = $dom->createElement($this->tagName);

		if( count($this->attributes) )
		{
			foreach($this->attributes as $name => $value) {
				if( $value ) {
					$el->setAttribute($name, $value);
				}
			}
		}

		return $el;
	}

}