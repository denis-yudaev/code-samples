<?php
namespace odsgen;

use App\common\Utilities as Util;


class odsStyleText extends odsStyle
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

		$this->textProperties = new odsTextProperties();
	}

	public function getContent(ods $ods, \DOMDocument $dom) {
		$style_style = parent::getContent($ods,$dom);

		$style_text_properties = $this->textProperties->getContent($ods,$dom);

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
		return 'odsStyleText';
	}

	public function getFamily(){
		return 'text';
	}

}


class odsTextProperties
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


	public function getContent(ods $ods, \DOMDocument $dom){
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
