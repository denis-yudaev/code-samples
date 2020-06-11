<?php

namespace App\project\component;

use App\common\system\Exception;

class FactoryModel {
	public static function build($modelName) {
		$model = 'App\project\component\\' . ucfirst($modelName) . 'ListModel';

		//  для прочих моделей
		if( !class_exists( $model ) ) {
			$model = 'App\project\component\\' . ucfirst($modelName) . 'Model';
		}

		if( !class_exists( $model ) ) {
			$model = 'App\project\component\\' . strtoupper($modelName) . 'Model';
		}

		if ( class_exists( $model ) ) {
			return $model;
		} else {
			throw new Exception( 'Неверный тип шаблона' );
		}
 	}
}