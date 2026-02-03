jQuery( document ).ready(function( $ ) {

	/**
	 * Selectize Instances: Freeform Input
	 */
	$( 'input.wpzinc-selectize-freeform' ).selectize( {
		delimiter: ',',
	    persist: false,
	    create: function( input ) {
	        return {
	            value: input,
	            text: input
	        }
	    }
	} );

	/**
	 * Selectize Instances: Simple
	 */
	$( 'select.wpzinc-selectize-drag-drop' ).selectize( {
		plugins: [ 'drag_drop' ],
	    delimiter: ',',
	    persist: false,
	    create: function( input ) {
	        return {
	            value: input,
	            text: input
	        };
	    }
	} ).on( 'change', function() {

		// If this selectize instance controls options in another <select>, do something now
		if ( typeof $( this ).data( 'controls' ) === 'undefined' ) {
			return;
		}

		var controls = $( this ).data( 'controls' );
		if ( controls.length === 0 ) {
			return;
		}

		// Get selected value(s)
		var values = $( this ).val();

		// Disable all options for the target control
		$( 'select[name="' + controls + '"] option' ).attr( 'disabled', 'disabled' );

		// Bail if no values selected
		if ( ! values ) {
			return;
		}

		// Iterate through values, enabling them for the target control
		for ( var i = 0; i < values.length; i++ ) {
			$( 'select[name="' + controls + '"] option[value="' + values[ i ] + '"]' ).removeAttr( 'disabled' );
		}

		// Fire the target control's change method, so any other options can be enabled / disabled now
		$( 'select[name="method"]' ).trigger( 'change.page-generator-pro' );
		
	} ).trigger( 'change' );

	/**
	 * Selectize Instances: WordPress AJAX Search
	 */
	$( 'select.wpzinc-selectize-search' ).each( function() {

		var action 			= $( this ).data( 'action' ),
			name_field 		= $( this ).data( 'name-field' ),
			value_field 	= $( this ).data( 'value-field' ),
			method 			= $( this ).data( 'method' ),
			output_fields 	= $( this ).data( 'output-fields' ).split( ',' ); // What to output as the label

		$( this ).selectize( {
		    delimiter: 		',',
		    valueField: 	value_field, // The value to store in the select when the form is submitted
		    labelField: 	name_field,  // What to display on the output?
		    searchField: 	name_field,  // For some reason, this has to be specified
		    options: 		[],
		    create: 		false,
		    render: {
		        option: function( item, escape ) {

		        	// Build string
		        	var output_string = [];
		        	for ( var i = 0; i < output_fields.length; i++ ) {
		        		output_string.push( item[ output_fields[ i ] ] );
		        	}

		        	// Return output
		        	return '<div>' + output_string.join( ', ' ) + '</div>';

		        }
		    },
		    load: function( query, callback ) {

		        // Bail if the query is too short
		        if ( ! query.length || query.length < 3 ) {
		        	return callback();
		        }

		       	// Send request to Plugin's AJAX endpoint to call Georocket
		       	$.ajax( {
			        url: 		ajaxurl,
			        type: 		method,
			        dataType: 	'json',
			        data: 	{
			            'action': 		action,
			            'query': 		query,
			        },
			        error: function() {

			            callback();

			        },
			        success: function( result ) {

			        	callback( result.data );

			        }
			    } );
		    }
		} );
	} );

	/**
	 * Selectize Instances: API
	 */
	$( 'select.wpzinc-selectize-api' ).each( function() {

		var selectize_instance = this;
		$( selectize_instance ).selectize( {
		    delimiter: 		',',
		    options: 		[],
		    create: 		false,
		    load: function( query, callback ) {

		    	var action 				= $( selectize_instance ).data( 'action' ), // WP Registered AJAX Action
					api_call 			= $( selectize_instance ).data( 'api-call' ), // The API Call to make (zipcodes, cities, regions, counties, countries)
					api_search_field 	= $( selectize_instance ).data( 'api-search-field' ) // The API Field to search
					api_fields 			= $( selectize_instance ).data( 'api-fields' ).split( ',' ); // Relative form fields to send in the AJAX request (e.g. region_id[],county_id[])
					country_code 		= $( selectize_instance ).data( 'country-code' ), // The field to fetch the country code from and include in the request
					output_fields 		= $( selectize_instance ).data( 'output-fields' ).split( ',' ); // What to store as the <option> label
					value_field 		= $( selectize_instance ).data( 'value-field' ); // What to store as the <option> value

		    	// Bail if the query is too short
		        if ( ! query.length || query.length < 3 ) {
		        	return callback();
		        }

		        // Build data
		        var data = {
		        	action: 			action,
		        	api_call: 			api_call,
		        	api_search_field: 	api_search_field,
		        	query: 				query,
		        	country_code: 		$( 'select[name="' + country_code + '"]' ).val(),
		        };

		        // Add relational field values to the data now
		        for ( i = 0; i < api_fields.length; i++ ) {
		        	data[ api_fields[ i ].replace( /[\[\]']+/g, '' ) ] = $( 'select[name="' + api_fields[ i ] + '"]' ).val();
				}

		        // Perform AJAX query to fetch data
				$.ajax( {
			        url: 		ajaxurl,
			        type: 		'POST',
			        async:    	true,
			        data: 		data,
			        error: function( a, b, c ) {

			        	// Show error message and exit
			        	return page_generator_pro_show_error_message_and_exit( 'err' );

			        },
			        success: function( result ) {

			        	// If an error occured, close the UI and show the error in the main screen
			        	if ( ! result.success ) {
			        		// Show error message and exit
			        		return page_generator_pro_show_error_message_and_exit( result.data.message );
			        	}

			        	// Build selectize compatible list of items
			        	var items = [];
			        	for ( i = 0; i < result.data.data.length; i++ ) {
			        		// Build text label
				        	var text_label = [];
				        	for ( var j = 0; j < output_fields.length; j++ ) {
				        		text_label.push( result.data.data[ i ][ output_fields[ j ] ] );
				        	}

				        	// Add item to selectize array of items
			        		items.push( {
			        			text: 	text_label.join( ', ' ),
			        			value: 	result.data.data[ i ][ value_field ]
			        		} );
			        	}

			        	// Load the items into the selectize instance
			        	callback( items );
			        }

			    } );

		    }
		} );
	} );

} );

/**
 * Initialize selectize instances
 */
function page_generator_pro_reinit_selectize() {

	(function( $ ) {
	
		/**
		 * Selectize Instances
		 * - County
		 * - Region
		 */
		$( 'select.wpzinc-selectize' ).each( function() {

			var selectize_instance 	= this,
				action 				= $( selectize_instance ).data( 'action' ), // WP Registered AJAX Action
				api_call 			= $( selectize_instance ).data( 'api-call' ), // The API Call to make (zipcodes, cities, regions, counties, countries)
				country_code 		= $( selectize_instance ).data( 'country-code' ); // The field to fetch the country code from and include in the request
				
			// Perform AJAX query to fetch data for this selectize instance, which will be either regions or counties
			$.ajax( {
		        url: 		ajaxurl,
		        type: 		'POST',
		        async:    	true,
		        data: 		{
		        	action: 		action,
		        	api_call: 		api_call,
		        	country_code: 	$( 'select[name="' + country_code + '"]' ).val(),
		        },
		        error: function( a, b, c ) {

		        	// Show error message and exit
		        	return page_generator_pro_show_error_message_and_exit( 'err' );

		        },
		        success: function( result ) {

		        	// Fetch output fields and value field
		        	var output_fields 		= $( selectize_instance ).data( 'output-fields' ).split( ',' ); // What to store as the <option> label
						value_field 		= $( selectize_instance ).data( 'value-field' ); // What to store as the <option> value

		        	// If an error occured, close the UI and show the error in the main screen
		        	if ( ! result.success ) {
		        		// Show error message and exit
		        		return page_generator_pro_show_error_message_and_exit( result.data.message );
		        	}

		        	// Build selectize compatible list of items
		        	var items = [];
		        	for ( i = 0; i < result.data.data.length; i++ ) {
		        		// Build text label
			        	var text_label = [];
			        	for ( var j = 0; j < output_fields.length; j++ ) {
			        		text_label.push( result.data.data[ i ][ output_fields[ j ] ] );
			        	}

			        	// Add item to selectize array of items
		        		items.push( {
		        			text: 	text_label.join( ', ' ),
		        			value: 	result.data.data[ i ][ value_field ]
		        		} );
		        	}

		        	// Init selectize
		        	$( selectize_instance ).selectize( {
					    options: 			items,
					    create: 			false,
					    delimiter: 			',',
					    load: 				function( query, callback ) {
					    	callback( items );
					    }
					} );
		        }

		    } );

		} );

	})( jQuery );

}

/**
 * Destroy all selectize instances
 *
 * @since 	1.0.0
 */
function page_generator_pro_destroy_selectize() {

	(function( $ ) {

		$( 'select.wpzinc-selectize' ).selectize().each( function() {
			this.selectize.destroy();
		} );

	})( jQuery );

}