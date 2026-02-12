/**
 * Initialises Keyword Autocomplete for TinyMCE instances.
 *
 * @since 	1.0.0
 */
( function() {

	// Define key binds
	const DOWN_ARROW_KEY = 40;
	const UP_ARROW_KEY = 38;
	const ESC_KEY = 27;
	const ENTER_KEY = 13;
	const BACKSPACE = 8;
	const LEFT_CURLY_BRACE = 219;
	const RIGHT_CURLY_BRACE = 221;

	// Define key binds to ignore
	var keyBindsToIgnore = [
		DOWN_ARROW_KEY,
		UP_ARROW_KEY,
		ESC_KEY,
		ENTER_KEY
	];

	// Define triggers to open autocomplete
	var triggersToOpenAutoComplete = [
		LEFT_CURLY_BRACE
	];

	// Define trigger to close autocomplete
	var triggersToCloseAutoComplete = [
		RIGHT_CURLY_BRACE,
		ESC_KEY
	];

	// Define triggers as character codes
	var textToOpenAutoComplete = [
		'123'
	];

	// Create TinyMCE Plugin
	tinymce.create( 'tinymce.plugins.page_generator_pro_autocomplete', {

		init: function( editor ) {

			var autoCompleteDisplayed = false,
				autoCompleteContainer = createAutoComplete();

			/**
			 * Creates an unordered list comprising of all keywords that can be
			 * searched and displayed as a list.
			 *
			 * @since 	2.0.2
			 */
			function createAutoComplete() {

				// Define <ul>
				var ul = document.createElement( 'ul' );
				ul.setAttribute( 'class', 'page-generator-pro-tinymce-autocomplete' );

				// Define <li>'s, appending to <ul>
				for ( keyword of page_generator_pro_autocomplete.keywords ) {
					var li = document.createElement( 'li' );
					li.classList.add( 'displayed' );
					ul.appendChild( li );
					li.innerHTML = li.innerHTML + keyword;
				}

				// Append <ul> to body
				document.body.appendChild( ul );

				// Return <ul>
				return ul;

			}

			/**
			 * Shows the autocomplete list
			 *
			 * @since 	2.0.2
			 *
			 * @param 	tinymce 	editor 					Editor Object
			 * @param 	object 		autoCompleteContainer 	Autocomplete <ul> DOM Element
			 */
			function showAutoComplete( editor, autoCompleteContainer ) {

				// Get caret position, so we can determine precisely where to show the autocomplete list
				var caretPosition = getCaretPosition( editor );

				// Position autocomplete
				positionAutoComplete( autoCompleteContainer, caretPosition.top, caretPosition.left );

				// Display autocomplete
				autoCompleteContainer.classList.remove( 'displayed' );
				autoCompleteContainer.classList.add( 'displayed' );

				// Set flag that we're displaying autocomplete
				autoCompleteDisplayed = true;

			}

			/**
			 * Get the top and left position of the caret in the active editor, relative
			 * to the browser window.
			 *
			 * @since 	2.0.2
			 *
			 * @param 	tinymce 	editor 		Editor Object
			 * @return 	object 					Top and Left Position of Caret
			 */
			function getCaretPosition( editor ) {

				// Get the editor's container and toolbar elements
				var editorContainer = editor.getContainer();

				if ( editorContainer == null ) {
					return {
						top: 0,
						left: 0
					};
				}

				// Get editor toolbar
				var editorToolbar = editorContainer.getElementsByClassName( 'mce-toolbar-grp' )[0];

				// Get the editor position within the browser window (top + left), and
				var editorPositionWithinWindow = {
					top: editorContainer.getBoundingClientRect().top + window.scrollY,
					left: editorContainer.getBoundingClientRect().left + window.scrollX
				};

				// Get the caret position within the editor (top + left)
				var rects = editor.selection.getRng().getClientRects();
				var caretPositionWithinEditor = {
					top: ( rects.length > 0 ? rects[0].top : 0 ),
					left: ( rects.length > 0 ? rects[0].left : 0 ),
					height: ( rects.length > 0 ? rects[0].height : 0 ),
				};

				return {
					// Gives us the position directly below the caret
					top: editorPositionWithinWindow.top + editorToolbar.getBoundingClientRect().height + caretPositionWithinEditor.top + caretPositionWithinEditor.height,
					
					// Gives us the position on the caret
					left: editorPositionWithinWindow.left + caretPositionWithinEditor.left	
				}

			}

			/**
			 * Positions the autocomplete list to the given top and left position,
			 * relative to the browser window.
			 * The autocomplete list's CSS must define position:absolute
			 *
			 * @since 	2.0.2
			 *
			 * @param 	object 		autoCompleteContainer 	Autocomplete <ul> DOM Element
			 * @param 	int 		top 					Top Position, in pixels
			 * @param 	int 		left 					Left Position, in pixels
			 */
			function positionAutoComplete( autoCompleteContainer, top, left ) {

				autoCompleteContainer.style.marginTop = top + 'px';
				autoCompleteContainer.style.marginLeft = left + 'px';

			}

			/**
			 * Fetches the search word, from the last occurance of the opening trigger relative
			 * to the current caret / cursor position within the editor.
			 *
			 * @since 	2.0.2
			 *
			 * @param 	tinymce 	editor 		Editor Object
			 * @return 	string 					Search Word, including opening trigger
			 */
			function getSearchWord( editor ) {

				// Get the text from the editor, and the current caret position
				var text 			= ( editor.selection.getSel().focusNode == null ? "" : editor.selection.getSel().focusNode.nodeValue ),
					caretPosition 	= editor.selection.getSel().focusOffset,
					startPosition 	= 0;

				if ( text == null || text.length == 0 ) {
					return '';
				}

				// Go backwards from the current carat position to the start of the editor text, until we find
				// a trigger that opened the autocomplete list.
				for ( var i = caretPosition; i >= 0; i-- ) {
					// If this character matches a trigger that opened the autocomplete list, note the start
					// position of it and break the loop
					if ( textToOpenAutoComplete.indexOf( text.charCodeAt( i ).toString() ) != -1 ) {
						startPosition = i;
						break;
					}
				}

				// Extract the search from the text between the opening trigger and the current caret position
				var search = text.substr( startPosition, caretPosition - startPosition );

				// Return
				return {
					search: search,
					start: startPosition,
					end: caretPosition
				}

			}

			/**
			 * Filters the autocomplete list based on the given search input.
			 *
			 * @since 	2.0.2
			 *
			 * @param 	tinymce 	editor 					Editor Object
			 * @param 	object 		autoCompleteContainer 	Autocomplete <ul> DOM Element
			 */
			function filterAutoComplete( search, editor, autoCompleteContainer ) {

				// Iterate through list, showing / hiding options based on whether they match
				// the given search text
				var items = autoCompleteContainer.getElementsByTagName( 'li' );
				for ( var i = 0; i < ( items.length - 1 ); i++ ) {
					if ( items.item( i ).innerText.indexOf( search.search ) == -1 ) {
						// Hide
						items.item( i ).classList.remove( 'displayed' );
					} else {
						// Show
						items.item( i ).classList.add( 'displayed' );
					}
				}

			}

			/**
			 * Insert the autocomplete suggestion from the list into the editor content,
			 * based on the index given.
			 *
			 * @since 	2.0.2
			 *
			 * @param 	int 		index 					Autocomplete <li> index
			 * @param 	tinymce 	editor 					Editor Object
			 * @param 	object 		autoCompleteContainer 	Autocomplete <ul> DOM Element
			 */
			function insertAutoCompleteItemByIndex( index, editor, autoCompleteContainer ) {

				// Fetch autocomplete suggestion
				var text = autoCompleteContainer.getElementsByTagName( 'li' ).item( index ).innerText;

				// Insert the text into the editor
				insertAutoCompleteItemByText( text, editor, autoCompleteContainer );

			}

			/**
			 * Insert the text into the editor content.
			 *
			 * @since 	2.0.2
			 *
			 * @param 	string 		text 	Text
			 * @param 	tinymce 	editor 	Editor Object
			 */
			function insertAutoCompleteItemByText( text, editor ) {

				// Get search word, editor text and range
				var search = getSearchWord( editor ),
					editorText = editor.selection.getSel().focusNode,
					editorRange = editor.selection.getRng();

				// Select the search word
				editorRange.setStart( editorText, search.start );
				editorRange.setEnd( editorText, search.end );
				editor.selection.setRng( editorRange );

				// Insert autocomplete text into editor
				// This replaces the selected search word
				editor.selection.setContent( text );

			}

			/**
			 * Hides the autocomplete list, resetting anything within the list
			 *
			 * @since 	2.0.2
			 *
			 * @param 	tinymce 	editor 					Editor Object
			 * @param 	object 		autoCompleteContainer 	Autocomplete <ul> DOM Element
			 */
			function hideAutoComplete( editor, autoCompleteContainer ) {

				// Hide autocomplete
				autoCompleteContainer.classList.remove( 'displayed' );

				// Set flag that we're not displaying autocomplete
				autoCompleteDisplayed = false;

			}

			/**
			 * Shows or hides the autocomplete list, depending on whether the user presses
			 * a character 
			 *
			 * @since 	2.0.2
			 *
			 * @param 	tinymce 	editor 		Editor Instance
			 * @param 	object 		event 		Event 
			 */
			function keyDownEvent( editor, event ) {

				// If the user types a character that will trigger opening autocomplete, and we're not
				// displaying autocomplete, show it now
				if ( triggersToOpenAutoComplete.indexOf( event.keyCode ) != -1 && ! autoCompleteDisplayed ) {
					showAutoComplete( editor, autoCompleteContainer );
					return;
				}

				// If the user types a character that will close the autocomplete, and we're
				// displaying autocomplete, hide it now
				if ( triggersToCloseAutoComplete.indexOf( event.keyCode ) != -1 && autoCompleteDisplayed ) {
					hideAutoComplete( editor, autoCompleteContainer );
					return;
				}

				// If autocomplete is displayed and the user presses enter, add the first displayed result in the list
				// to the editor, and close the autocomplete list.
				if ( autoCompleteDisplayed && ENTER_KEY == event.keyCode ) {
					// Prevent the enter event propagating to the editor instance
					tinymce.dom.Event.cancel( event );

					// Insert the first autocomplete item into the editor
					insertAutoCompleteItemByIndex( 0, editor, autoCompleteContainer );

					// Hide the autocomplete list
					hideAutoComplete( editor, autoCompleteContainer );
					return;
				}

			}

			/**
			 * Filters the autocomplete list, if displayed, and the user types
			 *
			 * @since 	2.0.2
			 *
			 * @param 	tinymce 	editor 		Editor Instance
			 * @param 	object 		event 		Event 
			 */
			function keyUpEvent( editor, event ) {

				// If autocomplete is displayed and the user hasn't typed a character that we're ignoring,
				// filter the results list
				if ( keyBindsToIgnore.indexOf( event.keyCode ) == -1 && autoCompleteDisplayed ) {
					// Reposition the autocomplete list
					showAutoComplete( editor, autoCompleteContainer );

					// Get search word from the opening trigger to the caret
					var search = getSearchWord( editor );

					// Filter the autocomplete list based on the search term
					filterAutoComplete( search, editor, autoCompleteContainer );
				}

			}

			/**
			 * Listens to all click events in the editor instance.
			 *
			 * @since 	2.0.2
			 *
			 * @param 	tinymce 	editor 		Editor Instance
			 * @param 	object 		event 		Event 
			 */
			function clickEventInEditor( editor, event ) {

				// Hide the autocomplete list
				hideAutoComplete( editor, autoCompleteContainer );
	
			}

			/**
			 * Listens to all click events in the DOM, outside of the editor instance.
			 *
			 * @since 	2.0.2
			 *
			 * @param 	object 		event 		Event 
			 */
			function clickEvent( event ) {

				// Hide the autocomplete list if the user clicked outside of it
				if ( ! event.target.matches( 'li.displayed' ) ) {
					hideAutoComplete( editor, autoCompleteContainer );
					return;
				}

				// If here, the user clicked an autocomplete list item
				// Insert that item's text into the editor
				insertAutoCompleteItemByText( event.target.innerText, editor );

				// Hide the autocomplete list
				hideAutoComplete( editor, autoCompleteContainer );

			}

			// Bind events to TinyMCE Editor instance
			editor.onKeyDown.add( keyUpEvent );
			editor.onKeyDown.add( keyDownEvent );
			editor.onClick.add( clickEventInEditor );

			// Bind events to DOM (outside editor)
			document.addEventListener( 'click', clickEvent );

		},

		getInfo: function () {
			return {
				longname: 	'Page Generator Pro: Autocomplete',
				author: 	'WP Zinc',
				authorurl: 	'https://www.wpzinc.com/',
				infourl: 	'https://www.wpzinc.com/',
				version: 	tinymce.majorVersion + '.' + tinymce.minorVersion
			};
		}

	} );

	tinymce.PluginManager.add( 'page_generator_pro_autocomplete', tinymce.plugins.page_generator_pro_autocomplete );

} )();