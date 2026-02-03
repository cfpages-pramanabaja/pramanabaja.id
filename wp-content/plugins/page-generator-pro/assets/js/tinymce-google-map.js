/**
 * Initialises the Google Map modal popup by registering a button
 * in the TinyMCE instance.
 *
 * @since 	1.0.0
 */
( function() {

	tinymce.PluginManager.add( 'page_generator_pro_google_maps', function( editor, url ) {

		// Add Button to Visual Editor Toolbar
		editor.addButton( 'page_generator_pro_google_maps', {
			title: 	'Insert Google Map',
			image: 	url + '../../../images/icons/map.png',
			cmd: 	'page_generator_pro_google_maps',
		} );	

		// Load View when button clicked
		editor.addCommand( 'page_generator_pro_google_maps', function() {
			// Open the TinyMCE Modal
			editor.windowManager.open( {
				id: 	'page-generator-pro-modal-body',
				title: 	'Insert Google Map',
                width: 	600,
                height: 500,
                inline: 1,
                buttons:[],
            } );

			// Perform an AJAX call to load the modal's view
			jQuery.post( 
	            ajaxurl,
	            {
	                'action': 'page_generator_pro_output_tinymce_google_maps_modal'
	            },
	            function( response ) {
	            	// Inject HTML into modal
	            	jQuery( '#page-generator-pro-modal-body-body' ).html( response );

	            	// Trigger the change event stored in generate-content.js
	            	jQuery( 'form.wpzinc-tinymce-popup select[name="maptype"]' ).trigger( 'change.page-generator-pro' );

	            	// Reload autocomplete instances
	            	page_generator_pro_autocomplete_initialize();
	            }
	        );
		} );
	} );

} )();