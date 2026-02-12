// Determine if Gutenberg is active
page_generator_pro_gutenberg_active = ( ( typeof wp.data !== 'undefined' && typeof wp.data.dispatch( 'core/edit-post' ) !== 'undefined' ) ? true : false );

if ( page_generator_pro_gutenberg_active ) {
	// Remove the Permalink Panel, if we're using Gutenberg
	wp.data.dispatch( 'core/edit-post' ).removeEditorPanel( 'post-link' );

	// Register our Shortcodes as Blocks
	if ( typeof page_generator_pro_gutenberg != 'undefined' ) {
		for ( const shortcode in page_generator_pro_gutenberg.shortcodes ) {

			// Fetch Shortcode Properties
			var shortcodeProperties = page_generator_pro_gutenberg.shortcodes[ shortcode ];

			// Build Gutenberg compliant Attributes object
			var shortcodeAttributes = {};
			for ( const attribute in shortcodeProperties.attributes ) {
				shortcodeAttributes[ attribute ] = {
					type: 'string'
				}
			}

			// Register Block
			( function( blocks, editor, element ) {

			    blocks.registerBlockType( 'page-generator-pro/' + shortcode, {
			        title:      shortcodeProperties.title,
			        icon:       shortcodeProperties.icon,
			        category:   shortcodeProperties.category,
			        keywords: 	shortcodeProperties.keywords,

			        // Define the shortcode attributes
			        attributes: shortcodeAttributes,
			   
			        // Editor
			        edit: function( props ) {

			        	// Build fields based on attributes
			            var fields = [];
			            for ( const attribute in shortcodeProperties.attributes ) {
			            	fields.push(
				                element.createElement(
				                    'label',
				                    {
				                    	key: attribute + '_label',
				                    },
				                    shortcodeProperties.attributes[ attribute ].label
				                )
				            );
				            fields.push(
				                element.createElement(
				                    editor.PlainText,
				                    {
				                        className: props.ClassName,
				                        key: attribute,
				                        value: props.attributes[ attribute ],
				                        onChange: function( value ) {
				                        	var newValue = {};
				                        	newValue[ attribute ] = value;
				                            props.setAttributes( newValue );
				                        }
				                    }
				                )
				            );
			            }
	
			            return fields;

			        },

			        // Output
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

			                // Skip if the key is one that is a Gutenberg added key
			                if ( key == 'className' ) {
			                	continue;
			                }

			                // Add this key/value pair to the shortcode attributes
			                shortcodeAttributes += ' ' + key + '="' + props.attributes[ key ] + '"';
			            }

			            // If we have no shortcode attributes, return a blank string
			            if ( shortcodeAttributes.length == 0 ) {
			                return '';
			            }

			            // Return the shortcode
			            console.log( '[page-generator-pro-' + shortcode + shortcodeAttributes + ']' );
			            return '[page-generator-pro-' + shortcode + shortcodeAttributes + ']';

			        }
			    } );

			} (
			    window.wp.blocks,
			    window.wp.editor,
			    window.wp.element
			) );

		}
	}
}