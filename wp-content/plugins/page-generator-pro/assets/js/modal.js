/**
 * Shows the overlay and progress modal.
 *
 * @since 	1.8.3
 *
 * @param 	string 	title 			Modal Title
 * @param 	string 	message 		Modal Message
 * @param 	int 	request_count 	Request Count
 */
function page_generator_pro_show_overlay_and_progress( title, message, request_count ) {

	// If the request_count is greater than zero, append it to the message
	if ( request_count > 0 ) {
		message = message + ' #' + request_count;
	}

	// Show overlay and progress UI
	jQuery( '#page-generator-pro-progress h2.title div.spinner' ).css( 'visibility', 'visible' );
	jQuery( '#page-generator-pro-progress h2.title span.text' ).text( title );
	jQuery( '#page-generator-pro-progress p.message' ).text( message );
	jQuery( '#page-generator-pro-progress div.notices' ).text( '' );
	jQuery( '#page-generator-pro-progress button.close' ).hide();
	jQuery( '#page-generator-pro-overlay, #page-generator-pro-progress' ).show();

}

/**
 * Update the progress modal.
 *
 * @since 	1.8.3
 *
 * @param 	string 	message 		Modal Message
 */
function page_generator_pro_update_overlay_and_progress( message ) {

	jQuery( '#page-generator-pro-progress p.message' ).text( message );

}

/**
 * Hides the overlay and progress modal.
 *
 * @since 	1.8.3
 */
function page_generator_pro_hide_overlay_and_progress() {

	jQuery( '#page-generator-pro-progress h2.title div.spinner' ).css( 'visibility', 'hidden' );
	jQuery( '#page-generator-pro-progress h2.title span.text' ).text( '' );
	jQuery( '#page-generator-pro-progress p.message' ).text( '' );
	jQuery( '#page-generator-pro-progress div.notices' ).text( '' );
	jQuery( '#page-generator-pro-progress button.close' ).hide();
	jQuery( '#page-generator-pro-overlay, #page-generator-pro-progress' ).hide();

}

/**
 * Displays a success message in the modal.
 *
 * @since 	1.8.3
 *
 * @param 	string 	message 	Message
 */
function page_generator_pro_show_success_message( message ) {

	jQuery( '#page-generator-pro-progress h2.title div.spinner' ).css( 'visibility', 'hidden' );
	jQuery( '#page-generator-pro-progress p.message' ).text( '' );
	jQuery( '#page-generator-pro-progress div.notices' ).html( '<div class="updated notice"><p>' + message + '</p></div>' );
	jQuery( '#page-generator-pro-progress button.close' ).show();

	return false;

}

/**
 * Displays an error message in the modal.
 *
 * @since 	1.8.3
 *
 * @param 	string 	message 	Message
 */
function page_generator_pro_show_error_message( message ) {

	jQuery( '#page-generator-pro-progress h2.title div.spinner' ).css( 'visibility', 'hidden' );
	jQuery( '#page-generator-pro-progress p.message' ).text( '' );
	jQuery( '#page-generator-pro-progress div.notices' ).html( '<div class="error notice"><p>' + message + '</p></div>' );
	jQuery( '#page-generator-pro-progress button.close' ).show();

	return false;

}

/**
 * Displays a success message in the main screen, hides the overlay and progress modal
 * and returns false, to prevent the calling script from making further AJAX calls.
 *
 * @since 	1.8.3
 *
 * @param 	string 	message 	Message
 */
function page_generator_pro_show_success_message_and_exit( message ) {

	// Define notice
	jQuery( '.js-notices' ).html( '<div class="updated notice"><p>' + message + '</p></div>' );

	// Scroll to notice
	jQuery( 'html,body' ).animate( {
		scrollTop: ( jQuery( '.js-notices' ).offset().top - 44 ) // wp admin bar = ~ 44px height
	} );

	// Close overlay
	page_generator_pro_hide_overlay_and_progress();

	return false;

}

/**
 * Displays an error message in the main screen, hides the overlay and progress modal
 * and returns false, to prevent the calling script from making further AJAX calls.
 *
 * @since 	1.8.3
 *
 * @param 	string 	message 	Message
 */
function page_generator_pro_show_error_message_and_exit( message ) {

	// Define notice
	jQuery( '.js-notices' ).html( '<div class="error notice"><p>' + message + '</p></div>' );

	// Scroll to notice
	jQuery( 'html,body' ).animate( {
		scrollTop: ( jQuery( '.js-notices' ).offset().top - 44 ) // wp admin bar = ~ 44px height
	} );

	// Close overlay
	page_generator_pro_hide_overlay_and_progress();

	return false;

}