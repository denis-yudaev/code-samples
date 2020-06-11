/**
 * "Canvas" движок для draw-контейнера. Класс расширен для нужд виджета карты центров утилизации.
 * @class App.project.draw.engine.Canvas
 */
Ext.define('App.project.draw.engine.Canvas', {
    extend: 'Ext.draw.engine.Canvas',

    /**  @property {bool} isSizeInitialized - закрытое свойство */
    config: {
       isSizeInitialized: false
    },


    renderSprite: function (sprite) {
        var me = this,
            draw = me.up(),
            scaling = draw.getScaling(),
            gradient = sprite._gradientFill,
            spriteFill = sprite.attr.fillStyle,
            spriteFx = sprite.fx,
            topPanel = draw.up().up().up().up(),
            mapSelectCombo = draw.up().getMapCombo(),
            attrs = {},
            initialComboValue;

        if(!(topPanel && topPanel.getHeader())){
            topPanel = draw.up().up().up();
        }


        /**  @fix для изображения карты субъектов. Фреймворк высчитывает размеры этого изображения не верно */
        if( mapSelectCombo ) {
            initialComboValue = mapSelectCombo.getInitialValue();

            if( mapSelectCombo.value === 'regional' && initialComboValue !== 'regional' ) {
                scaling *= 0.8137; // из результата вычислений вручную: 0.81369
                scaling = +Number(scaling).toFixed(3);
            }
            if( mapSelectCombo.value !== 'regional' && initialComboValue === 'regional' ) {
                scaling *= 1.1863;
                scaling = +Number(scaling).toFixed(3);
            }
        }
        /**  @fix-end   */

        /**  @desc  инициализация анимации для "кружочков" предприятий... */
        if( sprite.type === 'circle' && !( spriteFx.getCustomDurations() && spriteFx.getCustomDurations().fillStyle ) ) {
            spriteFx.setCustomEasings({ 'fillStyle,strokeStyle': 'easeOut' });
            spriteFx.setCustomDurations({ 'fillStyle,strokeStyle': 600 });
        }


        if( scaling && scaling != sprite.attr.scalingX )
        {
            attrs.scalingX = scaling;
            attrs.scalingY = scaling;
            attrs.scalingCenterX = scaling;
            attrs.scalingCenterY = scaling;
        }

        if( gradient && spriteFill === Ext.draw.Color.RGBA_NONE )
        {
            attrs.fillStyle = gradient;
        }

        if( !Ext.Object.isEmpty( attrs ) )
        {
            sprite.setAttributes( attrs );
        }


        me.callParent( arguments );


        me.fireEvent( 'spriterendered', me, sprite );

    },

    /**  @desc  несмотря на то, что компонент "surface" по своей сути является контейнером, единственный путь к его дочерним объектам (спрайтам)
     * лежит через метод "getItems", который в свою очередь возвращает простой массив объектов. Исправляем недоразумение... */
    getComponent: function(key) {
        var me = this,
            items = Ext.Object.getValues( me.map ),
            index;

        if( !me.items ){
            me.items = Ext.create('Ext.util.MixedCollection');
            me.items.addAll( items );
        }

        index = me.items.findIndex('itemId', key);

        return me.items.get( index ) || me.items.get( key );
    },


    listeners:
    {
        /**  @desc  вызываем "redraw" canvas'а только один раз после отрисовки каждого его дочернего спрайта */
        spriterendered: function(self)
        {
            var drawContainer;
            self._spriteRenderCounter += 1;

            if( self._spriteRenderCounter == self.getItems().length )
            {
                self._spriteRenderCounter = 0;
                drawContainer = self.up();
                drawContainer.initialRedraw();
            }
        }
    },


    /**  @private _spriteRenderCounter  */
    _spriteRenderCounter: 0


});