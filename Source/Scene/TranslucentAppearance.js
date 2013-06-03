/*global define*/
define([
        '../Core/defaultValue',
        '../Renderer/BlendingState',
        './Material',
        './Appearance',
        '../Shaders/Appearances/DefaultAppearanceVS',
        '../Shaders/Appearances/DefaultAppearanceFS'
    ], function(
        defaultValue,
        BlendingState,
        Material,
        Appearance,
        DefaultAppearanceVS,
        DefaultAppearanceFS) {
    "use strict";

    /**
     * DOC_TBA
     */
    var TranslucentAppearance = function(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        /**
         * DOC_TBA
         */
        this.material = (typeof options.material !== 'undefined') ? options.material : Material.fromType(undefined, Material.ColorType);

        /**
         * DOC_TBA
         */
        this.vertexShaderSource = defaultValue(options.vertexShaderSource, DefaultAppearanceVS);

        /**
         * DOC_TBA
         */
        this.fragmentShaderSource = defaultValue(options.fragmentShaderSource, DefaultAppearanceFS);

        /**
         * DOC_TBA
         */
        this.renderState = defaultValue(options.renderState, {
            depthTest : {
                enabled : true
            },
            depthMask : false,
            blending : BlendingState.ALPHA_BLEND
        });
    };

    /**
     * DOC_TBA
     */
    TranslucentAppearance.prototype.getFragmentShaderSource = Appearance.prototype.getFragmentShaderSource;

    return TranslucentAppearance;
});