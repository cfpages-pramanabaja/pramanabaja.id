jQuery( document ).ready(function( $ ) {
	
	/**
	 * Keywords: Locations: Method
	 */
	$( 'body.page-generator-pro_page_page-generator-pro-keywords select[name="method"]' ).on( 'change.page-generator-pro', function() {

		switch ( $( this ).val() ) {
			case 'radius':
				$( 'div.radius' ).show();
				$( 'div.area' ).hide();

				// Enable the 'distance' option on order by
				$( 'select[name="orderby"] option[value="distance"]' ).removeAttr( 'disabled' );
				break;

			case 'area':
				$( 'div.radius' ).hide();
				$( 'div.area' ).show();

				// Disable the 'distance' option on order by
				$( 'select[name="orderby"] option[value="distance"]' ).attr( 'disabled', 'disabled' );
				break;
		}

	} );
	$( 'body.page-generator-pro_page_page-generator-pro-keywords select[name="method"]' ).trigger( 'change.page-generator-pro' );

	/**
	 * Keywords: Locations: Country
	 * - When the Country changes, reinitialize selectize instances, which will trigger them
	 * to fetch Counties and Regions for the newly selected Country
	 */
	$( 'body.page-generator-pro_page_page-generator-pro-keywords select[name="country_code"]' ).on( 'change.page-generator-pro', function() {

		// Destroy selectize instances
		page_generator_pro_destroy_selectize();

		// Reinitialize selectize instances
		page_generator_pro_reinit_selectize();

	} );
	$( 'body.page-generator-pro_page_page-generator-pro-keywords select[name="country_code"]' ).trigger( 'change.page-generator-pro' );

	/**
	 * Keywords: Locations: Generate
	 * - Uses AJAX to query the GeoRocket API with pagination to build a full resultset
	 */
	$( 'form#keywords-generate-locations' ).on( 'submit', function( e ) {

		// Prevent default action
		e.preventDefault();

		// Clear any JS error messages
		$( '.js-notices' ).html( '' );

		// Build form data to send in AJAX request
		var form_data = $( this ).serializeArray(),
			data = {};

		for ( var i = 0; i < form_data.length; i++ ) {
			// Skip some keys
			if ( form_data[ i ].name == '_wp_http_referer' ) {
				continue;
			}
			if ( form_data[ i ].name == 'page-generator-pro_nonce' ) {
				continue;
			}

			// If the key is an array, build it as an array
			switch ( form_data[ i ].name ) {
				case 'output_type[]':
				case 'region_id[]':
				case 'county_id[]':
				case 'city_id[]':
					var field = form_data[ i ].name.split( '[]' );
					if ( typeof data[ field[0] ] === 'undefined' ) {
						data[ field[0] ] = [ form_data[ i ].value ];
					} else {
						data[ field[0] ].push( form_data[ i ].value );
					}
					break;

				default:
					data[ form_data[ i ].name ] = form_data[ i ].value;
					break;
			}
		}
		data.action = 'page_generator_pro_keywords_generate_locations';

		// Make AJAX requests
		page_generator_pro_keywords_generate_locations_request( data, 1 );

	} );

} );

/**
 * Performs asynchronous requests to the GeoRocket API, fetching paginated
 * data, updating the UI to inform the user what is happening.
 *
 * @since 	1.8.3
 *
 * @param 	array 	data 	Form Data
 */
function page_generator_pro_keywords_generate_locations_request( data, request_count ) {

	// Show overlay and progress
	page_generator_pro_show_overlay_and_progress( page_generator_pro_keywords_generate_locations.titles.keywords_generate_location_request, page_generator_pro_keywords_generate_locations.messages.keywords_generate_location_request, request_count );

	// Perform AJAX query
	jQuery.ajax( {
        url: 		ajaxurl,
        type: 		'POST',
        async:    	true,
        data: 		data,
        error: function( a, b, c ) {

        	// Show error message and exit
        	return page_generator_pro_show_error_message_and_exit( page_generator_pro_keywords_generate_locations.messages.keywords_generate_location_error );

        },
        success: function( result ) {

        	// If an error occured, close the UI and show the error in the main screen
        	if ( ! result.success ) {
        		// Show error message and exit
        		return page_generator_pro_show_error_message_and_exit( result.data );
        	}

        	// Update progress UI
        	page_generator_pro_update_overlay_and_progress( page_generator_pro_keywords_generate_locations.messages.keywords_generate_location_response );

        	// Add the keyword ID to the data array, so it is sent in future requests
        	data.keyword_id = result.data.keyword_id;

        	// If there is a has_more flag, continue the requests
        	if ( typeof result.data.meta.has_more !== 'undefined' && result.data.meta.has_more === true ) {
        		// Update progress UI
        		page_generator_pro_update_overlay_and_progress( page_generator_pro_keywords_generate_locations.messages.keywords_generate_location_request_next );

        		// Update the start_id pagination parameter
        		data.start_id = result.data.meta.next_id;

        		// Increment request count
        		request_count = request_count + 1;

        		// Run the next request
        		page_generator_pro_keywords_generate_locations_request( data, request_count );
        	} else if ( typeof result.data.meta.last_page !== 'undefined' && result.data.meta.current_page < result.data.meta.last_page ) {
        		// Update progress UI
        		page_generator_pro_update_overlay_and_progress( page_generator_pro_keywords_generate_locations.messages.keywords_generate_location_request_next );

        		// Update the page pagination parameter
        		data.page = ( result.data.meta.current_page + 1 );

        		// Increment request count
        		request_count = request_count + 1;

        		// Run the next request
        		page_generator_pro_keywords_generate_locations_request( data, request_count );
        	} else {
        		// No more requests to be made
        		// Show success message and exit
        		return page_generator_pro_show_success_message_and_exit( page_generator_pro_keywords_generate_locations.messages.keywords_generate_location_success + ' <a href="' + result.data.keyword_url + '" target="_blank">View Keyword</a>' );
        	}

        }
    } );

}