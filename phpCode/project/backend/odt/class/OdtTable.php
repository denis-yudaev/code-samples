<?php
namespace odtphpgenerator;
use App\common\system\Exception;
use App\common\component\ArrayHelper as AH;

class OdtTable
{
	private $name;
	private $styleName;
	private $print;

	private $shapes;
	private $tableColumns;
	private $rows;
	private $headerRows;


	/**
	 * OdtTable конструктор.
	 *
	 * @param string $name название таблицы
	 * @param OdtStyleTable|string $odtStyleTable
	 */
	public function __construct($name, $odtStyleTable = null){
		$this->name = $name;

		$this->styleName = self::parseStyle( $odtStyleTable ) ?: 'ta1';

		$this->print = 'true';

		$this->shapes = [ ];
		$this->tableColumns = [ ];
		$this->rows = [ ];
		$this->headerRows = [ ];
	}


	public function getName(){
		return $this->name;
	}


	public function addHeaderRows($item){
		AH::loopWith( $item, [ $this, 'addHeaderRow' ] );

		return $this;
	}
	public function addDraws($item){
		AH::loopWith( $item, [ $this, 'addDraw' ] );

		return $this;
	}
	public function addRows($item){
		// $this->loopIfArray($item, 'addRow');
		AH::loopWith( $item, [ $this, 'addRow' ] );

		return $this;
	}

	public function addTableColumns($item){
		AH::loopWith( $item, [ $this, 'addTableColumn' ] );

		return $this;
	}

	public function addHeaderRow($odtTableHeaderRow){
		$this->headerRows[] = $odtTableHeaderRow;

		return $this;
	}
	public function addDraw($odtDraw){
		$this->shapes[] = $odtDraw;

		return $this;
	}
	public function addRow($odtTableRow){
		$this->rows[] = $odtTableRow;

		return $this;
	}
	public function addTableColumn($odtTableColumn){
		$this->tableColumns[] = $odtTableColumn;

		return $this;
	}
	
	
	public function getContent(Odt $odt, \DOMDocument $dom){
		$table_table = $dom->createElement('table:table');
		$table_table->setAttribute('table:name', $this->name);
		$table_table->setAttribute('table:style-name', $this->styleName);
		$table_table->setAttribute('table:print', $this->print);

		if(count($this->shapes))
		{
			$table_shapes = $dom->createElement('table:shapes');

			foreach($this->shapes as $shapes)
			{
				$table_shapes->appendChild($shapes->getContent($odt, $dom));
			}

			$table_table->appendChild($table_shapes);
		}

		$table_table_columns = $dom->createElement('table:table-columns');

		if(count($this->tableColumns))
		{
			foreach($this->tableColumns as $tableColumn)
			{
				$table_table_columns->appendChild($tableColumn->getContent($odt, $dom));
			}

		} else
		{
			$column = new OdtTableColumn($odt->getStyleByName('co1'));
			$table_table_columns->appendChild($column->getContent($odt, $dom));
		}

		$table_table->appendChild($table_table_columns);


		if(count($this->headerRows))
		{
			$table_header_rows = $dom->createElement('table:table-header-rows');

			foreach($this->headerRows as $headerRow)
			{
				$table_header_rows->appendChild($headerRow->getContent($odt, $dom));
			}

			$table_table->appendChild($table_header_rows);

			$table_table_rows = $dom->createElement('table:table-rows');

			if(count($this->rows))
			{
				foreach($this->rows as $row){
					$table_table_rows->appendChild($row->getContent($odt, $dom));
				}
			} else
			{
				$row = new OdtTableRow();
				$table_table_rows->appendChild($row->getContent($odt, $dom));
			}

			$table_table->appendChild($table_table_rows);

		} else
		{
			if(count($this->rows)){
				foreach($this->rows as $row){
					$table_table->appendChild($row->getContent($odt, $dom));
				}
			} else {
				$row = new OdtTableRow();
				$table_table->appendChild($row->getContent($odt, $dom));
			}

		}

		return $table_table;
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


	/** @param OdtStyleText|string $style объект стиля параграфов, или название стиля.
	 * @return string название класса стилей
	 */
	public static function parseStyle($style) {
		return is_object($style) ?  $style->getName() : $style;
	}

}

class OdtTableColumn
{
	protected $repeated;
	protected $odtStyleTableColumn;
	protected $styleName;


	/**
	 * OdtTableColumn constructor.
	 * @param OdtStyleTableColumn|string $odtStyleTableColumn
	 * @param Odt                        $odt
	 * @throws Exception обработка исключений
	 */
	public function __construct( $odtStyleTableColumn, Odt $odt = null ) {
		if( is_string( $odtStyleTableColumn ) ) {
			if( !$odt ) {
				throw new Exception( 'Чтобы использовать текстовое значение в качестве стиля табличного столбца, необходимо передать объект текущего документа ODT (odtphpgenerator\Odt) вторым параметром!' );
			} else {
				$odtStyleTableColumn = $odt->getStyleByName( $odtStyleTableColumn ) ?: new OdtStyleTableColumn( null );
			}
		}

		$this->odtStyleTableColumn = $odtStyleTableColumn;
		$this->repeated = null;
	}


	public function getContent(Odt $odt, \DOMDocument $dom){
		if( !$odt->getStyleByName( $this->odtStyleTableColumn->getName() ) ){
			$odt->addTmpStyles($this->odtStyleTableColumn);
		}

		$table_table_column = $dom->createElement('table:table-column');
		$table_table_column->setAttribute('table:style-name', $this->odtStyleTableColumn->getName());

		if($this->repeated) {
			$table_table_column->setAttribute('table:number-columns-repeated', $this->repeated);
		}
		$table_table_column->setAttribute('table:default-cell-style-name', 'Default');

		return $table_table_column;
	}


	public function setRepeated($repeated){
		$this->repeated = $repeated;
	}


	public function getodtStyleTableColumn(){
		return $this->odtStyleTableColumn;
	}
}

class OdtTableColumnWithWidth extends OdtTableColumn
{

	/**
	 * OdtTableColumnWithWidth конструктор
	 * @param string $width ширина колонки в сантиметрах (cm)
	 */
	public function __construct($width){
		$styleColumn = new OdtStyleTableColumn();
		$styleColumn->setColumnWidth($width);
		parent::__construct($styleColumn);
	}
}

class OdtTableRow
{

	private $styleName;
	private $cells;
	protected $dataId;


	public function addCells($children){
		AH::loopWith($children, [ $this, 'addCell' ]);

		return $this;
	}


	/**
	 * OdtTableRow constructor.
	 * @param OdtStyleTableRow|string|null $odtStyleTableRow
	 */
	public function __construct( $odtStyleTableRow = null ) {
		$this->dataId = false;

		if($odtStyleTableRow) {
			$this->styleName = $this->parseStyleName( $odtStyleTableRow );
		} else {
			$this->styleName = 'ro1';
		}

		$this->cells = [ ];
	}

	public function setStyle( $style ) {
		$this->styleName = $this->parseStyleName( $style );

		return $this;
	}

	/** @param OdtStyleText|string $style объект стиля параграфов, или название стиля.
	 * @return string название класса стилей
	 */
	private function parseStyleName($style) {
		return is_object($style) ?  $style->getName() : $style;
	}


	public function addCell(OdtTableCell $odtTableCell){
		$this->cells[] = $odtTableCell;

		return $this;
	}


	/**
	 * @param integer $qty количество ячеек, необходимое для вставки в строку
	 *
	 * @return $this строку для чэйнинга
	 */
	public function addCoveredCells($qty = 1){
		$qty = $qty ?: 1;
		for( $i = 0; $i < $qty; $i++ ) {
			$this->cells[] = new OdtCoveredTableCell();
		}

		return $this;
	}

	/**
	 * @param integer $qty количество ячеек, необходимое для вставки в строк
	 * @param OdtStyleTableCell|null    $style  стиль (один на все ячейки)
	 *
	 * @return $this строку для чэйнинга
	 */
	public function addEmptyCells($qty = 1, $style = null){
		$qty = $qty ?: 1;
		for( $i = 0; $i < $qty; $i++ ) {
			$this->cells[] = new OdtTableCellEmpty( $style );
		}

		return $this;
	}


	public function getContent(Odt $odt, \DOMDocument $dom){
		$table_table_row = $dom->createElement('table:table-row');
		$table_table_row->setAttribute('table:style-name', $this->styleName);

		if(count($this->cells))
		{
			foreach($this->cells as $cell)
			{
				$table_table_row->appendChild($cell->getContent($odt, $dom));
				if($cell->getNumberColumnsSpanned() > 1)
				{
					$odtCoveredTableCell = new OdtCoveredTableCell();
					$odtCoveredTableCell->setNumberColumnsRepeated($cell->getNumberColumnsSpanned() - 1);
					$table_table_row->appendChild($odtCoveredTableCell->getContent($odt, $dom));
				}
			}
		} else
		{
			$cell = new OdtTableCellEmpty();
			$table_table_row->appendChild($cell->getContent($odt, $dom));
		}

		if($this->dataId) {
			$table_table_row->setAttribute('table:data-id', $this->dataId);
		}

		return $table_table_row;
	}


	public function getDataId() {
		return $this->dataId;
	}

	public function setDataId($dataId) {
		$this->dataId = $dataId;

		return $this;
	}

}

abstract class OdtTableCell
{

	protected $styleName;
	protected $numberColumnsSpanned;
	protected $numberRowsSpanned;
	protected $formula;
	protected $formulaPrefix;


	protected $numberColumnsRepeated;
	protected $dataId;

	protected function getContent(Odt $odt, \DOMDocument $dom){
		$table_table_cell = $dom->createElement('table:table-cell');
		$style = $this->styleName;

		if( $style ) {
			if( is_object( $style ) ) {
				$odt->addTmpStyles( $style );
				$table_table_cell->setAttribute( 'table:style-name', $style->getName() );
			} else {
				$table_table_cell->setAttribute( 'table:style-name',  $style );
			}
		}

		$this->cellOpts($table_table_cell);
		return $table_table_cell;
	}


	public function setFormulaPrefix($formulaPrefix) {
		$this->formulaPrefix = $formulaPrefix;

		return $this;
	}

	public function setStyle($style){
		$this->styleName = $this->parseStyleName( $style );

		return $this;
	}

	/** @param OdtStyleText|string $style объект стиля параграфов, или название стиля.
	 * @return string название класса стилей
	 */
	private function parseStyleName($style) {
		return is_object($style) ?  $style->getName() : $style;
	}

	/**
	 * @param \DOMElement $table_table_cell
	 */
	protected function cellOpts($table_table_cell){
		if($this->numberColumnsSpanned) {
			$table_table_cell->setAttribute('table:number-columns-spanned', $this->numberColumnsSpanned);
		}

		if($this->numberRowsSpanned) {
			$table_table_cell->setAttribute('table:number-rows-spanned', $this->numberRowsSpanned);
		}

		if($this->formula) {
			if( $this->formulaPrefix === false ) {
				$formulaPrefix = '';
			} elseif( empty( $this->formulaPrefix ) ) {
				$formulaPrefix = 'of:=';
			} else {
				$formulaPrefix = $this->formulaPrefix;
			}
			$table_table_cell->setAttribute('table:formula', $formulaPrefix . $this->formula);
		}

		if($this->numberColumnsRepeated) {
			$table_table_cell->setAttribute('table:number-columns-repeated', $this->numberColumnsRepeated);
		}

		if($this->dataId) {
			$table_table_cell->setAttribute('table:data-id', $this->dataId);
		}
	}


	public function setNumberColumnsSpanned($numberColumnsSpanned){
		$this->numberColumnsSpanned = $numberColumnsSpanned;

		return $this;
	}


	public function getNumberColumnsSpanned(){
		return $this->numberColumnsSpanned?: 1;
	}


	public function setNumberRowsSpanned($numberRowsSpanned){
		$this->numberRowsSpanned = $numberRowsSpanned;

		return $this;
	}


	public function setFormula($formula){
		$this->formula = $formula;

		return $this;
	}

	public function setNumberColumnsRepeated($numberColumnsRepeated){
		$this->numberColumnsRepeated = $numberColumnsRepeated;

		return $this;
	}

	public function getDataId() {
		return $this->dataId;
	}

	public function setDataId($dataId) {
		$this->dataId = $dataId;

		return $this;
	}

}


class OdtTableCellEmpty extends OdtTableCell
{

	public function __construct(OdtStyleTableCell $odtStyleTableCell = null){
		$this->styleName = $odtStyleTableCell;
	}


	public function getContent(Odt $odt, \DOMDocument $dom){
		return OdtTableCell::getContent($odt, $dom);
	}
}


class OdtCoveredTableCell extends OdtTableCell
{

	public function __construct(){ }


	public function getContent(Odt $odt, \DOMDocument $dom){
		$table_table_cell = $dom->createElement('table:covered-table-cell');
		$this->cellOpts($table_table_cell);

		return $table_table_cell;
	}
}


class OdtTableCellStringHttp extends OdtTableCell
{
	public $value;


	public function __construct($value, $odtStyleTableCell = null){
		$this->value = $value;
		$this->setStyle( $odtStyleTableCell );
	}


	public function getContent(Odt $odt, \DOMDocument $dom){
		$table_table_cell = OdtTableCell::getContent($odt, $dom);
		$table_table_cell->setAttribute('office:value-type', 'string');

		// text:p
		$text_p = $dom->createElement('text:p', $this->value);
		$table_table_cell->appendChild($text_p);

		return $table_table_cell;
	}
}


class OdtTableCellString extends OdtTableCellStringHttp
{

	public function __construct($value, $odtStyleTableCell = null){
		parent::__construct($value, $odtStyleTableCell);
		$this->value = str_replace('&', '&amp;', $value);
	}
}


class OdtTableCellFloat extends OdtTableCell
{
	public $value;

	public function __construct($value, $odtStyleTableCell = null){
		$this->value = str_replace( ',', '.', $value );
		$this->styleName = $odtStyleTableCell;
	}


	public function getContent(Odt $odt, \DOMDocument $dom){
		$table_table_cell = OdtTableCell::getContent($odt, $dom);

		$table_table_cell->setAttribute('office:value-type', 'float');
		$table_table_cell->setAttribute('office:value', $this->value);

		// text:p
		$text_p = $dom->createElement('text:p', $this->value);
		$table_table_cell->appendChild($text_p);

		return $table_table_cell;
	}
}


/**
 *  Class OdtTableCellComplex - класс ячейки для заполнения таблиц документов ODT. Отличительной возможностью данного расширения является возможность
 * передавать объекту ячейки массив в качестве значения. Этот массив может содержать в себе строки, числа и объекты пространства имён `odtphpgenerator`
 *
 * @package odtphpgenerator
 */
class OdtTableCellComplex extends OdtTableCell
{
	protected $childList;


	public function addChild($children){
		AH::loopWith($children, [ $this, 'toChildList' ]);

		return $this;
	}


	public function toChildList($item){
		$this->childList[] = $item;
	}

	/**
	 * @param mixed                   $value
	 * @param OdtStyleTableCell|string|null $odtStyleTableCell
	 */
	public function __construct($value = null, $odtStyleTableCell = null)
	{
		$this->setStyle( $odtStyleTableCell );

		$this->setChildList($value);
	}

	public function setChildList($children){
		if(empty($children)){
			$this->childList = [];
		} else{
			$this->childList = is_array($children)? $children : [ $children ];
		}
	}

	public function getContent(Odt $odt, \DOMDocument $dom){
		$element = OdtTableCell::getContent($odt, $dom);

		$childList = $this->childList;


		if(!empty($childList)) {
			/** @var array $childList */
			foreach($childList as $child)
			{
				if(is_string($child)) {
					$child = str_replace('&', '&amp;', $child);

					$node = $dom->createElement( 'text:p', $child );
					$element->setAttribute('office:value-type', 'string');
				}
				else if (is_numeric($child)) {
					$node = $dom->createElement( 'text:p', $child );
					$element->setAttribute('office:value-type', 'float');
					$element->setAttribute('office:value', $child );
				}
				else {
					$node = is_object( $child ) ? $child->getContent( $odt, $dom ) : $dom->createTextNode( $child );
				}

				$element->appendChild($node);
			}
		}

		return $element;
	}
}


/**
 *  Class OdtTableCellComplexInline - расширение для родительского класса ячейки, отображающее переданный контент в строку, если тот представлен
 * массивом значений. В отличие от ячеек созданных на основе родительского класса, ячейки OdtTableCellComplexInline отображают массивные значения
 * как один параграф, включающий в себя перечисленные в массиве элементы.
 *
 * @package odtphpgenerator
 */
class OdtTableCellComplexInline extends OdtTableCellComplex {

	public function getContent(Odt $odt, \DOMDocument $dom){
		$element = OdtTableCell::getContent($odt, $dom);

		$childList = $this->childList;


		if( !empty( $childList ) ) {
			/** @var array $childList */
			if( count( $childList ) > 1 )
			{
				$node = $dom->createElement( 'text:p' );

				foreach( $childList as $child ){
					if( is_string( $child ) || is_numeric( $child ) ) {
						$node->appendChild( $dom->createTextNode( $child ) );
					} else {
						$node->appendChild( is_object( $child ) ? $child->getContent( $odt, $dom ) : $dom->createTextNode( $child ) );
					}
				}
			} else
			{
				$child = array_values( $childList )[0];

				if( is_string( $child ) ) {
					$child = str_replace( '&', '&amp;', $child );

					$node = $dom->createElement( 'text:p', $child );
					$element->setAttribute( 'office:value-type', 'string' );
				} else if( is_numeric( $child ) ) {
					$node = $dom->createElement( 'text:p', $child );
					$element->setAttribute( 'office:value-type', 'float' );
					$element->setAttribute( 'office:value', $child );
				} else {
					$node = is_object( $child ) ? $child->getContent( $odt, $dom ) : $dom->createTextNode( $child );
				}

			}

			$element->appendChild( $node );
		}

		return $element;
	}


}
