/**
 * Based on the selected content, replaces words with spintax.
 *
 * @since 	1.7.9
 */
( function() {

	tinymce.PluginManager.add( 'page_generator_pro_spintax_generate', function( editor, url ) {

		// Add Button to Visual Editor Toolbar
		editor.addButton( 'page_generator_pro_spintax_generate', {
			title: 	'Automatically Generate Spintax from selected Text',
			image: 	url + '../../../images/icons/spintax.png',
			cmd: 	'page_generator_pro_spintax_generate',
		} );	

		// Load View when button clicked
		editor.addCommand( 'page_generator_pro_spintax_generate', function() {

			// Get selected content
			var content = tinyMCE.activeEditor.selection.getContent(); // .getNode() ?
			
			// Perform an AJAX call to load the modal's view
			jQuery.post(
	            ajaxurl,
	            {
	                'action': 'page_generator_pro_tinymce_spintax_generate',
	                'content': content
	            },
	            function( response ) {

	            	// Bail if an error occured
	            	if ( ! response.success ) {
	            		alert( response.data );
	            		return;
	            	}

	            	// Replace selected content with spintax version
	            	tinyMCE.activeEditor.selection.setContent( response.data );

	            }
	        );

		} );
	} );

} )();