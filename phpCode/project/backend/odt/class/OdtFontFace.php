<?php
namespace odtphpgenerator;

class OdtFontFace {
	private $fontName; // = "Times New Roman";
	private $fontFamilyGeneric;
	private $fontPitch;

	public function __construct($fontName, $fontFamilyGeneric = null, $fontPitch = 'variable') {
		$this->fontName          = $fontName;
		$this->fontFamilyGeneric = $fontFamilyGeneric;
		$this->fontPitch         = $fontPitch;
	}

	public function getContent(Odt $odt, \DOMDocument $dom) {
		$style_font_face = $dom->createElement('style:font-face');
			$style_font_face->setAttribute('style:name', $this->fontName);
			$style_font_face->setAttribute('svg:font-family', "'$this->fontName'" );
		if($this->fontFamilyGeneric) {
			$style_font_face->setAttribute('style:font-family-generic', $this->fontFamilyGeneric);
		}
		if($this->fontPitch) {
			$style_font_face->setAttribute('style:font-pitch', $this->fontPitch);
		}
		return $style_font_face;
	}

	public function getFontName() {
		return $this->fontName;
	}

	public function getStyles(Odt $odt, \DOMDocument $dom) {
		return $this->getContent($odt,$dom);
	}
}
