jQuery( document ).ready(function( $ ) {

	/**
	 * Content Groups: Row Actions
	 * Content Groups: Actions Meta Box: Gutenberg
	 */
	$( 'body.page-generator-pro td.has-row-actions span a, body.page-generator-pro td.generated_count span a, body.page-generator-pro td.status span a, #page-generator-pro-actions-gutenberg-bottom span a' ).click( function( e ) {

		var action = $( this ).parent( 'span' ).attr( 'class' ),
			result = true,
			group_id = page_generator_pro_get_url_param( $( this ).attr( 'href' ), 'id' ),
			type = page_generator_pro_get_url_param( $( this ).attr( 'href' ), 'type' );

		// Check if a confirmation message exists for display
		var confirmation_message = page_generator_pro_generate_content.messages[ action + '_confirm' ];

		// Let the request through if we're not asking for a confirmation
		if ( typeof confirmation_message === 'undefined' ) {
			return true;
		}

		// Show confirmation dialog
		result = confirm( confirmation_message );

		// If the user cancels, bail
		if ( ! result ) {
			e.preventDefault();
			return false;
		}

		// Depending on the action, either use AJAX or let the request go through
		switch ( action ) {

			/**
			 * Test
			 */
			case 'test':
				// AJAX
				e.preventDefault();
				page_generator_pro_generate_content_test( group_id, type );
				break;

			/**
			 * Generate
			 */
			case 'generate':
				// Allow the request to go through
				break;

			/**
			 * Generate via CRON
			 */
			case 'generate_cron':
				// Allow the request to go through
				break;

			/**
			 * Cancel Generation
			 */
			case 'cancel_generation':
				// Allow the request to go through
				break;

			/**
			 * Trash
			 */
			case 'trash_generated_content':
				// AJAX
				e.preventDefault();
				page_generator_pro_generate_content_trash_generated_content( group_id, type );
				break;

			/**
			 * Delete
			 */
			case 'delete_generated_content':
				// AJAX
				e.preventDefault();
				page_generator_pro_generate_content_delete_generated_content( group_id, type );
				break;

		}

	} );

	/**
	 * Content Groups: Row Actions: Close
	 * Content Groups: Actions Meta Box: Gutenberg: Close
	 */
	$( 'body' ).on( 'click', '#page-generator-pro-progress button.close', function( e ) {

		e.preventDefault();

		page_generator_pro_hide_overlay_and_progress();

		return false;

	} );

	/**
	 * Generate: Custom Fields: Add
	 */
	$( 'a.add-custom-field' ).click( function( e ) {
		
		e.preventDefault();
		
		// Copy hidden element
		var element = $( 'div.hidden', $( this ).parent().parent().parent() );
		$( '#custom-fields' ).append( '<div class="option">' + $( element ).html() + '</div>' );

	} );

	/**
	 * Generate: Custom Fields: Delete
	 */
	$( document ).on( 'click', 'a.delete-custom-field', function( e ) {
		
		e.preventDefault();
		
		// Delete row
		$( this ).closest( 'div.option' ).remove();

	} );

	/**
	 * Generate: Custom Fields: Sort
	 */
	if ( $( '#custom-fields' ).length > 0) {
		$( '#custom-fields' ).sortable();
	}

	/**
	 * Generate: Deselect All Taxonomy Terms
	 */
	$( document ).on( 'click', 'a.deselect-all', function( e ) {

		e.preventDefault();

		$( 'input[type="checkbox"]', $( $( this ).data( 'list' ) ) ).prop( 'checked', false );

	} );

	/**
	 * Generate: Post Type Toggle
	 */
	$( 'select[name="page-generator-pro[type]"]' ).on( 'change.page-generator-pro', function( e ) {

		var post_type = $( this ).val();

		// Hide attributes, taxonomy and excerpt meta boxes and associated options within them
		$( '#page-generator-pro-attributes' ).hide();
		$( '#page-generator-pro-attributes div.option' ).hide();
		$( '#page-generator-pro-taxonomies' ).hide();
		$( '#page-generator-pro-taxonomies div.option' ).hide();
		$( '#page-generator-pro-excerpt' ).hide();
		$( '#page-generator-pro-excerpt div.option' ).hide();

		// Display Attributes Meta Box + Attribute Options
		// If no attribute options will be displayed for the selected Post Type, don't display the Attributes Meta Box
		if ( $( '#page-generator-pro-attributes div.option.' + post_type ).length > 0 ) {
			$( '#page-generator-pro-attributes' ).show();
			$( '#page-generator-pro-attributes div.option.' + post_type ).show();
		}

		// Display Taxonomies Meta Box + Taxonomy Options
		// If no taxonomy options will be displayed for the selected Post Type, don't display the Taxonomies Meta Box
		if ( $( '#page-generator-pro-taxonomies div.option.' + post_type ).length > 0 ) {
			$( '#page-generator-pro-taxonomies' ).show();
			$( '#page-generator-pro-taxonomies div.option.' + post_type ).show();
		}

		// Display Excerpt Meta Box + Excerpt Options
		// If no excerpt options will be displayed for the selected Post Type, don't display the Excerpt Meta Box
		if ( $( '#page-generator-pro-excerpt div.option.' + post_type ).length > 0 ) {
			$( '#page-generator-pro-excerpt' ).show();
			$( '#page-generator-pro-excerpt div.option.' + post_type ).show();
		}
		
	} );
	$( 'select[name="page-generator-pro[type]"]' ).trigger( 'change.page-generator-pro' );

	/**
	 * Generate: Status
	 */
	$( 'select[name="page-generator-pro[status]"]' ).on( 'change.page-generator-pro', function() {
		var status = $( this ).val();
		
		// Hide options
		$( 'div.future' ).hide();

		// Show options matching the chosen post type
		$( 'div.' + status ).show();
	} );
	$( 'select[name="page-generator-pro[status]"]' ).trigger( 'change.page-generator-pro' );

	/**
	 * Generate: Date
	 */
	$( 'select[name="page-generator-pro[date_option]"]' ).on( 'change.page-generator-pro', function() {
		var status = $( this ).val();

		// Hide options
		$( 'div.specific' ).hide();
		$( 'div.random' ).hide();
		
		// Show options matching the chosen date option
		$( 'div.' + status ).show();
	} );
	$( 'select[name="page-generator-pro[date_option]"]' ).trigger( 'change.page-generator-pro' );

	/**
	 * Generate: Featured Image
	 */
	$( 'select[name="page-generator-pro[featured_image_source]"]' ).on( 'change.page-generator-pro', function() {

		var source = $( this ).val();

		// Hide Featured Image options
		$( 'div.featured_image' ).hide();
		$( 'div.featured_image p.description' ).hide();

		// Depending on the Featured Image source, display some options
		switch ( source ) {

			/**
			 * Media Library
			 */
			case 'id':
				$( 'div.featured_image.id' ).show();
				$( 'div.featured_image.id p.description.' + source ).show();
				break;

			/**
			 * URL
			 */
			case 'url':
				$( 'div.featured_image.value' ).show();
				$( 'div.featured_image.value p.description.' + source ).show();
				
				$( 'div.featured_image.url' ).show();
				$( 'div.featured_image.url p.description.' + source ).show();
				break;

			case 'unsplash':
				$( 'div.featured_image.value' ).show();
				$( 'div.featured_image.value p.description.' + source ).show();

				$( 'div.featured_image.unsplash' ).show();
				$( 'div.featured_image.unsplash p.description.' + source ).show();

				$( 'div.featured_image.url' ).show();
				$( 'div.featured_image.url p.description.' + source ).show();
				break;

		}

	} );
	$( 'select[name="page-generator-pro[featured_image_source]"]' ).trigger( 'change.page-generator-pro' );

	/**
	 * Generate Terms: Taxonomy Toggle
	 */
	$( 'select[name="tax"]' ).on( 'change.page-generator-pro', function( e ) {

		var taxonomy = $( this ).val();

		// Show or hide the Parent Term depending on whether the chosen Taxonomy is hierarchical or not
		if ( page_generator_pro_generate_content.taxonomy_is_hierarchical[ taxonomy ] === true ) {
			// Show
			$( '.term-parent' ).show();
		} else {
			// Hide
			$( '.term-parent' ).hide();
		}
		
	} );
	$( 'select[name="tax"]' ).trigger( 'change.page-generator-pro' );

	/**
	 * Generate: Submit
	 */
	$( 'body.post-type-page-generator-pro form input[type=submit], body.taxonomy-page-generator-tax form input[type=submit]' ).click( function( e ) {

		// Prevent WordPress from throwing a dialog warning that changes will be lost
		$( window ).off( 'beforeunload.edit-post' );

		var action = $( this ).attr( 'name' ),
			result = true;

		// Check if a confirmation message exists for display
		var confirmation_message = page_generator_pro_generate_content.messages[ action + '_confirm' ];

		// Let the request through if we're not asking for a confirmation
		if ( typeof confirmation_message === 'undefined' ) {
			return true;
		}

		// Show confirmation dialog
		result = confirm( confirmation_message );

		if ( ! result ) {
			e.preventDefault();
			return false;
		}

	} );

	/**
	 * TinyMCE: Google Maps: Map Type Toggle
	 */
	$( 'body' ).on( 'change.page-generator-pro', 'form.wpzinc-tinymce-popup select[name="maptype"]', function( e ) {

		// Get Map Type
		var map_type = $( this ).val(),
			form = $( this ).closest( 'form.wpzinc-tinymce-popup' ),
			destination = $( 'input[name="destination"]', $( form ) ).closest( '.option' ),
			country_code = $( 'select[name="country_code"]', $( form ) ).closest( '.option' ),
			term = $( 'input[name="term"]', $( form ) ).closest( '.option' );

		// Hide all options
		$( destination ).hide();
		$( country_code ).hide();
		$( term ).hide();

		switch ( map_type ) {
			case 'roadmap':
				$( term ).show();
				break;

			case 'satellite':
				$( term ).show();
				break;

			case 'directions':
				$( destination ).show();
				break;

			case 'streetview':
				$( country_code ).show();
				break;
		}

	} );
	$( 'form.wpzinc-tinymce-popup select[name="maptype"]' ).trigger( 'change.page-generator-pro' );

} );

/**
 * Returns the value of the given URL parameter
 *
 * @since 	1.8.7
 *
 * @param 	string 	url 	URL
 * @param 	string 	name 	Parameter Name
 * @return 	string 			Parameter Value
 */
function page_generator_pro_get_url_param( url, name ) {

    name = name.replace( /[\[]/, '\\[' ).replace (/[\]]/, '\\]' );
    var regex = new RegExp( '[\\?&]' + name + '=([^&#]*)' );
    var results = regex.exec( url );
    return results === null ? '' : decodeURIComponent( results[1].replace( /\+/g, ' ' ) );

}

/**
 * Performs an asynchronous request to generate a Test Page
 * when the user clicks and confirms the Test Button when editing
 * a Content Group.
 *
 * @since 	1.8.4
 *
 * @param 	int 	group_id 	Group ID
 * @param 	string 	type 		Type (content|term)
 */
function page_generator_pro_generate_content_test( group_id, type ) {

	// Show overlay and progress
	page_generator_pro_show_overlay_and_progress( 
		page_generator_pro_generate_content.titles.test,
		page_generator_pro_generate_content.messages.test,
		0
	);

	// Perform AJAX query
	jQuery.ajax( {
        url: 		ajaxurl,
        type: 		'POST',
        async:    	true,
        data: 		{
        	id: 		group_id,
            action: 	'page_generator_pro_generate_' + type, 
            test_mode: 	true,
        },
        error: function( a, b, c ) {

        	// Show error message and exit
        	return page_generator_pro_show_error_message( page_generator_pro_generate_content.messages.test_error );

        },
        success: function( result ) {

        	if ( ! result.success ) {
        		// Show error message and exit
        		return page_generator_pro_show_error_message( result.data );
        	}

        	// Build success message
        	// @TODO Get this working
        	message = 'Test Page Generated at: <a href="' + result.data.url + '" target="_blank">' + result.data.url + '</a>';
        	for ( i = 0; i < result.data.keywords_terms.length; i++ ) {
        		message += '<br />{' + result.data.keywords_terms[ i ] + '}: ' + result.data.keywords_terms[ i ];
        	}
            
    		// Show success message and exit
    		return page_generator_pro_show_success_message( message );
    	
        }
    } );

}

/**
 * Performs an asynchronous request to Trash Generated Content
 * when the user clicks and confirms the Trash Generated Content Button 
 * when editing a Content Group.
 *
 * @since 	1.9.1
 *
 * @param 	int 	group_id 	Group ID
 * @param 	string 	type 		Type (content|term)
 */
function page_generator_pro_generate_content_trash_generated_content( group_id, type ) {

	// Show overlay and progress
	page_generator_pro_show_overlay_and_progress( 
		page_generator_pro_generate_content.titles.trash_generated_content,
		page_generator_pro_generate_content.messages.trash_generated_content,
		1
	);

	// Perform AJAX query
	jQuery.ajax( {
        url: 		ajaxurl,
        type: 		'POST',
        async:    	true,
        data: 		{
        	id: 		group_id,
            action: 	'page_generator_pro_generate_' + type + '_trash_generated_' + type
        },
        error: function( a, b, c ) {

        	// Show error message and exit
        	return page_generator_pro_show_error_message( page_generator_pro_generate_content.messages.trash_generated_content_error );

        },
        success: function( result ) {

        	if ( ! result.success ) {
        		// Show error message and exit
        		return page_generator_pro_show_error_message( result.data );
        	}

    		// Show success message and exit
    		return page_generator_pro_show_success_message( page_generator_pro_generate_content.messages.trash_generated_content_success );
    	
        }
    } );

}


/**
 * Performs an asynchronous request to Delete Generated Content
 * when the user clicks and confirms the Delete Generated Content Button 
 * when editing a Content Group.
 *
 * @since 	1.8.4
 *
 * @param 	int 	group_id 	Group ID
 * @param 	string 	type 		Type (content|term)
 */
function page_generator_pro_generate_content_delete_generated_content( group_id, type ) {

	// Show overlay and progress
	page_generator_pro_show_overlay_and_progress( 
		page_generator_pro_generate_content.titles.delete_generated_content,
		page_generator_pro_generate_content.messages.delete_generated_content,
		1
	);

	// Perform AJAX query
	jQuery.ajax( {
        url: 		ajaxurl,
        type: 		'POST',
        async:    	true,
        data: 		{
        	id: 		group_id,
            action: 	'page_generator_pro_generate_' + type + '_delete_generated_' + type
        },
        error: function( a, b, c ) {

        	// Show error message and exit
        	return page_generator_pro_show_error_message( page_generator_pro_generate_content.messages.delete_generated_content_error );

        },
        success: function( result ) {

        	if ( ! result.success ) {
        		// Show error message and exit
        		return page_generator_pro_show_error_message( result.data );
        	}

    		// Show success message and exit
    		return page_generator_pro_show_success_message( page_generator_pro_generate_content.messages.delete_generated_content_success );
    	
        }
    } );

}