<?php


namespace odtphpgenerator;

use DOMDocument;
use App\common\component\ArrayHelper as AH;


/**
 * Class OdtDraw
 */
abstract class OdtDraw
{
	/** @var array $childList массив дочерних элементов. */
	protected $childList;

	/** @var string $styleName имя стиля  */
	protected $styleName;
	/** @var string $textStyleName имя текстового стиля  */
	protected $textStyleName;

	//  атрибуты
	protected $zIndex;           //  draw:z-index = "0"
	protected $tableBackground;  //  table:table-background = ("true", "false", null)
	/** @var  string $name имя объекта */
	protected $name;

	protected $tagName;


	/**
	 * OdtDraw конструктор.
	 *
	 * @param mixed           $children
	 * @param OdtStyleGraphic $style
	 */
	public function __construct( $children = null, $style = null ) {
		$this->setChildList( $children );
		$this->setStyle( $style );
		$this->setTextStyleName( false );
	}


	abstract protected function getType();

	public function getContent(Odt $odt, DOMDocument $dom) {
		$element = $dom->createElement( $this->tagName );
		$childList = $this->childList;
		$styleName = $this->styleName;
		$textStyleName = $this->textStyleName;

		if( !empty( $childList ) )
		{
			foreach( $childList as $child )
			{
				if( $child || $child === '0' || $child === 0 ){
					$node = is_object( $child )? $child->getContent($odt, $dom) : $dom->createTextNode( (string) $child );
					$element->appendChild($node);
				}
			}
		}

		if( $styleName && is_string( $styleName ) ){
				$element->setAttribute( 'draw:style-name', $styleName );
		}
		if( $textStyleName && is_string( $textStyleName ) ){
				$element->setAttribute( 'draw:text-style-name', $textStyleName );
		}

		if($this->tableBackground) {
			$element->setAttribute( 'table:table-background', $this->tableBackground );
		}
		if($this->zIndex) {
			$element->setAttribute( 'draw:z-index', $this->zIndex );
		}


		return $element;
	}


	public function setStyle($style){
		$this->styleName = $this->parseStyleName( $style );

		return $this;
	}
	public function setTextStyleName($textStyleName) {
		$this->textStyleName = $textStyleName;

		return $this;
	}
	public function setZIndex($zIndex){
		$this->zIndex = $zIndex;

		return $this;
	}
	public function setTableBackground($tableBackground) {
		$this->tableBackground = $tableBackground;

		return $this;
	}

	public function setChildList($children){
		if(empty($children) && $children !== 0 && $children !== '0'){
			$this->childList = [];
		} else{
			$this->childList = is_array($children)? $children : [ $children ];
		}
	}
	public function addChild($children) {
		AH::loopWith( $children, [ $this, 'toChildList' ] );

		return $this;
	}
	public function setName( $name ){
		$this->name = $name;

		return $this;
	}

	/** @param OdtStyleText|string $style объект стиля параграфов, или название стиля.
	 * @return string название класса стилей
	 */
	protected function parseStyleName($style) {
		return is_object($style) ?  $style->getName() : $style;
	}


	public function toChildList($item){
		$this->childList[] = $item;
	}

}


// <draw:frame draw:style-name="fr2" draw:name="Врезка2" text:anchor-type="char" svg:x="0.025cm" svg:y="-0.229cm"
//                                         svg:width="26.926cm" svg:height="5.082cm" draw:z-index="4">
// draw:frame draw:style-name="fr1" draw:name="Врезка1" text:anchor-type="char" svg:x="0.025cm" svg:y="-0.229cm"
//                                         svg:width="26.926cm" svg:height="5.082cm" draw:z-index="0"
class OdtDrawFrame extends OdtDraw
{
	//  атрибуты
	protected $x;  //  svg:x = "0.025cm"
	protected $y;  //  svg:y = "-0.229cm"
	protected $width;  //  svg:width = "26.926cm"
	protected $height;  //  svg:height = "5.082cm"
	protected $anchorType;  //  text:anchor-type = ("page", "frame", "paragraph", "char", "as-char")


	/**
	 * OdtDrawFrame конструктор.
	 *
	 * @param mixed                   $children
	 * @param null|OdtStyleGraphic    $x
	 * @param                         $y
	 * @param                         $width
	 * @param                         $height
	 * @param OdtStyleGraphic|string  $style имя графического стиля или объект OdtStyleGraphic
	 */
	public function __construct( $children = null, $style = null, $x, $y, $width, $height ) {
		parent::__construct( $children, $style );

		$this->x               = $x;
		$this->y               = $y;
		$this->width           = $width;
		$this->height          = $height;
		$this->anchorType      = false;

		$this->tagName = 'draw:frame';
	}

	public function getContent(Odt $odt, DOMDocument $dom) {
		$element = parent::getContent( $odt, $dom );

		if($this->x) {
			$element->setAttribute( 'svg:x', $this->x );
		}
		if($this->y) {
			$element->setAttribute( 'svg:y', $this->y );
		}
		if($this->width) {
			$element->setAttribute( 'svg:width', $this->width );
		}
		if($this->height) {
			$element->setAttribute( 'svg:height', $this->height );
		}
		if($this->anchorType) {
			$element->setAttribute( 'text:anchor-type', $this->anchorType );
		}


		return $element;
	}


	public function setX($x){
		$this->x = $x;

		return $this;
	}
	public function setY($y){
		$this->y = $y;

		return $this;
	}
	public function setWidth($width){
		$this->width = $width;

		return $this;
	}
	public function setHeight($height){
		$this->height = $height;

		return $this;
	}
	public function setAnchorType($anchorType){
		$this->anchorType = $anchorType;

		return $this;
	}


	public function getType() {
		return 'odtDrawFrame';
	}

}


class OdtDrawCustomShape extends OdtDrawFrame {

	/**
	 * OdtDrawCustomShape конструктор.
	 *
	 * @param mixed                   $children
	 * @param null|OdtStyleGraphic    $x
	 * @param                         $y
	 * @param                         $width
	 * @param                         $height
	 * @param OdtStyleGraphic|string  $style имя графического стиля или объект OdtStyleGraphic
	 */
	public function __construct( $children = null, $style = null, $x, $y, $width, $height ) {
		parent::__construct( $children, $style, $x, $y, $width, $height );

		$this->tagName = 'draw:custom-shape';
	}

}





/**
 * Class OdtDrawElement тэг-генератор простых графических элементов ODF, таких как: <draw:text-box>, <draw:enhanced-geometry>, и т.д.
 */
class OdtDrawElement
{
	protected $tagName;
	protected $attributes;
	/** @var array $childList массив дочерних элементов. */
	protected $childList;


	/**
	 * odtDrawElement конструктор.
	 * @param string $name имя элемента
	 * @param array $config конфигурация объекта (attributes, children)
	 */
	public function __construct($name, array $config = []) {
		$this->attributes = AH::getValue( $config, 'attributes', [] );
		$this->childList = AH::getValue( $config, 'children', [] );

		switch($name)
		{
			//  рамка с текстом/лэйбл
			case 'textBox':
				$this->tagName = 'draw:text-box';
				break;

			//  элемент enhanced geometry втречается среди дочерних элеиентов «draw:custom-shape», и описывает геометрию родительского объекта
			case 'enhancedGeometry':
				$this->tagName = 'draw:enhanced-geometry';
				break;

			//  комплексный XML-элемент, способный содержать в себе различные ODF элементв
			default:
				$this->tagName = 'draw:custom-shape';
				break;
		}
	}


	public function setChildList($children){
		if(empty($children) && $children !== 0 && $children !== '0'){
			$this->childList = [];
		} else{
			$this->childList = is_array($children)? $children : [ $children ];
		}
	}

	public function addChild($children) {
		AH::loopWith( $children, [ $this, 'toChildList' ] );

		return $this;
	}

	public function toChildList($item){
		$this->childList[] = $item;
	}




	public function getContent(Odt $odt, \DOMDocument $dom)
	{
		$element = $dom->createElement( $this->tagName );
		$children = $this->childList;
		$attributes = $this->attributes;


		if( !empty( $children ) ) {
			foreach( $children as $child )
			{
				if( is_object( $child ) && method_exists( $child, 'getContent' ) ) {
					$element->appendChild( $child->getContent($odt, $dom) );
				}
			}
		}

		if( count($attributes) )
		{
			foreach($attributes as $name => $value) {
				if( $value ) {
					$element->setAttribute($name, $value);
				}
			}
		}

		return $element;
	}


}
