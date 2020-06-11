/**
 * доработка базовой подсказки
 * @class App.project.override.tip.Tip
 */
Ext.define('App.project.override.tip.Tip', {
	override: 'Ext.tip.Tip',

	//  без этого св-ва, если Tip возникает на фоне модального окна, у которого это св-во есть - подсказки видно не будет...
	alwaysOnTop:   500
});