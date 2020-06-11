<?php
namespace odsgen;
use App\common\component\ArrayHelper as AH;


class odsTableRow {
	private $styleName;
	private $cells;

	protected $visibility; // collapse

	/**
	 * @param odsStyleTableRow|string|null $odsStyleTableRow
	 */
	public function __construct( $odsStyleTableRow = null) {
		if($odsStyleTableRow) {
			$this->styleName = $this->parseStyleName( $odsStyleTableRow );
		} else {
			$this->styleName = 'ro1';
		}

		$this->cells = [];
		$this->visibility = false;
	}
	
	public function addCell(odsTableCell $odsTableCell) {
		$this->cells[]=$odsTableCell;

		return $this;
	}

	public function addCells($children) {
		AH::loopWith($children, [ $this, 'addCell' ]);

		return $this;
	}
	
	public function getContent(ods $ods, \DOMDocument $dom) {
		$table_table_row = $dom->createElement('table:table-row');
			$table_table_row->setAttribute("table:style-name", $this->styleName);

		if( $this->visibility ) {
			$table_table_row->setAttribute( 'table:visibility', $this->visibility );
		}
		
			if(count($this->cells)) {
				foreach($this->cells as $cell) {
					$table_table_row->appendChild($cell->getContent($ods, $dom));
					if($cell->getNumberColumnsSpanned() > 1) {
						$odsCoveredTableCell = new odsCoveredTableCell();
						$odsCoveredTableCell->setNumberColumnsRepeated($cell->getNumberColumnsSpanned()-1);
						$table_table_row->appendChild($odsCoveredTableCell->getContent($ods, $dom));
					}
				}
					
			} else {
				$cell = new odsTableCellEmpty();
				$table_table_row->appendChild($cell->getContent($ods, $dom));
			}
		
		return $table_table_row;
	}


	/**
	 * @param integer $qty количество ячеек, необходимое для вставки в строку
	 *
	 * @param null    $style
	 * @return $this строку для чэйнинга
	 */
	public function addCoveredCells($qty = 1, $style = null){
		$qty = $qty ?: 1;
		for( $i = 0; $i < $qty; $i++ ) {
			$this->cells[] = new OdsCoveredTableCell( $style );
		}

		return $this;
	}


	/**
	 * @param integer $qty количество ячеек, необходимое для вставки в строку
	 * @param odsStyleTableCell|null    $style  стиль (один на все ячейки)
	 *
	 * @return $this строку для чэйнинга
	 */
	public function addEmptyCells($qty = 1, $style = null){
		$qty = $qty ?: 1;
		for( $i = 0; $i < $qty; $i++ ) {
			$this->cells[] = new odsTableCellEmpty( $style );
		}

		return $this;
	}

	/**
	 * @param mixed $visibility
	 */
	public function setVisibility($visibility) {
		$this->visibility = $visibility;
	}

	public function setStyle( $style ) {
		$this->styleName = $this->parseStyleName( $style );

		return $this;
	}

	/** @param odsStyleText|string $style объект стиля, или название стиля.
	 * @return string название класса стилей
	 */
	private function parseStyleName($style) {
		return is_object($style) ?  $style->getName() : $style;
	}


}
