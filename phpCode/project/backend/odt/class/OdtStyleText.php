<?php
namespace odtphpgenerator;

use App\common\Utilities as Util;
use App\common\component\ArrayHelper as AH;


class OdtStyleText extends OdtStyle
{
	protected $textProperties;

	/**  @internal string $class - специальное свойство, используемое исключительно на системном уровне...  */
	protected $class;


	public function __clone(){
		parent::__clone();

		$this->textProperties = clone $this->textProperties;

	}


	public function setProperty($name, $value) {
		$method = 'set' . Util::camelize( $name );

		if( method_exists($this->textProperties, $method) ) {
			$this->textProperties->$method( $value );
		}

		return $this;
	}

	public function __construct($name = null) {
		parent::__construct( $name, $this->getFamily() );
		$this->class = null;

		$this->textProperties = new OdtTextProperties();
	}

	public function getContent(Odt $odt, \DOMDocument $dom) {
		$style_style = parent::getContent($odt,$dom);

		$style_text_properties = $this->textProperties->getContent($odt,$dom);

		$style_style->appendChild($style_text_properties);

		if( $this->class ) {
			$style_style->setAttribute('style:class', $this->class);
		}

		return $style_style;
	}

	/** @return string */
	public function getClass(){
		return $this->class;
	}

	public function setClass($class){
		$this->class = $class;

		return $this;
	}

	public function getType() {
		return 'odtStyleText';
	}

	public function getFamily(){
		return 'text';
	}

}


class OdtStyleParagraph extends OdtStyleText
{
	protected $masterPageName; // false/string

	protected $paragraphProperties;


	public function __clone(){
		parent::__clone();

		$this->paragraphProperties = clone $this->paragraphProperties;
	}

	/**
	 *  методом addTabStop можно как добавлять уже созданные объекты класса @see OdtParagraphPropertiesTabStop, так и создавать новые,
	 * передавая в метод массив с атрибутами новосозданного элемента style:tab-stop и их значениями...
	 *
	 * @param $tabStop OdtParagraphPropertiesTabStop|array
	 *
	 * @return $this для чайнинга ;)
	 */
	public function addTabStop($tabStop)
	{
		if( is_array($tabStop) )
		{
			$attributes = $tabStop;
			$tabStop = new OdtParagraphPropertiesTabStop();

			foreach( $attributes as $name => $value ){
				$method = 'set' . Util::camelize( $name );

				if( method_exists( $tabStop, $method ) ){
					$tabStop->$method( $value );
				}
			}
		}

		$this->paragraphProperties->addTabStop( $tabStop );

		return $this;
	}

	public function __construct($name = null) {
		parent::__construct( $name );

		$this->masterPageName = false;
		$this->paragraphProperties = new OdtParagraphProperties();
	}

	/**
	 * @param OdtStyleMasterPage|string $masterPageName
	 *
	 * @return $this для chaining'а
	 */
	public function setMasterPageName($masterPageName){
		$this->masterPageName = is_object( $masterPageName ) ? $masterPageName->getName() : $masterPageName;

		return $this;
	}

	public function setProperty($name, $value) {
		$method = 'set' . Util::camelize( $name );

		if( method_exists($this->paragraphProperties, $method) ) {
			$this->paragraphProperties->$method( $value );
		} else {
			parent::setProperty( $name, $value );
		}

		return $this;
	}

	public function getContent(Odt $odt, \DOMDocument $dom) {
		$style_style = parent::getContent($odt,$dom);

		if( $this->masterPageName ) {
			$style_style->setAttribute( 'style:master-page-name', $this->masterPageName );
		}

		$style_paragraph_properties = $this->paragraphProperties->getContent($odt,$dom);

		$style_style->appendChild($style_paragraph_properties);

		return $style_style;
	}

	public function getType() {
		return 'odtStyleParagraph';
	}

	public function getFamily(){
		return 'paragraph';
	}

}


class OdtTextProperties
{

	public function __construct(){
		$this->textOutline = false;
		$this->fontName = false;
		$this->fontSize = false;
		$this->letterSpacing = false;
		$this->fontStyle = false;
		$this->textUnderline = false;
		$this->fontWeight = false;
		$this->hyphenation = false;
		$this->language = false;
		$this->country = false;
		$this->color = false;
		$this->backgroundColor = false;
		$this->textPosition = false;
	}


	public function setLanguage($language){
		$this->language = $language;
	}

	public function setCountry($country){
		$this->country = $country;
	}

	public function setColor($color){
		$this->color = $color;
	}
	public function setBackgroundColor($backgroundColor){
		$this->backgroundColor = $backgroundColor;
	}

	public function setTextOutline($textOutline){
		$this->textOutline = $textOutline;
	}

	public function setFontName($fontName){
		$this->fontName = $fontName;
	}

	public function setFontSize($fontSize){
		$this->fontSize = $fontSize;
	}

	public function setLetterSpacing($letterSpacing){
		$this->letterSpacing = $letterSpacing;
	}

	public function setFontStyle($fontStyle){
		$this->fontStyle = $fontStyle;
	}

	public function setTextUnderline($textUnderline){
		$this->textUnderline = $textUnderline;
	}

	public function setTextPosition($textPosition){
		$this->textPosition = $textPosition;
	}

	public function setFontWeight($fontWeight){
		$this->fontWeight = $fontWeight;
	}

	public function setHyphenation($hyphenation){
		$this->hyphenation = $hyphenation;
	}


	public function getContent(Odt $odt, \DOMDocument $dom){
		$style_text_properties = $dom->createElement('style:text-properties');

		if($this->textOutline){
			$style_text_properties->setAttribute('style:text-outline', $this->textOutline);
		}

		if($this->letterSpacing){
			$style_text_properties->setAttribute('fo:letter-spacing', $this->letterSpacing);
		}

		if($this->hyphenation){
			$style_text_properties->setAttribute('fo:hyphenate', $this->hyphenation);
		}

		if($this->language){
			$style_text_properties->setAttribute('fo:language', $this->language);
		}

		if($this->country){
			$style_text_properties->setAttribute('fo:country', $this->country);
		}

		if($this->textPosition){
			$style_text_properties->setAttribute('style:text-position', $this->textPosition);
		}

		if($this->color){
			$style_text_properties->setAttribute('fo:color', $this->color);
		}
		if($this->backgroundColor){
			$style_text_properties->setAttribute('fo:background-color', $this->backgroundColor);
		}

		if($this->fontName){
			$style_text_properties->setAttribute('style:font-name', $this->fontName);
			$style_text_properties->setAttribute('style:font-name-asian', $this->fontName);
			$style_text_properties->setAttribute('style:font-name-complex', $this->fontName);
		}

		if($this->fontSize){
			$style_text_properties->setAttribute('fo:font-size', $this->fontSize);
			$style_text_properties->setAttribute('style:font-size-asian', $this->fontSize);
			$style_text_properties->setAttribute('style:font-size-complex', $this->fontSize);
		}

		if($this->fontStyle){
			$style_text_properties->setAttribute('fo:font-style', $this->fontStyle);
			$style_text_properties->setAttribute('style:font-style-asian', $this->fontStyle);
			$style_text_properties->setAttribute('style:font-style-complex', $this->fontStyle);
		}

		if($this->fontWeight){
			$style_text_properties->setAttribute('fo:font-weight', $this->fontWeight);
			$style_text_properties->setAttribute('style:font-weight-asian', $this->fontWeight);
			$style_text_properties->setAttribute('style:font-weight-complex', $this->fontWeight);
		}

		if($this->textUnderline){
			$style_text_properties->setAttribute('style:text-underline-style', 'solid');
			$style_text_properties->setAttribute('style:text-underline-width', 'auto');
			$style_text_properties->setAttribute('style:text-underline-color', $this->textUnderline);
		}

		return $style_text_properties;
	}


	// fo:color
	private $color; // '#333333'
	// fo:background-color
	private $backgroundColor; // '#333333'
	// style:text-outline
	private $textOutline; // bool
	// style:font-name, style:font-name-asian and style:font-name-complex
	private $fontName; // string
	// fo:font-size, style:font-size-asian and style:font-size-complex
	private $fontSize; // pt, %
	// fo:letter-spacing
	private $letterSpacing; // normal, or length...
	// fo:font-style, style:font-style-asian and style:font-style-comple
	private $fontStyle; // normal, oblique or italic
	// style:text-underline-style='solid' style:text-underline-width='auto' style:text-underline-color='font-color'
	private $textUnderline; // font-color, #000000, null
	// fo:font-weight, style:font-weight-asian and style:font-weight-complex
	private $fontWeight; // normal, bold, 100, 200, ...
	// fo:hyphenate
	private $hyphenation; // true, false in string
	// fo:language
	private $language;  // ru
	// fo:country
	private $country;  // RU
	// style:text-position
	private $textPosition; // eg.: 'super 58%'

}


class OdtParagraphProperties
{
	protected $tabStops;


	public function __construct()
	{
		$this->lineHeight = false;
		$this->lineHeightAtLeast = false;
		$this->textAlign = false;
		$this->textAlignLast = false;
		$this->justifySingleWord = false;
		$this->keepTogether = false;
		$this->marginLeft = false;
		$this->marginRight = false;
		$this->textIndent = false;
		$this->autoTextIndent = false;
		$this->marginTop = false;
		$this->marginBottom = false;
		$this->breakBefore = false;
		$this->breakAfter = false;
		$this->keepWithNext = false; // auto, always
		$this->lineBreak = false;
		$this->verticalAlign = false;
		$this->snapToLayoutGrid = false;
		$this->numberLines = false;
		$this->lineNumber = false;
		$this->pageNumber = false;
		$this->orphans = false;
		$this->widows = false;
		$this->textAutospace = false;
		$this->defaultOutlineLevel = false;

		$this->tabStops = array();
	}

	/**
	 * @param $tabStop OdtParagraphPropertiesTabStop
	 */
	public function addTabStop($tabStop) {
		$this->tabStops[] = $tabStop;
	}

	public function setLineHeight($lineHeight){
		$this->lineHeight = $lineHeight;
	}

	public function setLineHeightAtLeast($lineHeightAtLeast){
		$this->lineHeightAtLeast = $lineHeightAtLeast;
	}

	public function setTextAlign($textAlign){
		$this->textAlign = $textAlign;
	}

	public function setTextAlignLast($textAlignLast){
		$this->textAlignLast = $textAlignLast;
	}

	public function setJustifySingleWord($justifySingleWord){
		$this->justifySingleWord = $justifySingleWord;

		return $this;
	}

	public function setKeepTogether($keepTogether){
		$this->keepTogether = $keepTogether;

		return $this;
	}

	public function setMarginLeft($marginLeft){
		$this->marginLeft = $marginLeft;

		return $this;
	}

	public function setMarginRight($marginRight){
		$this->marginRight = $marginRight;

		return $this;
	}

	public function setTextIndent($textIndent){
		$this->textIndent = $textIndent;
	}

	public function setAutoTextIndent($autoTextIndent){
		$this->autoTextIndent = $autoTextIndent;
	}

	public function setMarginTop($marginTop){
		$this->marginTop = $marginTop;
	}

	public function setMarginBottom($marginBottom){
		$this->marginBottom = $marginBottom;
	}

	public function setBreakBefore($breakBefore){
		$this->breakBefore = $breakBefore;
	}

	public function setBreakAfter($breakAfter){
		$this->breakAfter = $breakAfter;
	}

	public function setKeepWithNext($keepWithNext){
		$this->keepWithNext = $keepWithNext;
	}

	public function setLineBreak($lineBreak){
		$this->lineBreak = $lineBreak;
	}

	public function setVerticalAlign($verticalAlign){
		$this->verticalAlign = $verticalAlign;
	}

	public function setSnapToLayoutGrid($snapToLayoutGrid){
		$this->snapToLayoutGrid = $snapToLayoutGrid;
	}

	public function setNumberLines($numberLines){
		$this->numberLines = $numberLines;
	}

	public function setLineNumber($lineNumber){
		$this->lineNumber = $lineNumber;
	}

	public function setPageNumber($pageNumber){
		$this->pageNumber = $pageNumber;

		return $this;
	}

	public function setOrphans($orphans){
		$this->orphans = $orphans;

		return $this;
	}

	public function setWidows($widows){
		$this->widows = $widows;

		return $this;
	}

	public function setDefaultOutlineLevel($defaultOutlineLevel){
		$this->defaultOutlineLevel = $defaultOutlineLevel;

		return $this;
	}

	public function setTextAutospace($textAutospace){
		$this->textAutospace = $textAutospace;

		return $this;
	}

	public function getContent(Odt $odt, \DOMDocument $dom)
	{
		$style_paragraph_properties = $dom->createElement('style:paragraph-properties');
		$tabStops = $this->tabStops;


		if($this->lineHeight)
		{
			$style_paragraph_properties->setAttribute('fo:line-height', $this->lineHeight);
		}

		if($this->lineHeightAtLeast)
		{
			$style_paragraph_properties->setAttribute('style:line-height-at-least', $this->lineHeightAtLeast);
		}

		if($this->textAlign)
		{
			$style_paragraph_properties->setAttribute('fo:text-align', $this->textAlign);
		}

		if($this->textAlignLast)
		{
			$style_paragraph_properties->setAttribute('fo:text-align-last', $this->textAlignLast);
		}

		if($this->justifySingleWord)
		{
			$style_paragraph_properties->setAttribute('style:justify-single-word', $this->justifySingleWord);
		}

		if($this->keepTogether)
		{
			$style_paragraph_properties->setAttribute('fo:keep-together', $this->keepTogether);
		}

		if($this->marginLeft)
		{
			$style_paragraph_properties->setAttribute('fo:margin-left', $this->marginLeft);
		}

		if($this->marginRight)
		{
			$style_paragraph_properties->setAttribute('fo:margin-right', $this->marginRight);
		}

		if($this->textIndent)
		{
			$style_paragraph_properties->setAttribute('fo:text-indent', $this->textIndent);
		}

		if($this->autoTextIndent)
		{
			$style_paragraph_properties->setAttribute('style:auto-text-indent', $this->autoTextIndent);
		}

		if($this->marginTop)
		{
			$style_paragraph_properties->setAttribute('fo:margin-top', $this->marginTop);
		}

		if($this->marginBottom)
		{
			$style_paragraph_properties->setAttribute('fo:margin-bottom', $this->marginBottom);
		}

		if($this->breakBefore)
		{
			$style_paragraph_properties->setAttribute('fo:break-before', $this->breakBefore);
		}

		if($this->breakAfter)
		{
			$style_paragraph_properties->setAttribute('fo:break-after', $this->breakAfter);
		}

		if($this->keepWithNext)
		{
			$style_paragraph_properties->setAttribute('fo:keep-with-next', $this->keepWithNext);
		}

		if($this->lineBreak)
		{
			$style_paragraph_properties->setAttribute('style:line-break', $this->lineBreak);
		}

		if($this->verticalAlign)
		{
			$style_paragraph_properties->setAttribute('style:vertical-align', $this->verticalAlign);
		}

		if($this->snapToLayoutGrid)
		{
			$style_paragraph_properties->setAttribute('style:snap-to-layout-grid', $this->snapToLayoutGrid);
		}

		if($this->numberLines)
		{
			$style_paragraph_properties->setAttribute('text:number-lines', $this->numberLines);
		}

		if($this->lineNumber)
		{
			$style_paragraph_properties->setAttribute('text:line-number', $this->lineNumber);
		}

		if($this->pageNumber)
		{
			$style_paragraph_properties->setAttribute('style:page-number', $this->pageNumber);
		}

		if($this->orphans)
		{
			$style_paragraph_properties->setAttribute('fo:orphans', $this->orphans);
		}

		if($this->widows)
		{
			$style_paragraph_properties->setAttribute('fo:widows', $this->widows);
		}

		if($this->textAutospace)
		{
			$style_paragraph_properties->setAttribute('style:text-autospace', $this->textAutospace);
		}

		if($this->defaultOutlineLevel)
		{
			$style_paragraph_properties->setAttribute('style:default-outline-level', $this->defaultOutlineLevel);
		}

		if( count($tabStops) )
		{
			$style_tab_stops = $dom->createElement('style:tab-stops');

			/** @var OdtParagraphPropertiesTabStop $tabStop */
			foreach($tabStops as $tabStop) {
				$style_tab_stops->appendChild( $tabStop->getContent( $odt, $dom ) );
			}

			$style_paragraph_properties->appendChild( $style_tab_stops );
		}


		return $style_paragraph_properties;
	}

	// style:snap-to-layout-grid
	private $snapToLayoutGrid; // 'boolean'
	// fo:line-height
	private $lineHeight; // normal, length, %
	// style:line-height-at-least
	private $lineHeightAtLeast; // length, %
	// fo:text-align
	private $textAlign; // start, end, left, right, center, or justify
	// fo:text-align-last
	private $textAlignLast; // start, center, or justify
	// style:justify-single-word
	private $justifySingleWord;  // 'boolean'
	// fo:keep-together
	private $keepTogether;  // always, auto
	// fo:margin-left
	private $marginLeft; // length, %
	// fo:margin-right
	private $marginRight; // length, %
	// fo:text-indent
	private $textIndent; // length, %
	// style:auto-text-indent
	private $autoTextIndent; // 'boolean'
	// fo:margin-top
	private $marginTop; // length, %
	// fo:margin-bottom
	private $marginBottom; // length, %
	// fo:break-before
	private $breakBefore; // auto, page or column
	// fo:break-after
	private $breakAfter; // auto, page or column
	// fo:keep-with-next
	private $keepWithNext; // auto or always
	// style:line-break
	private $lineBreak; // strict, normal
	// style:vertical-align
	private $verticalAlign; // bottom, top, middle, auto
	// text:number-lines
	private $numberLines; // 'boolean'
	// text:line-number
	private $lineNumber; // 'number'
	// style:page-number
	private $pageNumber; // 'auto' ?..
	// fo:orphans
	private $orphans; // "0"
	// fo:widows
	private $widows; // "0"
	// style:text-autospace
	private $textAutospace; // "none"
	// style:default-outline-level
	private $defaultOutlineLevel; // integer

}


class OdtSectionProperties
{
	protected $columns;

	protected $backgroundColor;
	protected $marginLeft;
	protected $marginRight;
	protected $editable;


	public function __construct()
	{
		// TODO: реализовать <style:background-image> при необходимости
		// $this->backgroundImage = false;  //  style:background-image (элемент)

		$this->backgroundColor = false;  //  fo:background-color
		$this->marginLeft = false;  //  fo:margin-left (только абсолютные величины)
		$this->marginRight = false;  //  fo:margin-right (только абсолютные величины)
		$this->editable = false; // style:editable "true"/"false"

		$this->columns = new OdtSectionPropertiesColumns();
	}


	public function setBackgroundColor($backgroundColor) {
		$this->backgroundColor = $backgroundColor;

		return $this;
	}
	public function setMarginLeft($marginLeft){
		$this->marginLeft = $marginLeft;

		return $this;
	}
	public function setMarginRight($marginRight){
		$this->marginRight = $marginRight;

		return $this;
	}
	public function setEditable($editable) {
		$this->editable = $editable;

		return $this;
	}


	public function getContent(Odt $odt, \DOMDocument $dom)
	{
		$element = $dom->createElement('style:section-properties');


		if($this->backgroundColor) {
			$element->setAttribute( 'fo:background-color', $this->backgroundColor );
		}
		if($this->marginLeft) {
			$element->setAttribute( 'fo:margin-left', $this->marginLeft );
		}
		if($this->marginRight) {
			$element->setAttribute( 'fo:margin-right', $this->marginRight );
		}
		if($this->editable) {
			$element->setAttribute( 'style:editable', $this->editable );
		}

		if($this->columns)
		{
			$element->appendChild( $this->columns->getContent( $odt, $dom ) );
		}


		return $element;
	}

}


class OdtSectionPropertiesColumns {

	// /** @var array $childList массив колонок и разделителей.
	//  *  TODO: <style:columns> can contain <style:column> and <style:column-sep> (реализовать при необходимости)        */
	protected $childList;

	// fo:column-count
	protected $columnCount;
	// fo:column-gap
	protected $columnGap;


	public function __construct( array $config = [] ){
		$this->childList = [];  //  single-column section will be constructed if there is no section columns specified directly...

		$this->columnCount = AH::getValue( $config, 'count', '1');  // >1
		$this->columnGap = AH::getValue( $config, 'gap', '0cm');  // 0cm
	}


	public function getContent(Odt $odt, \DOMDocument $dom)
	{
		$element = $dom->createElement('style:columns');
		$children = $this->childList ?: [];


		$element->setAttribute( 'fo:column-count', $this->columnCount );
		$element->setAttribute( 'fo:column-gap', $this->columnGap );


		if( !empty( $children ) ) {
			foreach( $children as $child )
			{
				if( $child instanceof OdtStyleElement && ( $child->getTagName() === 'style:column' || $child->getTagName() === 'style:column-sep' ) ) {
					$element->appendChild( $child->getContent($odt, $dom) );
				}
			}
		}


		return $element;
	}


	public function setColumnCount($columnCount) {
		$this->columnCount = $columnCount;
	}
	public function setColumnGap($columnGap) {
		$this->columnGap = $columnGap;
	}



	public function addChild($children){
		AH::loopWith( $children, [ $this, 'addChild' ]);

		return $this;
	}

}


/**
 * Class OdtParagraphPropertiesTabStop элемент style:tab-stop, который(ые) автоматически помещается(ются) в контейнер style:tab-stops элемента
 * style:paragraph-properties при добавлении. Добавление данных элементов производится путём вызова специального метода
 * объектов класса @see OdtStyleParagraph.
 *
 * @package odtphpgenerator
 */
class OdtParagraphPropertiesTabStop
{

	public function __construct(){
		$this->position = false;
		$this->type = false;
		$this->char = false;
		$this->leaderType = false;
		$this->leaderStyle = false;
		$this->leaderWidth = false;
		$this->leaderColor = false;
		$this->leaderText = false;
		$this->leaderTextStyle = false;
	}

	public function setPosition($position){
		$this->position = $position;
	}

	public function setType($type){
		$this->type = $type;
	}

	public function setChar($char){
		$this->char = $char;
	}

	public function setLeaderType($leaderType){
		$this->leaderType = $leaderType;
	}

	public function setLeaderStyle($leaderStyle){
		$this->leaderStyle = $leaderStyle;
	}

	public function setLeaderWidth($leaderWidth){
		$this->leaderWidth = $leaderWidth;
	}

	public function setLeaderColor($leaderColor){
		$this->leaderColor = $leaderColor;
	}

	public function setLeaderText($leaderText){
		$this->leaderText = $leaderText;
	}

	public function setLeaderTextStyle($leaderTextStyle){
		$this->leaderTextStyle = $leaderTextStyle;
	}


	public function getContent(Odt $odt, \DOMDocument $dom)
	{
		$element = $dom->createElement('style:tab-stop');

		if( $this->position )
		{
			$element->setAttribute( 'style:position', $this->position );
		}
		if( $this->type )
		{
			$element->setAttribute( 'style:type', $this->type );
		}
		if( $this->char )
		{
			$element->setAttribute( 'style:char', $this->char );
		}
		if( $this->leaderType )
		{
			$element->setAttribute( 'style:leader-type', $this->leaderType );
		}
		if( $this->leaderStyle )
		{
			$element->setAttribute( 'style:leader-style', $this->leaderStyle );
		}
		if( $this->leaderWidth )
		{
			$element->setAttribute( 'style:leader-width', $this->leaderWidth );
		}
		if( $this->leaderColor )
		{
			$element->setAttribute( 'style:leader-color', $this->leaderColor );
		}
		if( $this->leaderText )
		{
			$element->setAttribute( 'style:leader-text', $this->leaderText );
		}
		if( $this->leaderTextStyle )
		{
			$element->setAttribute( 'style:leader-text-style', $this->leaderTextStyle );
		}

		return $element;
	}


	// style:position
	private $position; // length, %
	// style:type
	private $type; // left, center, right or char
	// style:char
	private $char; // delimiter character. It must be present if the value of the style:type attribute is char.
	// style:leader-type
	private $leaderType; // по "лидерам" см. описание стандарта
	// style:leader-style
	private $leaderStyle; //
	// style:leader-width
	private $leaderWidth; //
	// style:leader-color
	private $leaderColor; //
	// style:leader-text
	private $leaderText; //
	// style:leader-text-style
	private $leaderTextStyle; //


}