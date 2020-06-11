/**
 * Контроллер экспорта
 * @class App.project.modules.printform.view.Controller
 */
Ext.define('App.project.modules.printform.view.ViewController', {
    extend: 'Ext.app.ViewController',
    alias:  'controller.printform-controller',

    /**  @desc хэндлер кнопки "Экспорт"
     *   @var this - кнопка, не контроллер
     *   */
    handlePrintFormButton: function(button) {
        var me = this,
            btn = button || me.getView();

            btn.doDownload( btn );
    }

});