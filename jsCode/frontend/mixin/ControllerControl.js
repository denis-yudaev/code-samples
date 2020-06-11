/**
 *  Реализация возможности перезагрузки изменений, сделанных в ViewController без перезагрузки проекта.
 *  Mixin контроля контроллеров. Подцепившись к «мэйму» (.../Main.js), будет удалять ViewController привязанный к этому мэйну после его закрытия.
 *  Важно! Чтобы всё работало, необходимо к главному представлению (../Main.js) подключить миксин следующим образом:
 *      ...
 *  	mixins: {
 *  		ctrlControl: 'App.project.mixin.ControllerControl'
 *  	},
 *      ...
 *
 * @class App.project.mixin.ControllerControl
 */
Ext.define('App.project.mixin.ControllerControl', {
	extend: 'Ext.Mixin',
	mixinId: 'ctrlControl',

	storedController: null,

	mixinConfig: {
		after: {
			render: 'storeController',
			destroy: 'destroyController'
		}
	},

	storeController: function(){
		var mixin = this && this.mixins && this.mixins.ctrlControl,
		    controller = this && this.getController && this.getController() || null;

		controller && ( mixin.storedController = controller );
	},

	destroyController: function () {
		this.storedController && this.storedController.destroy && this.storedController.destroy();
	}

});