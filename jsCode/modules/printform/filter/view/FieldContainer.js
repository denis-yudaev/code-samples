/**
 *  Контейнер (FieldContainer) для полей фильтра печатных форм
 * @class App.project.modules.printform.filter.view.FieldContainer
 */
Ext.define('App.project.modules.printform.filter.view.FieldContainer', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.printform-filter-fieldcontainer',

    requires: [
        'App.project.modules.printform.filter.view.ConditionButton'
    ],


    fieldLabel: 'undefined',
    name: undefined,

    width: '100%',
    layout: 'table',
    style: {
        padding: '4px 4px 0px 4px',
        borderRadius: '4px'
    },
    prepareConditions: {
        string: {
            "&#61;": '$il',
            "&ne;": '$nil'
        },
        defaultKeys: {
            '&#61;': '$eq',
            "&ne;": '$ne',
            "&lt;": '$lt',
            "&gt;": '$gt',
            "&lt;@": '$cd'
        }
    },

    config: {
        labelWidth: null,
        editorWidth: null,

        conditions: {
            date: ["&#61;", "&ne;", "&lt;", "&gt;"],
            tree: ["&lt;@"],
            defaultKeys: ["&#61;", "&ne;"]
        }
    },


    constructor: function(config){
        var me = this;

        me.setFromColumn(config);

        me.callParent(arguments);
    },


    getValue: function(){
        var me = this,
            condition = me.items.getAt(0),
            editor = me.items.getAt(1),
            value = editor.getValue ? editor.getValue() : null,
            result = { data: null },
            prepareCondition,
            prepareFunction;


        if (!Ext.isEmpty( value ))
        {
            prepareCondition = me.prepareConditions[me.column.type] ? me.prepareConditions[me.column.type] : me.prepareConditions.defaultKeys;
            prepareFunction = prepareCondition[condition.text];

            if ( Ext.isEmpty( prepareFunction ) )
            {
                Ext.toastWarning('Не удаётся сформировать условие для ' + condition.text + ' обратитесь к администратору!');

            } else
            {
                result = {
                    name: me.fieldLabel,
                    dataIndex: me.itemId,
                    data: App.common.data.prepare.Condition[ prepareFunction ]( me.itemId, value, 'and' )
                };
            }
        }

        return result;
    },

    getEditor: function(){
        return this.items.getAt(1);
    },

    setFromColumn: function(config) {
        var me = this,
            filterItem = config.column,
            fieldLabel = filterItem.text || filterItem.name,
            conditions = config.conditions || me.config.conditions,
            editor,
            buttonConditions;

        if (filterItem.dataIndex !== '')
        {
            if (filterItem.initialConfig && filterItem.initialConfig.editor) {
                editor = filterItem.initialConfig.editor;
            }
            else if (filterItem.editor) {
                editor = filterItem.editor;
            }
            else {
                editor = 'textfield';
            }

            Ext.apply( me, {
                labelWidth: me.getLabelWidth() || 150,
                itemId: filterItem.dataIndex,
                fieldLabel: fieldLabel.charAt(0).toUpperCase() + fieldLabel.substr(1)
            } );

            if ( !config.allowBlank ) {
                Ext.apply( me, {
                    afterLabelTextTpl: [
                        '<span style="color:red;font-weight:bold" data-qtip="Это поле обязательно для заполнения">*</span>'
                    ]
                });
            }

            editor = Ext.isObject( editor ) ? editor : { xtype: editor };
            Ext.apply( editor, { width: me.getEditorWidth() || '100%' } );

	        buttonConditions = filterItem.type && conditions[filterItem.type] ? conditions[filterItem.type] : conditions.defaultKeys;

            me.items = [
                {
                    xtype: 'printform-filter-conditionbutton',
                    text: buttonConditions && buttonConditions.length && buttonConditions[0],
                    conditions: buttonConditions
                },
                editor
            ];
        }
    }


});