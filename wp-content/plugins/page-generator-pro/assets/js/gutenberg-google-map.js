( function( blocks, editor, element ) {

    const __ = wp.i18n.__;

    blocks.registerBlockType( 'page-generator-pro/google-map', {
        title:      __( 'Google Map', 'page-generator-pro' ),
        icon:       'universal-access-alt',
        category:   'layout',
        keywords: [
            __( 'Google Map', 'page-generator-pro' ),
            __( 'Google', 'page-generator-pro' ),
            __( 'Map', 'page-generator-pro' ),
        ],

        // Define the shortcode attributes
        attributes: {
            maptype: {
                type: 'string',
            },
            location: {
                type: 'string',
            },
            destination: {
                type: 'string',
            },
            country_code: {
                type: 'string',
            },
            term: {
                type: 'string',
            },
            height: {
                type: 'string',
            },
            zoom: {
                type: 'string',
            },
        },
   
        /**
         * Gutenberg Editor
         */
        edit: function( props ) {

            var fields = [];

            // Map Type
            fields.push(
                element.createElement(
                    'label',
                    {},
                    __( 'Map Type', 'page-generator-pro' )
                )
            );
            fields.push(
                element.createElement(
                    editor.PlainText,
                    {
                        className: props.ClassName,
                        value: props.attributes.maptype,
                        onChange: function( value ) {
                            props.setAttributes( {
                                maptype: value
                            } );
                        }
                    }
                )
            );

            return fields;

        },

        /**
         * Frontend Output
         */
        save: function( props ) {

            // Build shortcode key/value array
            var shortcodeAttributes = '';
            for( const key in props.attributes ) {
                // Skip if the attribute is undefined
                if ( typeof props.attributes[ key ] == 'undefined' ) {
                    continue;
                }

                // Skip if the attribute is blank
                if ( props.attributes[ key ].length == 0 ) {
                    continue;
                }

                // Add this key/value pair to the shortcode attributes
                shortcodeAttributes += ' ' + key + '="' + props.attributes[ key ] + '"';
            }

            console.log( shortcodeAttributes );

            // If we have no shortcode attributes, return a blank string
            if ( shortcodeAttributes.length == 0 ) {
                return '';
            }

            // Return the shortcode
            return '[page-generator-pro-google-map' + shortcodeAttributes + ']';

        }
    } );

} (
    window.wp.blocks,
    window.wp.editor,
    window.wp.element
) );