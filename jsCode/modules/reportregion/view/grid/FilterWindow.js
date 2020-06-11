/**
 * Окно фильтра региональной справки
 * @class App.project.modules.reportregion.view.grid.FilterWindow
 */
Ext.define('App.project.modules.reportregion.view.grid.FilterWindow', {
	extend: 'App.project.modules.filter.view.Window',

	requires: [
		'App.project.modules.reportregion.view.grid.FilterWindowToolbar'
	],

	alias: 'widget.reportregion-grid-filterwindow',
	title: false,
	header: false,

	width: 450,
	minHeight: 400,
	height: false,
	modal: true,
	autoScroll: true,
	autoRender: true,
	hidden: false,
	autoShow: true,
	closeAction: 'hide',
	shadow: 'drop',
	layout: 'fit',

	cls: 'project-filter-window project-reportregion-window',

	alwaysOnTop: 5,

	bodyStyle: {
		padding: 0
	},

	config: {
		gridFilter: null,
		tagFocus: null,

		tabs: null,
		filterForm: null,
		generatorForm: null
	},

	listeners: {
		'render': function(self) {
			var tabs = self.down('tabpanel'),
			    tabbar = tabs && tabs.getTabBar(),
			    filterForm = tabs.getComponent( 'filter' ).down( 'form' );

			self.setTabs( tabs );
			self.setFilterForm( filterForm );
			self.setGeneratorForm( tabs.getComponent( 'generator' ).down( 'form' ) );

			filterForm.up().on( 'show', Ext.Function.pass( self.onFilterFormPanelShow, [ self, filterForm ] ) );

			self.onFilterFormPanelShow(self, filterForm);

			if(tabbar) {
				tabbar.add({
					xtype: 'tool',
					type: 'close',
					toolOwner: self,
					scope: self,
					handler: 'close',
					style: {
						left: 'auto',
						right: 0
					}
				});
			}
		},

		beforeclose: function(self){
			var generatorForm = self.getGeneratorForm(),
				toolBar = generatorForm && generatorForm.up().down('reportregion-grid-filterwindow-toolbar');

			toolBar && toolBar.clearHandler && toolBar.clearHandler( toolBar.down('[itemId=clear]') );
		}
	},

	tbar: false,

	items: [
		{
			xtype: 'tabpanel',
			tabPosition: 'top',
			layout: 'fit',
			minHeight: 200,
			cls: 'project-reportregion-tabpanel',

			items: [
				{
					title: 'Параметры фильтрации',
					// layout: 'fit',
					itemId: 'filter',
					tbar: {
						xtype: 'reportregion-grid-filterwindow-toolbar'
					},
					items: [{
						xtype: 'form',
						style: {
							borderTop: '1px #cecece solid'
						},

						layout: {
							type: 'vbox',
							align: 'begin',
							pack: 'start'
						},

						bodyPadding: '5px',
						border: false,
						title: false,


						fieldDefaults: {
							flex: 1,
							msgTarget: 'side',
							labelWidth: 150,
							padding: 0,
							marginTop: '10px'
						},

						defaults: {
							labelStyle: 'padding-left: 5px; padding-top: 0; vertical-align: middle;',
							inputStyle: 'min-height: 24px;'
						},

						items: []
					}]
				},
				{
					title: 'Параметры формирования',
					itemId: 'generator',
					layout: 'fit',
					tbar: {
						xtype: 'reportregion-grid-filterwindow-toolbar',
						isGeneratorFormToolbar: true
					},
					items: [{
						xtype: 'reportregion-grid-filterform',
						style: {
							borderTop: '1px #cecece solid'
						}
					}]
				}
			]



		}
	],


	onFilterFormPanelShow: function(filterWindow, filterForm){
		var gridFilter = filterWindow.getGridFilter(),
		    dataGrid = gridFilter && gridFilter.getDataGrid(),
			formEnabled = dataGrid && dataGrid.getStore().isLoaded();

		filterForm.setDisabled( !formEnabled )
	},


    show: function() {
        var me = this;
        me.callParent( arguments );
        me.onShowFlterWindow();
    },

    onShowFlterWindow: function(){
        var me = this,
            filterForm = me.getFilterForm(),
            editor = Ext.isString(me.getTagFocus()) ? me.getTagFocus() : null;

	    !!editor && filterForm.items.get(editor) && filterForm.items.get(editor).items.items[1].focus();
    },

	drawItems: function(){
		var filterForm = this.getFilterForm();

		filterForm.items.each(function(item){
			if(item.items.getAt(1).getValue && !Ext.isEmpty(item.items.getAt(1).getValue())){
				item.el.setStyle('background-color', '#9BC5E4');
			} else {
				item.el.setStyle('background-color', '#FFFFFF');
			}
		});
	},

	updateFilterFieldTagParams: function(){
		var me = this,
            dataGrid = me.getGridFilter(),
            filterForm = me.getFilterForm(),
            updatedTags = [],
            value;

		filterForm.items.each(function(item) {
	        value = item && item.getValue && item.getValue();

			if( !Ext.isEmpty( value ) ) {
                updatedTags.push( value );
                if( item.getEditor().getRawValue() ) {
                    value.rawValue = item.getEditor().getRawValue();
                }
			}
        });

        dataGrid.setTagParams(updatedTags);
	},

	applyToFilter: function(){
		var me = this,
            gridFilter = me.getGridFilter();

        if(me.fireEvent('beforeApplyToFilter', me, gridFilter) !== false) {
            me.drawItems();

            //обновляем параметры фильтра
            me.updateFilterFieldTagParams();
            gridFilter.updateTags();

            gridFilter.startFiltration();

            me.close();
        }
	},

	clearFieldContainer: function(fieldContainer){
        fieldContainer.items.items[1].setValue && fieldContainer.items.items[1].setValue(null);
		fieldContainer.el && fieldContainer.el.setStyle('background-color', '#FFFFFF');
	},

	initEvents: function(){
		var me = this;
		me.getEl().on('keyup', function(e, t, object){
			if(e.getKey() == Ext.EventObject.ENTER){
				me.applyToFilter();
			}
		})
	},

    addFilterFields: function(){
        var me = this,
            filter = me.getGridFilter(),
            dataGrid = filter.getDataGrid(),
            filterForm = me.getFilterForm() || me.items[0].items[0].items[0],
            fieldContainer, filterItems = [];
	    filterForm.items = [];

        if(!!dataGrid && filter.getModalSearchField().length){
            Ext.each(filter.getModalSearchField(), function(item){
                filterItems.push(dataGrid.down('[dataIndex="' + item + '"]'));
            })
        }else if(!!dataGrid){
            filterItems = dataGrid.columnManager.getColumns()
        }else{
            filterItems = filter.getTagParams();
        }


	    Ext.each(filterItems, function(filterItem, index){
            if(!!filterItem && filterItem.dataIndex) {
                fieldContainer = {
                    xtype: 'filter-fieldcontainer',
                    column: filterItem
                };
                Ext.each(filter.tagParams, function(param, index){
                    if(!!param.data && param.data.name == filterItem.dataIndex){
                        fieldContainer.defaultParam = param;
                    }
                });

                fieldContainer.allowBlank = (filter.getNotNullParams().indexOf(filterItem.dataIndex) >= 0) ? false : true;
	            filterForm.items.push(fieldContainer);
            }
		});

    }


});
