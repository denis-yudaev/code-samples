<?php


namespace odtphpgenerator;

use App\common\component\ArrayHelper as AH;


/**
 * Class OdtSpan XML тэг <text:span>
 */
class OdtSpan
{
    /** @var array $childList массив дочерних элементов текстового узла. Может содержать строки, или другие элементы <SPAN>... */
    protected $childList;
    /** @var string $styleName */
    protected $styleName;

    protected $tagName;


    /**
     * OdtSpan - конструктор объекта.
     * @param mixed $children                 список дочерних элементов тэга <SPAN>. Может быть опущен, или быть равным пустому значению, если,
     *                                        например, необходимо создать комплексный элемент параграфа (с дочерними элементами типа <SPAN> итд.),
     *                                        последовательно добавляя его потомков.
     * @param OdtStyleText|string $style      объект стиля параграфов, или название стиля
     */
    public function __construct($children = null, $style = null) {
        $this->setChildList($children);
        $this->initStyle($style);
        $this->tagName = 'text:span';
    }


    public function getContent(Odt $odt, \DOMDocument $dom){
        $element = $dom->createElement($this->tagName);
        $childList = $this->childList;
        $styleName = $this->styleName;

        if(!empty($childList))
        {
            foreach($childList as $child)
            {
	            if( $child || $child === '0' || $child === 0 ){
                    $node = is_object($child)? $child->getContent($odt, $dom) : $dom->createTextNode((string) $child);
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


    /** @param OdtStyleText|string $style объект стиля параграфов, или название стиля.
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
 * Class OdtParagraph XML тэг <text:p>
 */
class OdtParagraph extends OdtSpan
{
	/**
	 * @param array $children массив дочерних элементов параграфа. Может содержать строки, или объекты некоторых текстовых элементов, типа <SPAN>...
	 * @param null|string|OdtStyleParagraph $style
	 */

    public function __construct($children = null, $style = null){
        parent::__construct($children, $style);

        $this->tagName = 'text:p';
    }

    public function addLineBreak( ){
        $this->childList[] = new OdtTextElement('lineBreak');

        return $this;
    }

    public function addTab( ){
        $this->childList[] = new OdtTextElement('tab');

        return $this;
    }


    public function addSpace( $count = 1 ){
        $this->childList[] = new OdtTextElement('space', [ 'count' => $count ]);

        return $this;
    }

}


/**
 * Class OdtHeading XML тэг <text:h>
 * Небольшой беспорядок - надо будет разобраться...
 */
class OdtHeading extends OdtParagraph
{
    /** @var array $childList массив дочерних элементов заголовка. Может содержать строки, или объекты некоторых текстовых элементов, типа <SPAN>... */
    /** @var string $styleName */

    private $outlineLevel; // int

    private $restartNumbering; // true, false in string

    private $startValue; // int

    private $isListHeader; // true, false in string
    ///**
    // * odtHeading - конструктор объекта.
    // * @param mixed $children                 список дочерних элементов тэга <text:h>. Может быть опущен, или быть равным пустому значению, если, например, необходимо
    // *                                        создать комплексный элемент параграфа (с дочерними элементами типа <text:span> итд.), последовательно добавляя его потомков.
    // * @param odtStyleParagraph|string $style объект стиля параграфов, или название стиля
    // */
    public function __construct($children = null, $style = null){
        parent::__construct($children, $style);

        $this->tagName = 'text:h';

        $this->outlineLevel = 1;
        $this->restartNumbering = false;
        $this->startValue = false;
        $this->isListHeader = false;
    }


    /** @param string $outlineLevel */
    public function setOutlineLevel($outlineLevel){
        $this->outlineLevel = $outlineLevel;
    }


    /** @param boolean $restartNumbering */
    public function setRestartNumbering($restartNumbering){
        $this->restartNumbering = $restartNumbering;
    }


    /** @param boolean $startValue */
    public function setStartValue($startValue){
        $this->startValue = $startValue;
    }


    /** @param boolean $isListHeader */
    public function setIsListHeader($isListHeader){
        $this->isListHeader = $isListHeader;
    }


    public function getContent(Odt $odt, \DOMDocument $dom){
        $element = parent::getContent($odt, $dom);

        $element->setAttribute('text:outline-level', $this->outlineLevel ?: 1);

        if($this->restartNumbering) {
            $element->setAttribute('text:restart-numbering',    $this->restartNumbering);
        }

        if($this->startValue) {
            $element->setAttribute('text:start-value', $this->startValue);
        }

        if($this->isListHeader) {
            $element->setAttribute('text:is-list-header', $this->isListHeader);
        }

        return $element;
    }

}


/**
 * Class OdtTextElement тэг-генератор простых элементов ODF текстового происхождения, таких как: <text:lineBreak>, <text:tab>, <text:space>, и т.д.
 */
class OdtTextElement
{
    protected $tagName;
    protected $attributes;


    /**
     * odtTextElement конструктор.
     * @param string $name имя элемента
     * @param array $params параметры элемента
     */
    public function     __construct($name, array $params = []) {
        $this->attributes = [];

        switch($name)
        {
            //  разрыв строки (напр. абзаца)
            case 'lineBreak':
	                $this->tagName = 'text:line-break';
                break;

            //  табуляция
            case 'tab':
                $this->tagName = 'text:tab';
                break;

            //  пробел (можно указать необходимое количество символов)
            case 'space':
                $this->tagName = 'text:s';
                $this->attributes['text:c'] = empty($params['count'])? 1 : $params['count'];
                break;

            //  перенос на следующую страницу
            case 'softPageBreak':
                $this->tagName = 'text:soft-page-break';
                break;

            //  номер страницы
	        case 'pageNumber':
	            //   commonly:  <text:page-number text:select-page="current" />
                $this->tagName = 'text:page-number';
                $this->attributes['text:select-page'] = empty($params['page'])? 'current' : $params['page']; // previous, current, next
                $this->attributes['text:page-adjust'] = empty($params['adjust'])? null : $params['adjust']; // integer
                $this->attributes['style:num-format'] = empty($params['style'])? null : $params['style']; // number style name
                /* Example: Displaying the current page number on all pages except the first page:
                    <text:page-number text:select-page="previous" text:page-adjust="1" style:num-format="1" /> */
                break;

            //  выражение
            case 'expression':
                $this->tagName = 'text:expression';
                $this->attributes['text:formula'] = empty($params['formula'])? null : $params['formula']; // previous, current, next
                $this->attributes['office:value-type'] = empty($params['valueType'])? null : $params['valueType']; // integer
                $this->attributes['style:data-style-name'] = empty($params['dataStyleName'])? null : $params['dataStyleName']; // number style name
                $this->attributes['office:value'] = empty($params['value'])? null : $params['value']; // number style name
                /* Example:
                    <text:expression text:formula="ooow:of:=" office:value-type="float" office:value="0" style:data-style-name="N0"/> */
                break;

            //  источник контента текстовой области (только внутри text:section)
            case 'sectionSource':
                $this->tagName = 'text:section-source';
                $this->attributes['xlink:href'] = empty($params['xlinkHref'])? null : $params['xlinkHref']; // previous, current, next
                /* Example:
					<text:section-source xlink:href="../../c:/access20/kformp/name.txt"/> */
                break;
            default:
                $this->tagName = 'text:text';
                break;
        }
    }


    public function getContent(Odt $odt, \DOMDocument $dom)
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


/**
 * Class odtTextSection XML тэг <text:section> область документа, определяющая общие правила отображения для входящих в неё параграфов и других
 * текстовых элементов, задающая определённым областям документа отдельные стили. Может быть использована для формирования текстовых колонок, областей
 * текста только для чтения, или скрытого текста. Текстовые секции могут быть использованы для оформления заметок, областей документа с отличным
 * цветом фона и т.д.
 */
class OdtTextSection extends OdtSpan
{
	//  уникальное имя области
	protected $name;

	//  защищает область от возможности редактирования
	protected $protected;

	//  режим отображения
	protected $display;

	//  источник контента секции
	protected $sectionSource;


	/**
	 * OdtTextSection - конструктор объекта.
	 * @param string              $name
	 * @param mixed               $children список дочерних элементов тэга <SECTION>. Может быть опущен, или быть равным пустому значению, если,
	 *                                      например, необходимо создать комплексный элемент области с дочерними элементами различных текстовых типов.
	 * @param OdtStyleText|string $style    объект стиля секции, или его имя (атрибут style:name)
	 */
	public function __construct($name, $children = null, $style = null) {
		parent::__construct($children, $style);

		$this->tagName = 'text:section';
		$this->name = $name;

		$this->protected = false; //  "true"/"false"
		$this->display = false;
		$this->sectionSource = false;
	}


	public function getContent(Odt $odt, \DOMDocument $dom) {
		$section = parent::getContent($odt, $dom);

		$section->setAttribute( 'text:name', $this->name );

		if($this->protected) {
			$section->setAttribute('text:protected',    $this->protected);
		}

		if($this->display) {
			$section->setAttribute('text:display', $this->display);
		}

		if( $this->sectionSource && is_array( $this->sectionSource ) ) {
			$sectionSource = new OdtTextElement( 'sectionSource', $this->sectionSource );
			$section->appendChild( $sectionSource->getContent($odt, $dom) );
		}

		return $section;
	}


	public function getName(){
		return $this->name;
	}

	public function setProtected($protected) {
		$this->protected = $protected;
	}
	public function setDisplay($display) {
		$this->display = $display;
	}
	public function setSectionSource($sectionSource) {
		$this->sectionSource = $sectionSource;
	}

}