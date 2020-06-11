<?php
namespace odtphpgenerator;

use App\common\Utilities as Util;

//  ODF <style:style style:family="graphic" />
class OdtStyleGraphic extends OdtStyleParagraph
{
	protected $graphicProperties;

	protected $tagName;


	public function __clone(){
		parent::__clone();

		$this->graphicProperties = clone $this->graphicProperties;
	}


	public function setGraphicProperty($name, $value) {
		$this->graphicProperties->setProperty( $name, $value );

		return $this;
	}


	/**
	 * @param array $data
	 * @return $this
	 */
	public function setGraphicProperties(array $data = []) {
		$this->graphicProperties->setProperties( $data );

		return $this;
	}

	public function setProperty($name, $value) {
		parent::setProperty( $name, $value );

		return $this;
	}

	public function __construct($name = null) {
		parent::__construct( $name );

			$this->tagName = 'style:style';

		$this->graphicProperties = new OdtGraphicProperties();
	}

	public function getContent(Odt $odt, \DOMDocument $dom) {
		$element = parent::getContent($odt,$dom);

		$element->appendChild( $this->graphicProperties->getContent( $odt, $dom ) );

		// $el = $dom->createElement($this->tagName);


		return $element;
	}


	public function getType() {
		return 'odtStyleGraphic';
	}

	public function getFamily(){
		return 'graphic';
	}

}


class OdtGraphicProperties
{

	/** @var array $attributes атрибуты XML-DOM-элемента <style:graphic-properties>, которые будут напрямую ему присвоены (как есть) */
	protected $attributes;


	public function getContent(Odt $odt, \DOMDocument $dom)
	{
		$element = $dom->createElement('style:graphic-properties');
		$attributes = $this->attributes;

		if( count( $attributes ) ) {
			foreach( $attributes as $name => $value )
			{
				if( $value ) {
					$element->setAttribute( $name, $value );
				}
			}
		}


		return $element;
	}

	public function setProperty($name, $value) {
		if( $value ) {
			$this->attributes[ $name ] = $value;
		}

		return $this;
	}


	/**
	 * @param array $data
	 * @return $this
	 */
	public function setProperties(array $data = []) {
		$this->attributes = $data;

		return $this;
	}


}