/**
 * Кнопка вызова печатной формы
 * @class App.project.modules.printform.view.PrintFormButton
 */
Ext.define( 'App.project.modules.printform.view.PrintFormButton', {
    extend: 'App.common.button.Download',
    alias: 'widget.printform-button',

    requires: [
        'App.project.modules.printform.view.ViewController'
    ],

    controller: 'printform-controller',

    text: '',
    iconCls: null,
    cls: 'printFormButton',
    plain: true,
    style: {
        textAlign: 'left',
        backgroundColor: '#E0E0E0',
        color: '#555555'
    },


    /** Кнопка вызова окна/диалога печатных форм.
     * Компонент имеет некоторые значения по-умолчанию для конфига "bind", которые будут рекурсивно слиты с пользовательскими параметрами,
     * в случае передачи таковых, при этом пользовательские значения будут перекрывать предопределённые..
     *
     * Пример использования:
     *
     * ~~~
     * {
     * 		xtype: 'printform-button',
     *
     *      'bind':   {
     *			params: {
     *				method: 'run',
     *				data:   {
     *					template: 'plngoz',
     *					request:  [
     *						{
     *							object: 'pln.plan_var_card_goz',
     *							method: 'pln.plan_var_card_goz_s',
     *							data: [
     *								App.common.data.prepare.Condition.$eq('kls_id_struct', 99),
     *								App.common.data.prepare.Condition.$eq('plan_var_id', '1001')
     *							]
     *						},
     *						{
     *							object: 'pln.plan_var_card_goz',
     *							method: 'pln.plan_var_card_goz_sum_limit_s',
     *							data: [	],
     *							limit: null
     *						}
     *					]
     *				}
     *			}
     *		}
     * }
     * ~~~
     *
     * @param {Object} config - изначальная конфигурация компонента
     */
    constructor: function(config) {
        var bind,
            bindDefaults = {
                params:   {
                    object: 'export',
                    method: 'run',
                    data:   {
                        template: 'kls',
                        title:    'Стандартный формат описания',
                        request:  [
                            {
                                object: 'kls.kls',
                                method: 'kls.kls_s',
                                data:   []

                            }
                        ]
                    }
                }
            };

        bind = ( config.bind ) ? Ext.Object.merge( bindDefaults, config.bind ) : bindDefaults;

        config.bind = bind;
        this.config.bind = bind;


        this.callParent( arguments );
    },


    /**  @desc если в конфигурации кнопки (вне самого компонента) определить хэндлер "in-place", а именно передать строку с именем метода,
     * который должен будет служить хэндлером для данной кнопки, то метод будет вызываться не из локального scope по-умолчанию,
     * а из view controller'а (то есть отсюда)...
     * */
    initComponent: function() {
        var me = this,
            handlerName = me.handler,
            controller = me.getController(),
            handler;

        if( handlerName && Ext.isString( handlerName ) )
        {
            handler = controller[ handlerName ];

            if( handler && Ext.isFunction( handler ) ) {
                me.handler = handler;
            }
        }

        me.callParent( arguments );
    }

});