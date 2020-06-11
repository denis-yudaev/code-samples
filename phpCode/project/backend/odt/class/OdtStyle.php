<?php
namespace odtphpgenerator;
use App\common\component\ArrayHelper as AH;


abstract class OdtStyle
{
	/**
	 * Статический метод, предназначенный для переопределения дефолтных значений строки таблицы при создании её экземпляра.
	 * @param mixed $defaults -  массив аттрибутов стиля строки, и их значений для установки по-умолчанию. Если передан false - все аттрибуты стиля
	 *                        в момент создания объекта зануляются.
	 */
	public static function setConstructorDefaultValues( $defaults = null ) {
		if( $defaults === false ) {
			self::$constructorDefaultValues = [];
		} elseif( is_array( $defaults ) && count( $defaults ) ) {
			self::$constructorDefaultValues = $defaults;
		}
	}

	/**
	 * @var array $constructorDefaultValues контейнер для хранения дефолтных значений инициализации объекта.
	 */
	protected static $constructorDefaultValues = [];

	/**
	 * @param string $attribute имя атрибута, значение которого необходимо получить
	 * @return mixed дефолтное значение атрибута
	 */
	protected static function getConstructorDefaultValue( $attribute ) {
		$defaults = self::$constructorDefaultValues;

		return AH::getValue( $defaults, $attribute, false );
	}

    protected $name;
    protected $family; // table-column, table-row, table, table-cell...
    protected $parentStyleName;     // false or string
	protected $dataStyleName;

	/** boolean,  @see OdtStyle::defineAsDefault()   */
	protected $isDefaultStyle;


	public function setDataStyleName($name) {
		$this->dataStyleName = is_object($name) ? $name->getName() : $name;

		return $this;
	}

	//  TODO: оставляю временно для совместимости. Использовать Utilities::camelize вместо этого метода!
    public static function camelize($string){
        return str_replace(' ', '', ucwords(preg_replace('/[^A-Za-z0-9]+/', ' ', $string)));
    }

	/**
     * Конструктор класса.
     * @param string $name название класса стилей
     * @param string $family семейство класса (см. документацию)
     */
	public function __construct($name, $family)
	{
		if( empty( $name ) ) {
			$name = $this->getType() . '-' . $this->randString();
		}

		$this->name = $name;
		$this->family = $family;
		$this->dataStyleName = false;
		$this->isDefaultStyle = false;
	}

	/**
     * @param Odt          $odt
     * @param \DOMDocument $dom
     *
     * @return \DOMElement
     */
    protected function getContent(Odt $odt, \DOMDocument $dom){
        $style_style = $dom->createElement( $this->isDefaultStyle ? 'style:default-style' : 'style:style' );

        // $style_style->setAttribute('style:name', $this->name);
        $style_style->setAttribute('style:family', $this->family);

        //  реализовано для поддержки дефолтных стилей
	    if( ! $this->isDefaultStyle ) {
		    $style_style->setAttribute('style:name', $this->name);
	    }
        if($this->parentStyleName) {
            $style_style->setAttribute('style:parent-style-name', $this->parentStyleName);
        }
	    if( $this->dataStyleName ) {
		    $style_style->setAttribute( 'style:data-style-name', $this->dataStyleName );
	    }

        return $style_style;
    }


	/**
	 *  Делает стиль "дефолтным" (тэг style:default-style).
	 *
	 * @param bool $value если необходимо убрать признак - передаём false (необяз.)
	 */
	public function defineAsDefault( $value = true ) {
    	$this->isDefaultStyle = $value;
    }


    public function getName(){
        return $this->name;
    }


    public function __clone(){
        $this->name = 'clone-' . $this->name . '-' . rand(0, 99999999999);
    }


    public function setName($name){
        $this->name = $name;

        return $this;
    }

    /**
     * @param OdtStyle|string $parentStyle экземпляр объекта стиля, или имя соответствующего класса
     *
     * @return $this чтобы можно было продолжать вешать методы по-цепочке... ;)
     */
    public function setParentStyle($parentStyle){
        $this->parentStyleName = is_object($parentStyle) ? $parentStyle->getName() : $parentStyle;

        return $this;
    }

    //  альяс
    public function setParentStyleName($parentStyle){
        return $this->setParentStyle( $parentStyle );
    }


	/**
     * @return string
     */
    public function randString(){
        return md5(time() . rand() . $this->getType());
    }

	/**
     * @return string тип объекта
     */
    abstract protected function getType();

}

class OdtStyleTableColumn extends OdtStyle
{

    private $breakBefore;           // auto
    private $columnWidth;           // length
    private $relColumnWidth;           // length
    private $useOptimalColumnWidth; // "true", "false"


    public function __construct($name = null){
        parent::__construct($name, 'table-column');
        $this->useOptimalColumnWidth = 'true';
    }


    public function setColumnWidth($columnWidth){
        $this->columnWidth = $columnWidth;
    }

    public function setRelColumnWidth($columnWidth){
        $this->relColumnWidth = $columnWidth;
    }


    public function setBreakBefore($breakBefore){
        $this->breakBefore = $breakBefore;
    }


    public function setUseOptimalColumnWidth($useOptimalColumnWidth){
        $this->useOptimalColumnWidth = $useOptimalColumnWidth;
    }


    public function getContent(Odt $odt, \DOMDocument $dom){
        $style_style = parent::getContent($odt, $dom);

        // style:table-column-properties
        $style_table_column_properties = $dom->createElement('style:table-column-properties');

        if($this->breakBefore){
            $style_table_column_properties->setAttribute('fo:break-before', $this->breakBefore);
        }
        if($this->useOptimalColumnWidth){
            $style_table_column_properties->setAttribute('style:use-optimal-column-width', $this->useOptimalColumnWidth);
        }
        if($this->columnWidth){
            $style_table_column_properties->setAttribute('style:column-width', $this->columnWidth);
        }
        if($this->relColumnWidth){
            $style_table_column_properties->setAttribute('style:rel-column-width', $this->relColumnWidth);
        }

        $style_style->appendChild($style_table_column_properties);

        return $style_style;
    }


    public function getType(){
        return 'odtStyleTableColumn';
    }

}

class OdtStyleTable extends OdtStyle
{

    private $masterPageName;      // Default
    private $display;             // true
    // style:width
    private $width;               // number + 'cm'
    // style:rel-width="100%"
    private $relWidth;               // '100%'
    // fo:margin-left/fo:margin-right
    private $marginLeft;               // number + 'cm'
    private $marginRight;               // number + 'cm'
    // table:align
    private $align;               // 'left', 'margins'...
    // table:border-model
    private $borderModel;        // collapsing, separating

    // style:shadow
    private $shadow; //  'none'
    // style:may-break-between-rows
    private $mayBreakBetweenRows;    // "bool"

    // ...
    // private $writingMode;         // lr-tb
    //  style:page-number
    // private $pageNumber;         // '0'



    public function __construct($name = null){
        parent::__construct($name, 'table');
        $this->display = 'true';
        $this->width = false;
        $this->relWidth = false;
        $this->marginLeft = '0cm';
        $this->marginRight = '0cm';
        $this->align = 'margins';
        $this->masterPageName = '';
        $this->shadow = 'none';
        $this->borderModel = 'collapsing';
        $this->mayBreakBetweenRows = 'true';
        //$this->writingMode = 'lr-tb';
    }

    public function setMayBreakBetweenRows($mayBreakBetweenRows){
        $this->mayBreakBetweenRows = $mayBreakBetweenRows;

	    return $this;
    }

    /** @param boolean $width */
    public function setWidth($width){
        $this->width = $width;
    }

    /** @param string $relWidth */
    public function setRelWidth($relWidth){
        $this->relWidth = $relWidth;
    }

    /** @param string $marginLeft */
    public function setMarginLeft($marginLeft){
        $this->marginLeft = $marginLeft;
    }

    /** @param string $marginRight */
    public function setMarginRight($marginRight){
        $this->marginRight = $marginRight;
    }

    /** @param string $borderModel */
    public function setBorderModel($borderModel){
        $this->borderModel = $borderModel;
    }

    /** @param string $align */
    public function setAlign($align){
        $this->align = $align;
    }

	public function setDisplay($display){
		$this->display = $display;

		return $this;
	}


    public function getContent(Odt $odt, \DOMDocument $dom)
    {
        $style_style = parent::getContent($odt, $dom);

        if($this->masterPageName){
            $style_style->setAttribute('style:master-page-name', $this->masterPageName);
        }

        // style:table-properties
        $style_table_properties = $dom->createElement('style:table-properties');

            if($this->display){
                $style_table_properties->setAttribute('table:display', $this->display);
            }

            if($this->width){
                $style_table_properties->setAttribute('style:width', $this->width);
            }

            if($this->relWidth){
                $style_table_properties->setAttribute('style:rel-width', $this->relWidth);
            }

            if($this->marginLeft){
                $style_table_properties->setAttribute('fo:margin-left', $this->marginLeft);
            }

            if($this->marginRight){
                $style_table_properties->setAttribute('fo:margin-right', $this->marginRight);
            }

            if($this->align){
                $style_table_properties->setAttribute('table:align', $this->align);
            }

            if($this->borderModel){
                $style_table_properties->setAttribute('table:border-model', $this->borderModel);
            }

            if($this->shadow){
                $style_table_properties->setAttribute('style:shadow', $this->shadow);
            }

            if($this->mayBreakBetweenRows){
                $style_table_properties->setAttribute('style:may-break-between-rows', $this->mayBreakBetweenRows);
            }


        $style_style->appendChild($style_table_properties);

        return $style_style;
    }


    public function getType(){
        return 'odtStyleTable';
    }
}

class OdtStyleTableRow extends OdtStyle
{

    private $rowHeight;           // old: 0.52cm now: false
    private $minRowHeight;           // 0.402cm
    private $breakBefore;         // auto
    private $useOptimalRowHeight; // true, false
    //  style:keep-together
    private $styleKeepTogether; // true, false
    //  fo:keep-together
	private $foKeepTogether; // always, auto


	protected static $constructorDefaultValues = [
		  'rowHeight' =>false,
		  'minRowHeight' =>'0.52cm',
		  'breakBefore' =>'auto',
		  'useOptimalRowHeight' =>'true',
		  'styleKeepTogether' =>'false',
		  'foKeepTogether' =>'always'
	];


    public function __construct($name = null){
        parent::__construct($name, 'table-row');

        $this->rowHeight = self::getConstructorDefaultValue( 'rowHeight' );
        $this->minRowHeight = self::getConstructorDefaultValue( 'minRowHeight' );
        $this->breakBefore = self::getConstructorDefaultValue( 'breakBefore' );
        $this->useOptimalRowHeight = self::getConstructorDefaultValue( 'useOptimalRowHeight' );
        $this->styleKeepTogether = self::getConstructorDefaultValue( 'styleKeepTogether' );
        $this->foKeepTogether = self::getConstructorDefaultValue( 'foKeepTogether' );
    }


    public function setStyleKeepTogether($styleKeepTogether){
        $this->styleKeepTogether = $styleKeepTogether;

        return $this;
    }

    public function setFoKeepTogether($foKeepTogether){
        $this->foKeepTogether = $foKeepTogether;

        return $this;
    }

    public function setRowHeight($rowHeight){
        $this->rowHeight = $rowHeight;

        return $this;
    }


    public function setMinRowHeight($rowHeight){
        $this->minRowHeight = $rowHeight;

	    return $this;
    }


    public function setBreakBefore($breakBefore){
        $this->breakBefore = $breakBefore;

	    return $this;
    }


    public function setUseOptimalRowHeight($useOptimalRowHeight){
        $this->useOptimalRowHeight = $useOptimalRowHeight;

	    return $this;
    }


    public function getContent(Odt $odt, \DOMDocument $dom){
        $style_style = parent::getContent($odt, $dom);

        // style:table-row-properties
        $style_table_row_properties = $dom->createElement('style:table-row-properties');

        if($this->rowHeight){
            $style_table_row_properties->setAttribute('style:row-height', $this->rowHeight);
        }
        if($this->minRowHeight){
            $style_table_row_properties->setAttribute('style:min-row-height', $this->minRowHeight);
        }
        if($this->breakBefore){
            $style_table_row_properties->setAttribute('fo:break-before', $this->breakBefore);
        }
        if($this->styleKeepTogether){
            $style_table_row_properties->setAttribute('style:keep-together', $this->styleKeepTogether);
        }
        if($this->foKeepTogether){
            $style_table_row_properties->setAttribute('fo:keep-together', $this->foKeepTogether);
        }
        if($this->useOptimalRowHeight){
            $style_table_row_properties->setAttribute('style:use-optimal-row-height', $this->useOptimalRowHeight);
        }
        $style_style->appendChild($style_table_row_properties);

        return $style_style;
    }


    public function getType(){
        return 'odtStyleTableRow';
    }
}

class OdtStyleTableCell extends OdtStyle
{
    // style:text-align-source
    private $textAlignSource;     // fix
    // style:repeat-content
    private $repeatContent;       // 'true', 'false'
    private $color;               // opt: #ffffff
    private $backgroundColor;     // opt: #ffffff
    // fo:border
    private $border;              // opt: 0.002cm solid #000000
    // fo:border-top
    private $borderTop;              // opt: 0.002cm solid #000000
    // fo:border-bottom
    private $borderBottom;              // opt: 0.002cm solid #000000
    // fo:border-left
    private $borderLeft;              // opt: 0.002cm solid #000000
    // fo:border-right
    private $borderRight;              // opt: 0.002cm solid #000000
    private $textAlign;           // opt: center
    private $verticalAlign;       // opt: top, middle, bottom
    private $marginLeft;          // opt: 0cm
    private $fontWeight;          // opt: bold
    private $fontSize;            // opt: 18pt;
    private $fontStyle;           // opt: italic, normal
    private $underline;           // opt: font-color, #000000, null
    private $fontFace;            // opt: fontFace
    private $styleDataName;       // opt: interne
    // fo:wrap-option
    private $wrapOption;          // opt: 'false', wrap, no-wrap...?
    private $hyphenate;           // opt: true, false in string
    private $shrinkToFit;         // opt; true, false in string
	private $rotationAngle;         // opt: 90
	private $rotationAlign;         // opt: none, top, bottom ..?
    // fo:padding
    private $padding;           // opt: "0cm"
    // fo:padding-top
    private $paddingTop;              // opt: 0.002cm solid #000000
    // fo:padding-bottom
    private $paddingBottom;              // opt: "0cm"
    // fo:padding-left
    private $paddingLeft;              // opt: "0cm"
    // fo:padding-right
    private $paddingRight;              // opt: "0cm"




    public function __construct($name = null){
        parent::__construct($name, 'table-cell');
        $this->parentStyleName = 'Default';
        $this->textAlignSource = 'fix';
        $this->repeatContent = 'false';
        $this->color = false;
        $this->padding = '0cm';
        $this->paddingTop = false;
        $this->paddingBottom = false;
        $this->paddingLeft = false;
        $this->paddingRight = false;
        $this->backgroundColor = false;
        $this->border = false;
        $this->borderTop = false;
        $this->borderBottom = false;
        $this->borderLeft = false;
        $this->borderRight = false;
        $this->textAlign = false;
        $this->verticalAlign = false;
        $this->marginLeft = false;
        $this->fontWeight = false;
        $this->fontSize = false;
        $this->fontStyle = false;
        $this->underline = false;
        $this->fontFace = false;
        $this->styleDataName = false;
        $this->wrapOption = false;
        $this->hyphenate = false;
        $this->shrinkToFit = false;
	    $this->rotationAngle       = false;
	    $this->rotationAlign       = false;
    }


	public function setRotationAngle($angle) {
		$this->rotationAngle = $angle;

		return $this;
	}

	public function setRotationAlign($align) {
		$this->rotationAlign = $align;

		return $this;
	}

	public function setColor($color) {
		$this->color = $color;

		return $this;
	}

	public function setRepeatContent($value) {
		$this->repeatContent = $value;

		return $this;
	}

	public function setPadding($padding) {
		$this->padding = $padding;

		return $this;
	}

	public function setPaddingBottom($paddingBottom){
		$this->paddingBottom = $paddingBottom;

		return $this;
	}

	public function setPaddingLeft($paddingLeft){
		$this->paddingLeft = $paddingLeft;

		return $this;
	}

	public function setPaddingRight($paddingRight){
		$this->paddingRight = $paddingRight;

		return $this;
	}

	public function setPaddingTop($paddingTop){
		$this->paddingTop = $paddingTop;

		return $this;
	}

	public function setBackgroundColor($color) {
		$this->backgroundColor = $color;

		return $this;
	}

	public function setBorder($border) {
		$this->border = $border;

		return $this;
	}

	public function setBorderTop($borderTop){
		$this->borderTop = $borderTop;

		return $this;
	}

	public function setBorderBottom($borderBottom){
		$this->borderBottom = $borderBottom;

		return $this;
	}

	public function setBorderLeft($borderLeft){
		$this->borderLeft = $borderLeft;

		return $this;
	}

	public function setBorderRight($borderRight){
		$this->borderRight = $borderRight;

		return $this;
	}

	public function setTextAlign($textAlign) {
		$this->textAlign = $textAlign;

		return $this;
	}

	public function setVerticalAlign($verticalAlign) {
		$this->verticalAlign = $verticalAlign;

		return $this;
	}

	public function setFontWeight($weight) {
		$this->fontWeight = $weight;

		return $this;
	}

	public function setFontStyle($fontStyle) {
		$this->fontStyle = $fontStyle;

		return $this;
	}

	public function setUnderline($underline) {
		$this->underline = $underline;

		return $this;
	}

	public function setStyleDataName($styleDataName) {
		$this->styleDataName = $styleDataName;

		return $this;
	}

	public function setFontSize($fontSize) {
		$this->fontSize = $fontSize;

		return $this;
	}

	public function setFontFace(OdtFontFace $fontFace) {
		$this->fontFace = $fontFace;

		return $this;
	}

	public function setWrapOption($wrapOption) {
		$this->wrapOption = $wrapOption;

		return $this;
	}

	public function setHyphenate($hyphenate) {
		$this->hyphenate = $hyphenate;

		return $this;
	}

	public function setShrinkToFit($shrinkToFit) {
		$this->shrinkToFit = $shrinkToFit;

		return $this;
	}

	public function setTextAlignSource($textAlignSource) {
		$this->textAlignSource = $textAlignSource;

		return $this;
	}


    public function getContent(Odt $odt, \DOMDocument $dom){
        // style:style
        $style_style = parent::getContent($odt, $dom);
        if($this->styleDataName)
        {
            $style_style->setAttribute('style:data-style-name', $this->styleDataName);
        }

        // style:table-cell-properties
        $style_table_cell_properties = $dom->createElement('style:table-cell-properties');
        $style_table_cell_properties->setAttribute('style:text-align-source', $this->textAlignSource);
        $style_table_cell_properties->setAttribute('style:repeat-content', $this->repeatContent);

        if($this->padding){
            $style_table_cell_properties->setAttribute('fo:padding', $this->padding);
        }

        if($this->paddingTop){
            $style_table_cell_properties->setAttribute('fo:padding-top', $this->paddingTop);
        }

        if($this->paddingBottom){
            $style_table_cell_properties->setAttribute('fo:padding-bottom', $this->paddingBottom);
        }

        if($this->paddingLeft){
            $style_table_cell_properties->setAttribute('fo:padding-left', $this->paddingLeft);
        }

        if($this->paddingRight){
            $style_table_cell_properties->setAttribute('fo:padding-right', $this->paddingRight);
        }

        if($this->backgroundColor)
        {
            $style_table_cell_properties->setAttribute('fo:background-color', $this->backgroundColor);
        }

        if($this->border){
            $style_table_cell_properties->setAttribute('fo:border', $this->border);
        }

        if($this->borderTop){
            $style_table_cell_properties->setAttribute('fo:border-top', $this->borderTop);
        }

        if($this->borderBottom){
            $style_table_cell_properties->setAttribute('fo:border-bottom', $this->borderBottom);
        }

        if($this->borderLeft){
            $style_table_cell_properties->setAttribute('fo:border-left', $this->borderLeft);
        }

        if($this->borderRight){
            $style_table_cell_properties->setAttribute('fo:border-right', $this->borderRight);
        }

        $style_style->appendChild($style_table_cell_properties);

        if($this->textAlign)
        {
            // style:paragraph-properties
            $style_paragraph_properties = $dom->createElement('style:paragraph-properties');
            $style_paragraph_properties->setAttribute('fo:text-align', $this->textAlign);
            $style_paragraph_properties->setAttribute('fo:margin-left', '0cm');
            $style_style->appendChild($style_paragraph_properties);
        }

        if($this->verticalAlign)
        {
            $style_table_cell_properties->setAttribute('style:vertical-align', $this->verticalAlign);
        }

        if($this->wrapOption)
        {
            $style_table_cell_properties->setAttribute('fo:wrap-option', $this->wrapOption);
        }

        if($this->shrinkToFit)
        {
            $style_table_cell_properties->setAttribute('style:shrink-to-fit', $this->shrinkToFit);
        }

		if($this->rotationAngle) {
			$style_table_cell_properties->setAttribute("style:rotation-angle", $this->rotationAngle);
		}

		if($this->rotationAlign) {
			$style_table_cell_properties->setAttribute("style:rotation-align", $this->rotationAlign);
		}

        if($this->color OR $this->fontWeight OR $this->fontStyle OR $this->underline OR $this->fontSize OR $this->fontFace OR $this->hyphenate)
        {
            // style:text-properties
            $style_text_properties = $dom->createElement('style:text-properties');

            if($this->color)
            {
                $style_text_properties->setAttribute('fo:color', $this->color);
            }

            if($this->fontWeight)
            {
                $style_text_properties->setAttribute('fo:font-weight', $this->fontWeight);
                $style_text_properties->setAttribute('style:font-weight-asian', $this->fontWeight);
                $style_text_properties->setAttribute('style:font-weight-complex', $this->fontWeight);
            }

            if($this->fontStyle)
            {
                $style_text_properties->setAttribute('fo:font-style', $this->fontStyle);
                $style_text_properties->setAttribute('fo:font-style-asian', $this->fontStyle);
                $style_text_properties->setAttribute('fo:font-style-complex', $this->fontStyle);
            }

            if($this->underline)
            {
                $style_text_properties->setAttribute('style:text-underline-style', 'solid');
                $style_text_properties->setAttribute('style:text-underline-width', 'auto');
                $style_text_properties->setAttribute('style:text-underline-color', $this->underline);
            }

            if($this->fontSize)
            {
                $style_text_properties->setAttribute('fo:font-size', $this->fontSize);
                $style_text_properties->setAttribute('style:font-size-asian', $this->fontSize);
                $style_text_properties->setAttribute('style:font-size-complex', $this->fontSize);
            }

            if($this->fontFace)
            {
                $style_text_properties->setAttribute('style:font-name', $this->fontFace->getFontName());
            }

            if($this->hyphenate)
            {
                $style_text_properties->setAttribute('fo:hyphenate', $this->hyphenate);
            }

            $style_style->appendChild($style_text_properties);
        }


        return $style_style;
    }


    public function getType(){
        return 'odtStyleTableCell';
    }
}


class OdtStyleMasterPage
{
    private $name;          // string
    private $pageLayoutName;     // string

    private $displayName; // string
    private $nextStyleName; // string


    /** @var array $childList массив дочерних элементов */
    protected $childList;

    /** @var array $headerItems массив дочерних элементов  */
    protected $headerItems;

    /** @var array $footerItems массив дочерних элементов  */
    protected $footerItems;


    /**
     * Конструктор класса.
     *
     * @param string $name   имя класса
     * @param string $pageLayoutName имя лэйаута, которого описывает данный стиль (см. документацию)
     */
    public function __construct($name, $pageLayoutName)
    {
        $this->name = $name;
        $this->pageLayoutName = $pageLayoutName;
        $this->displayName = false;
        $this->nextStyleName = false;
    }

    /**
     * @param Odt          $odt
     * @param \DOMDocument $dom
     *
     * @return \DOMElement
     */
    public function getContent(Odt $odt, \DOMDocument $dom)
    {
        $element = $dom->createElement('style:master-page');
        $childList = $this->childList;
        $headerItems = $this->headerItems;
        $footerItems = $this->footerItems;

        $element->setAttribute( 'style:name', $this->name );
        $element->setAttribute( 'style:page-layout-name', $this->pageLayoutName );

        if( $this->nextStyleName )
        {
            $element->setAttribute('style:next-style-name', $this->nextStyleName);
        }
        if( $this->displayName )
        {
            $element->setAttribute('style:display-name', $this->displayName);
        }

        if(!empty($childList))
        {
            foreach($childList as $child)
            {
                $node = is_object($child)? $child->getContent($odt, $dom) : $dom->createTextNode((string) $child);
                $element->appendChild($node);
            }
        }

        if(!empty($headerItems))
        {
            $header = $dom->createElement('style:header');

            foreach($headerItems as $child)
            {
                $node = is_object($child)? $child->getContent($odt, $dom) : $dom->createTextNode((string) $child);
                $header->appendChild($node);
            }

            $element->appendChild($header);
        }

        if(!empty($footerItems))
        {
            $footer = $dom->createElement('style:footer');

            foreach($footerItems as $child)
            {
                $node = is_object($child)? $child->getContent($odt, $dom) : $dom->createTextNode((string) $child);
                $footer->appendChild($node);
            }

            $element->appendChild($footer);
        }


        return $element;
    }

    public function getName(){
        return $this->name;
    }

    public function setName($name){
        $this->name = $name;

        return $this;
    }

    /** @return str */
    public function getDisplayName(){
        return $this->displayName;
    }

    public function setDisplayName($displayName){
        $this->displayName = $displayName;

        return $this;
    }

    /** @return str */
    public function getNextStyleName(){
        return $this->nextStyleName;
    }

    public function setNextStyleName($nextStyleName){
        $this->nextStyleName = $nextStyleName;

        return $this;
    }

    public function setChildList($children){
        $this->_setItemsOf($children, 'childList');
    }

    public function addChild($children){
        AH::loopWith( $children, [ $this, 'toChildList' ] );

        return $this;
    }

    public function toChildList($item){
        $this->childList[] = $item;
    }


    public function setHeaderItems($children){
        $this->_setItemsOf($children, 'headerItems');
    }

    public function addHeaderItems($children){
        AH::loopWith( $children, [ $this, 'addHeaderItem' ] );

        return $this;
    }

    public function addHeaderItem($item){
        $this->headerItems[] = $item;
    }

    public function setFooterItems($children){
        $this->_setItemsOf($children, 'footerItems');
    }

    public function addFooterItems($children){
        AH::loopWith( $children, [ $this, 'addFooterItem' ] );

        return $this;
    }

    public function addFooterItem($item){
        $this->footerItems[] = $item;
    }

    protected function _setItemsOf($items, $property) {
        if(empty($items)){
            $this->$property = array();
        } else{
            $this->$property = is_array($items)? $items : [ $items ];
        }
    }

}


class OdtStyleNumber extends OdtStyle {

	protected $decimalPlaces;      // integer
	protected $minIntegerDigits;             // integer
	protected $grouping;         // "true", "false"


	public function __construct($name = null, $family = null) {
		parent::__construct( $name, $family );

		$this->family = false;

		$this->decimalPlaces = false; //  количество знаков после запятой
		$this->minIntegerDigits = false; //  минимальное количество знаков
		$this->grouping = 'true';  //  разделять разряды
	}


	public function getContent(Odt $odt, \DOMDocument $dom) {
		$style = $dom->createElement( 'number:number-style' );
		$style->setAttribute( 'style:name', $this->name );

		$number = $dom->createElement( 'number:number' );

		if( $this->decimalPlaces ) {
			$number->setAttribute( 'number:decimal-places', $this->decimalPlaces );
		}
		if( $this->minIntegerDigits ) {
			$number->setAttribute( 'number:min-integer-digits', $this->minIntegerDigits );
		}
		if( $this->grouping ) {
			$number->setAttribute( 'number:grouping', $this->grouping );
		}

		$style->appendChild( $number );

		return $style;
	}


	public function getType() {
		return 'odtStyleNumber';
	}


	/**
	 * @param string $decimalPlaces
	 * @return $this
	 */
	public function setDecimalPlaces($decimalPlaces) {
		$this->decimalPlaces = $decimalPlaces;

		return $this;
	}


	/**
	 * @param string $minIntegerDigits
	 * @return $this
	 */
	public function setMinIntegerDigits($minIntegerDigits) {
		$this->minIntegerDigits = $minIntegerDigits;

		return $this;
	}


	/**
	 * @param string $grouping
	 * @return $this
	 */
	public function setGrouping($grouping) {
		$this->grouping = $grouping;

		return $this;
	}

}


/**
 * Class OdtStyleElement генератор простых элементов стилей ODF, таких как: <style:column>, <style:column-sep>, <style:background-image>, и т.д.
 */
class OdtStyleElement
{
	protected $tagName;
	protected $attributes;

	/** @var array $childList массив дочерних элементов */
	protected $childList;


	/**
	 * odtStyleElement конструктор.
	 * @param string $tagName имя элемента стиля
	 * @param array  $children
	 * @param array  $config  конфигурация объекта стиля
	 */
	public function __construct($tagName, array $children = [],  array $config = [])
	{
		$this->tagName = $tagName;
		$this->attributes = AH::getValue( $config, 'attributes', [] );
	}


	public function getContent(Odt $odt, \DOMDocument $dom)
	{
		$element = $dom->createElement( $this->tagName );
		$attributes = $this->attributes;
        $childList = $this->childList;

		if( count($attributes) )
		{
			foreach($attributes as $name => $value) {
				if( $value ) {
					$element->setAttribute($name, $value);
				}
			}
		}

        if(!empty($childList))
        {
            foreach($childList as $child) {
            	if( is_object( $child ) && method_exists( $child, 'getContent' ) ) {
		            $element->appendChild( $child->getContent($odt, $dom) );
	            }
            }
        }

		return $element;
	}

	public function addChild($children){
		AH::loopWith( $children, [ $this, 'toChildList' ] );

		return $this;
	}

	public function toChildList($item){
		$this->childList[] = $item;
	}


	/**
	 * @return string
	 */
	public function getTagName() {
		return $this->tagName;
	}

	public function setAttribute( $name, $value ) {
		$this->attributes[ $name ] = $value;

		return $this;
	}

}
