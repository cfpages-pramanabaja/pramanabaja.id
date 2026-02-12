/**
 * Initialize autocomplete instances for Classic Editor
 * and Meta Boxes.
 *
 * @since 	1.9.7
 */
function page_generator_pro_autocomplete_initialize() {

	( function( $ ) {
		$( page_generator_pro_autocomplete.fields.join( ', ' ) ).each( function( e ) {
			// Destroy the autocomplete instance if it's already initialized on this element
			if ( $( this ).data( 'autocomplete' ) ) {
				$( this ).autocomplete( 'destroy' );
				$( this ).removeData( 'autocomplete' );
			}

			// Initialize autocomplete
			$( this )
				.on( 'keydown', function( event ) {
			        if ( event.keyCode === $.ui.keyCode.TAB && $( this ).autocomplete( 'instance' ).menu.active ) {
			          	event.preventDefault();
			        }
			    } )
				.autocomplete( {
	        		minLength: 0,
	    			source: function( request, response ) {
	    				response( $.ui.autocomplete.filter( page_generator_pro_autocomplete.keywords, request.term.split( /[ ,]+/ ).pop() ) );
	    			},
	        		focus: function() {
	          			return false;
			        },
			        select: function( event, ui ) {
			        	var terms = this.value.split( /[ ,]+/ );
			         	terms.pop();
			          	terms.push( ui.item.value );
			          	terms.push( "" );
			          	this.value = terms.join( " " );
			          	return false;
			        }
			    } );
		} );
	} )( jQuery );

}

/**
 * Initialize autocomplete instances when the page is ready
 *
 * @since 	1.9.7
 */
jQuery( document ).ready( function( $ ) {
	
	page_generator_pro_autocomplete_initialize();

} );

/**
 * Gutenberg Block Autocomplete
 *
 * @since 	2.0.2
 */
var pageGeneratorProKeywordAutocompleter = {

    name: 'keywords',
    triggerPrefix: '{',
    options: page_generator_pro_autocomplete.keywords,

    getOptionKeywords: function( option ) {

        return option;

    },

    /**
     * Returns the option label to display in the autocomplete
     * drop down.
     *
     * @since 	2.0.2
     *
     * @param 	object 	option 	Autocomplete Option
     * @return 	string 			Label
     */
    getOptionLabel: function( option ) {

        return option;

    },

    /**
     * Appends the returned content to the current block
     * that the user is editing, when the user clicks
     * the autocomplete option.
     *
     * @since 	2.0.2
     *
     * @param 	object 	option 	Chosen Autocomplete Option
     * @return 	string 			Value
     */
    getOptionCompletion: function( option ) {

        return option;

    },

};

/**
 * Append our Autocompleter to Gutenberg Blocks' Autocompleters
 *
 * @since 	2.0.2
 *
 * @param 	array 	completers 	Completers
 * @param 	string 	blockName	Block Name
 */
function appendPageGeneratorProAutocompleter( completers, blockName ) {

    return completers.concat( pageGeneratorProKeywordAutocompleter );

}

/**
 * Registers our Autocomplete Gutenberg Block Filter
 *
 * @since 	2.0.2
 */
wp.hooks.addFilter(
    'editor.Autocomplete.completers',
    'page-generator-pro/autocompleters/keywords',
    appendPageGeneratorProAutocompleter
);