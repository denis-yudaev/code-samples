<?php
namespace odsgen;

class odsFontFace {
	private $fontName;
	private $fontFamilyGeneric;
	private $fontPitch;
	
	public function __construct($fontName, $fontFamilyGeneric = null, $fontPitch = 'variable') {
		$this->fontName          = $fontName;
		$this->fontFamilyGeneric = $fontFamilyGeneric;
		$this->fontPitch         = $fontPitch;
	}
	
	public function getContent(ods $ods, \DOMDocument $dom) {
		$style_font_face = $dom->createElement('style:font-face');
		$font_family = $this->fontName;
		$font_family = stristr( $font_family, ' ' ) !== false ? '"' . $font_family . '"' : $font_family;

		$style_font_face->setAttribute('style:name', $this->fontName);
		$style_font_face->setAttribute('svg:font-family',  $font_family);

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
	
	public function getStyles(ods $ods, \DOMDocument $dom) {
		return $this->getContent($ods,$dom);
	}
}

