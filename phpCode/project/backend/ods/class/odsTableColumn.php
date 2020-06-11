<?php
namespace odsgen;

class odsTableColumn {

	protected $repeated;
	protected $display;
	protected $odsStyleTableColumn;

	public function __construct(odsStyleTableColumn $odsStyleTableColumn) {
		$this->odsStyleTableColumn = $odsStyleTableColumn;
		$this->repeated = null;
		$this->display = false;
	}

	public function getContent(ods $ods,\DOMDocument $dom) {
		if(!$ods->getStyleByName($this->odsStyleTableColumn->getName()))
			$ods->addTmpStyles($this->odsStyleTableColumn);

		$table_table_column = $dom->createElement('table:table-column');
			$table_table_column->setAttribute("table:style-name", $this->odsStyleTableColumn->getName());
			if($this->repeated) {
				$table_table_column->setAttribute( "table:number-columns-repeated", $this->repeated );
			}
			if($this->display) {
				$table_table_column->setAttribute( "table:display", $this->display );
			}
			$table_table_column->setAttribute("table:default-cell-style-name", "Default");
		return $table_table_column;
	}

	public function setRepeated($repeated) {
		$this->repeated = $repeated;
	}

	public function setDisplay($display) {
		$this->display = $display;
	}

	function getOdsStyleTableColumn() {
		return $this->odsStyleTableColumn;
	}
}

class odsTableColumnWithWidth extends odsTableColumn {

	/**
	 * odsTableColumnWithWidth конструктор класса
	 * 
	 * @param string $width ширина столбца, например: '3.824cm'
	 */
	public function __construct($width) {
		$styleColumn = new odsStyleTableColumn();
		$styleColumn->setColumnWidth($width);
		parent::__construct($styleColumn);
	}
}