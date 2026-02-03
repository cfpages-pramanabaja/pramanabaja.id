/**
 * Initialises the Related Links modal popup by registering a button
 * in the TinyMCE instance.
 *
 * @since 	1.0.0
 */
( function() {

	tinymce.PluginManager.add( 'page_generator_pro_related_links', function( editor, url ) {

		// Add Button to Visual Editor Toolbar
		editor.addButton( 'page_generator_pro_related_links', {
			title: 	'Insert Related Links',
			image: 	url + '../../../images/icons/related-links.png',
			cmd: 	'page_generator_pro_related_links',
		} );	

		// Load View when button clicked
		editor.addCommand( 'page_generator_pro_related_links', function() {
			// Open the TinyMCE Modal
			editor.windowManager.open( {
				id: 	'page-generator-pro-modal-body',
				title: 	'Insert Related Links',
                width: 	600,
                height: 560,
                inline: 1,
                buttons:[],
            } );

			// Perform an AJAX call to load the modal's view
			jQuery.post( 
	            ajaxurl,
	            {
	                'action': 'page_generator_pro_output_tinymce_related_links_modal'
	            },
	            function( response ) {
	            	// Inject HTML into modal
	            	jQuery( '#page-generator-pro-modal-body-body' ).html( response );
	            	
	            	// Reload autocomplete instances
	            	page_generator_pro_autocomplete_initialize();
	            }
	        );
		} );
	} );

} )();