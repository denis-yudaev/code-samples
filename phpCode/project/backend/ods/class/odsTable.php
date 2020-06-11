<?php
namespace odsgen;

use App\common\component\ArrayHelper as AH;


class odsTable {
	private $name;
	private $styleName;
	private $print;

	private $cursorPositionX;
	private $cursorPositionY;
	private $horizontalSplitMode;
	private $verticalSplitMode;
	private $horizontalSplitPosition;
	private $verticalSplitPosition;
	private	$positionLeft;
	private	$positionRight;
	private	$positionTop;
	private	$positionBottom;

	private $shapes;
	private $tableColumns;
	private $rows;
	private $headerRows;


	public function __construct($name, $odsStyleTable = null) {
		$this->name                         = $name;
		if($odsStyleTable) $this->styleName = $odsStyleTable->getName;
		else               $this->styleName = "ta1";
		$this->print                        = "true";

		$this->cursorPositionX              = 0;
		$this->cursorPositionY              = 0;
		$this->horizontalSplitMode          = 0;
		$this->verticalSplitMode            = 0;
		$this->horizontalSplitPosition      = 0;
		$this->verticalSplitPosition        = 0;
		$this->positionLeft                 = 0;
		$this->positionRight                = 0;
		$this->positionTop                  = 0;
		$this->positionBottom               = 0;

		$this->shapes                       = [];
		$this->tableColumns                 = [];
		$this->rows                         = [];
		$this->headerRows = [ ];
	}



	public function addHeaderRows($item){
		// $this->loopIfArray($item, 'addHeaderRow');
		AH::loopWith( $item, [ $this, 'addHeaderRow'  ]);

		return $this;
	}
	public function addDraws($item){
		// $this->loopIfArray($item, 'addDraw');
		AH::loopWith( $item, [ $this, 'addDraw' ]);

		return $this;
	}
	public function addRows($item){
		// $this->loopIfArray($item, 'addRow');
		AH::loopWith( $item, [ $this, 'addRow' ]);

		return $this;
	}
	public function addTableColumns($item){
		// $this->loopIfArray($item, 'addTableColumn');
		AH::loopWith( $item, [ $this, 'addTableColumn' ]);

		return $this;
	}

	public function addHeaderRow($odsTableHeaderRow){
		$this->headerRows[] = $odsTableHeaderRow;

		return $this;
	}
	public function addDraw($odsDraw){
		$this->shapes[] = $odsDraw;

		return $this;
	}
	public function addRow($odsTableRow){
		$this->rows[] = $odsTableRow;

		return $this;
	}
	public function addTableColumn($odsTableColumn){
		$this->tableColumns[] = $odsTableColumn;

		return $this;
	}

	public function getName() {
		return $this->name;
	}

	public function setHorizontalSplit($colones = 1) {
		$this->setHorizontalSplitMode(2);
		$this->setHorizontalSplitPosition($colones);
		$this->setPositionRight($colones);
	}

	public function setVerticalSplit($lines = 1) {
		$this->setVerticalSplitMode(2);
		$this->setVerticalSplitPosition($lines);
		$this->setPositionBottom($lines);
	}


	public function setCursorPositionX($cursorPositionX) {
		$this->cursorPositionX = $cursorPositionX;
	}

	public function setCursorPositionY($cursorPositionY) {
		$this->cursorPositionY = $cursorPositionY;
	}

	public function setHorizontalSplitMode($horizontalSplitMode) {
		$this->horizontalSplitMode = $horizontalSplitMode;
	}

	public function setVerticalSplitMode($verticalSplitMode) {
		$this->verticalSplitMode = $verticalSplitMode;
	}

	public function setHorizontalSplitPosition($horizontalSplitPosition) {
		$this->horizontalSplitPosition = $horizontalSplitPosition;
	}

	public function setVerticalSplitPosition($verticalSplitPosition) {
		$this->verticalSplitPosition = $verticalSplitPosition;
	}

	public function setPositionLeft($positionLeft) {
		$this->positionLeft = $positionLeft;
	}

	public function setPositionRight($positionRight) {
		$this->positionRight = $positionRight;
	}

	public function setPositionTop($positionTop) {
		$this->positionTop = $positionTop;
	}

	public function setPositionBottom($positionBottom) {
		$this->positionBottom = $positionBottom;
	}

	public function getContent(ods $ods, \DOMDocument $dom) {
		$table_table = $dom->createElement('table:table');
		$table_table->setAttribute('table:name', $this->name);
		$table_table->setAttribute('table:style-name', $this->styleName);
		$table_table->setAttribute('table:print', $this->print);

		if(count($this->shapes))
		{
			$table_shapes = $dom->createElement('table:shapes');

			foreach($this->shapes as $shapes)
			{
				$table_shapes->appendChild($shapes->getContent($ods, $dom));
			}

			$table_table->appendChild($table_shapes);
		}

		$table_table_columns = $dom->createElement('table:table-columns');

		if(count($this->tableColumns))
		{
			foreach($this->tableColumns as $tableColumn)
			{
				$table_table_columns->appendChild($tableColumn->getContent($ods, $dom));
			}

		} else
		{
			$column = new OdsTableColumn($ods->getStyleByName('co1'));
			$table_table_columns->appendChild($column->getContent($ods, $dom));
		}

		$table_table->appendChild($table_table_columns);


		if(count($this->headerRows))
		{
			$table_header_rows = $dom->createElement('table:table-header-rows');

			foreach($this->headerRows as $headerRow)
			{
				$table_header_rows->appendChild($headerRow->getContent($ods, $dom));
			}

			$table_table->appendChild($table_header_rows);

			$table_table_rows = $dom->createElement('table:table-rows');

			if(count($this->rows))
			{
				foreach($this->rows as $row){
					$table_table_rows->appendChild($row->getContent($ods, $dom));
				}
			} else
			{
				$row = new OdsTableRow();
				$table_table_rows->appendChild($row->getContent($ods, $dom));
			}

			$table_table->appendChild($table_table_rows);

		} else
		{
			if(count($this->rows)){
				foreach($this->rows as $row){
					$table_table->appendChild($row->getContent($ods, $dom));
				}
			} else {
				$row = new OdsTableRow();
				$table_table->appendChild($row->getContent($ods, $dom));
			}

		}

		return $table_table;
	}

	public function getSettings(ods $ods, \DOMDocument $dom) {
		$config_config_item_map_entry2 = $dom->createElement('config:config-item-map-entry');
			$config_config_item_map_entry2->setAttribute("config:name", $this->name);


			$config_config_item = $dom->createElement('config:config-item',$this->cursorPositionX);
				$config_config_item->setAttribute("config:name", "CursorPositionX");
				$config_config_item->setAttribute("config:type", "int");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',$this->cursorPositionY);
				$config_config_item->setAttribute("config:name", "CursorPositionY");
				$config_config_item->setAttribute("config:type", "int");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',$this->horizontalSplitMode);
				$config_config_item->setAttribute("config:name", "HorizontalSplitMode");
				$config_config_item->setAttribute("config:type", "short");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item', $this->verticalSplitMode);
				$config_config_item->setAttribute("config:name", "VerticalSplitMode");
				$config_config_item->setAttribute("config:type", "short");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',$this->horizontalSplitPosition);
				$config_config_item->setAttribute("config:name", "HorizontalSplitPosition");
				$config_config_item->setAttribute("config:type", "int");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',$this->verticalSplitPosition);
				$config_config_item->setAttribute("config:name", "VerticalSplitPosition");
				$config_config_item->setAttribute("config:type", "int");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',2);
				$config_config_item->setAttribute("config:name", "ActiveSplitRange");
				$config_config_item->setAttribute("config:type", "short");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',$this->positionLeft);
				$config_config_item->setAttribute("config:name", "PositionLeft");
				$config_config_item->setAttribute("config:type", "int");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',$this->positionRight);
				$config_config_item->setAttribute("config:name", "PositionRight");
				$config_config_item->setAttribute("config:type", "int");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',$this->positionTop);
				$config_config_item->setAttribute("config:name", "PositionTop");
				$config_config_item->setAttribute("config:type", "int");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',$this->positionBottom);
				$config_config_item->setAttribute("config:name", "PositionBottom");
				$config_config_item->setAttribute("config:type", "int");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',0);
				$config_config_item->setAttribute("config:name", "ZoomType");
				$config_config_item->setAttribute("config:type", "short");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',100);
				$config_config_item->setAttribute("config:name", "ZoomValue");
				$config_config_item->setAttribute("config:type", "int");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',60);
				$config_config_item->setAttribute("config:name", "PageViewZoomValue");
				$config_config_item->setAttribute("config:type", "int");
				$config_config_item_map_entry2->appendChild($config_config_item);

			$config_config_item = $dom->createElement('config:config-item',"true");
				$config_config_item->setAttribute("config:name", "ShowGrid");
				$config_config_item->setAttribute("config:type", "boolean");
				$config_config_item_map_entry2->appendChild($config_config_item);

		return $config_config_item_map_entry2;
	}


	/**
	 * Если передан массив: вызывает указанный метод к каждому его элементу; в противном случае - вызывает данный метод к переданному значению.
	 *
	 * @param mixed $arg
	 * @param string $mtd имя метода, который необходимо применить.
	 */
	protected function loopIfArray($arg, $mtd){
		if( is_array($arg) && count($arg) ) {
			foreach($arg as $item) {
				$this->$mtd( $item );
			}
		} else {
			$this->$mtd( $arg );
		}
	}
}
