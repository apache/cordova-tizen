//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Make words to selectable tokens
//>>label: Token textarea
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	'../jquery.mobile.tizen.core'
	], function ( jQuery ) {

//>>excludeEnd("jqmBuildExclude");

/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 *	Author: Kangsik Kim <kangsik81.kim@samsung.com>
 *				Minkyeong Kim <minkyeong.kim@samsung.com>
*/

/**
 *	The TokenTextArea widget changes a text item to a button. It can be comprised of a number of button widgets. 
 *	When a user types text and the text gets a specific event to change from a text to a button, 
 *	the input text is changed to a TokenTextArea widget.
 *	A user can add the TokenTextArea widget to a contact list, email list, or another list.
 *	The typical use of this widget is composing a number of contacts or phone numbers in a specific area of the screen.
 *
 *	HTML Attributes:
 *
 *		data-link : Represents the id of the page or the URL of other HTML file.
 *				The page contains data for the user, for example, an address book.
 *				If the value is null, anchor button doesn't work. (Default : null)
 *		data-label:	Provide a label for a user-guide. (Default : 'To : ')
 *		data-description : This attribute is managing message format.
 *				This message is displayed when widget status was changed to 'focusout'. (Default : '+ {0}')
 *
 *	APIs:
 *
 *		inputtext (  [string]  )
 *			: If argument is not exist, will get a string from inputbox.
 *			If argument is exist, will set a string to inputbox.
 *		select (  [number]  )
 *			: If no argument exists, gets a string of the selected block.
 *			If any button isn't selected on a token text area widget, this method returns "null" value.
 *			When a user call this method with an argument which is a number type,
 *			this method selects the button which is matched with the argument.
 *		add ( text, [number] )
 *			:  If second argument does not exist, will insert to a new button at last position.
 *			Insert a new button at indexed position. The position is decided by the second argument.
 *			"index of position" means that the position of inserting a new button is decided by the second argument on "add" method.
 *			For example, if a user call the method like this "add("Tizen", 2)",
 *			new button labed "Tizen" will be inserted on the third position.
 *		remove ( [number] )
 *			: If no argument exists, all buttons are removed.
 *			Remove a button at indexed position.
 *			The position is decided by the second argument. (index: index of button)
 *		length ( void )
 *			: Get a number of buttons.
 *		foucsIn ( void )
 *			: This method change a status to 'focusin'.
 *			This status is able to manage a widget.
 *		focusOut ( void )
 *			: Changes the focus status to 'focus out'.
 *			The status is not able to manage a widget.
 *			All buttons that contained in the widget are removed and
 *			summarized message is displayed.
 *		destroy ( void )
 *			: Remove all of the new DOM elements for the current widget that you created.
 *
 *	Events:
 *
 *		select : Occur when a button is selected.
 *		add : Occur when new button is inserted. (@since Tizen 2.1 deprecated, You can still use this event. But not recommended.)
 *		remove : Occur when a button is removed. (@since Tizen 2.1 deprecated, You can still use this event. But not recommended.)
 *
 *	Examples:
 *
 *		<div data-role="tokentextarea" data-label="To : " data-link="#pageId" data-description="+ {0}">
 *		</div>
 *
 */


/**
	@class TokenTextArea
	The TokenTextArea widget enables the user to enter text and convert it to a button. Each button that is created from entered text as a result of a change event forms a token text area widget. This widget is useful in composing an e-mail or SMS message to a group of addresses, each of which is a clickable item for more actions, such as copying, editing, or removing the address.

	To add a token text area widget to the application, use the following code:

		<div data-role="tokentextarea" data-label="To : " data-link="#pageId">
		</div>
*/

/**
	@property {String} data-label
	Sets a label as a guide for the user.
	For example, while composing an e-mail message, the 'To : ' label is a guide for the user to enter e-mail addresses.

		<div data-role="tokentextarea" data-label="To : ">
		</div>
*/

/**
	@property {String} data-decription
	Manages the message format.
	The message is displayed when the widget status changes to focus out

		<div data-role="tokentextarea" data-description=" + {0}">
		</div>
 */
/**
	@property {String} data-link
	Sets the ID of the page or the URL of other HTML file to which the button links.
	If the data-link is set with the URL of other HTML file, the 'dom-cache' option of both page - a page containing a Tokentextarea and a page in the target HTML file - must be set as 'true'.

		<div data-role="tokentextarea" data-link="#pageId">
		</div>

		<div data-role="tokentextarea" data-link="fileName.html" data-dom-cache="true">
		</div>
*/
/**
	@event select
	The select event is fired when a token text area widget button is selected:

		<div data-role="tokentextarea">
		</div>
		$(".selector").on("select", function(event, ui)
		{
			// Handle the select event
		});	
*/
/**
	@event add (@since Tizen 2.1 deprecated, You can still use this event. But not recommended.)
	The add event is fired when a token text area widget button is created:

		<div data-role="tokentextarea">
		</div>
		$(".selector").on("add", function(event, ui)
		{
			// Handle the add event
		});
*/
/**
	@event remove (@since Tizen 2.1 deprecated, You can still use this event. But not recommended.)
	The remove event is fired when a token text area widget button is removed:
	Restriction : "remove" event works under only "bind" event handling.

		<div data-role="tokentextarea">
		</div>
		$(".selector").bind("remove", function(event, ui)
		{
			// Handle the remove event
		});
*/
/**
	@method destroy
	The destroy method is used to remove in the current widget all the new DOM elements that you have created.

		<div data-role="tokentextarea">
		</div>
		$(".selector").tokentextarea("destroy");

	@since Tizen2.0
*/
/**
	@method inputText
	The inputText method is used to manage the widget input box text. If no parameter is set, the method gets the input box text. If a parameter is set, the parameter text is set in the input box.
	
		<div data-role="tokentextarea">
		</div>
		$(".selector").tokentextarea("inputText", [text]);
*/
/**
	@method select
	The select method is used to select a token text area widget button based on its index value. If no index value is defined, the method returns the string of the selected block. If there are no buttons present in the widget, the method returns null.

		<div data-role="tokentextarea">
		</div>
		$(".selector").tokentextarea("select", [index]);
*/
/**
	@method add
	The add method is used to add a new token text area widget button with the specified label text at the specified index position. If the index parameter is not defined, the widget button is added at the bottom of the list. For example, the $(".selector").tokentextarea("add", "Tizen", 2) method call creates a new widget button labeled 'Tizen' at the third position in the widget.

		<div data-role="tokentextarea">
		</div>
		$(".selector").tokentextarea("add", [text], [index]);
*/
/**
	@method remove
	The remove method is used to remove a token text area widget button at the specified index position. If the parameter is not defined, all the widget buttons are removed.

		<div data-role="tokentextarea">
		</div>
		$(".selector").tokentextarea("remove", [index]);
*/
/**
	@method length
	The length method is used to retrieve the number of buttons in the token text area widget:
		<div data-role="tokentextarea">
		</div>
		$(".selector").tokentextarea("length");
*/
/**
	@method focusIn
	The focusIn method is used to set the focus status to "focus in". This focus state enables the user to add or remove buttons in the token text area widget.

		<div data-role="tokentextarea">
		</div>
		$(".selector").tokentextarea("focusIn");
*/
/**
	@method focusOut
	The focusOut method is used to set the focus status to "focus out". In this focus state, the user cannot manage the buttons in the widget, all the buttons are removed, and a message is displayed.

		<div data-role="tokentextarea">
		</div>
		$(".selector").tokentextarea("focusOut");
*/
( function ( $, window, document, undefined ) {
	$.widget( "tizen.tokentextarea", $.mobile.widget, {
		_focusStatus : null,
		_items : null,
		_viewWidth : 0,
		_reservedWidth : 0,
		_currentWidth : 0,
		_fontSize : 0,
		_anchorWidth : 0,
		_labelWidth : 0,
		_marginWidth : 0,
		options : {
			label : "To : ",
			link : null,
			description : "+ {0}"
		},

		_create : function () {
			var self = this,
				$view = this.element,
				role = $view.jqmData( "role" ),
				option = this.options,
				className = "ui-tokentextarea-link",
				inputbox = $( document.createElement( "input" ) ),
				labeltag = $( document.createElement( "span" ) ),
				moreBlock = $( document.createElement( "a" ) );

			$view.hide().empty().addClass( "ui-" + role );

			// create a label tag.
			$( labeltag ).text( option.label ).addClass( "ui-tokentextarea-label" ).attr( "tabindex", 0 );
			$view.append( labeltag );

			// create a input tag
			$( inputbox ).addClass( "ui-tokentextarea-input ui-tokentextarea-input-visible ui-input-text ui-body-s" ).attr( "role", "textbox" );
			$view.append( inputbox );

			// create a anchor tag.
			if ( option.link === null || $.trim( option.link ).length < 1 || $( option.link ).length === 0 ) {
				className += "-dim";
			}
			$( moreBlock ).attr( "data-role", "button" )
				.buttonMarkup( {
					inline: true,
					icon: "plus",
					style: "circle"
				})
				.attr( { "href" : $.trim( option.link ), "tabindex" : 0 } )
				.addClass( "ui-tokentextarea-link-base" )
				.addClass( className )
				.find( "span.ui-btn-text" )
				.text( "Add recipient" );

			// append default htmlelements to main widget.
			$view.append( moreBlock );

			// bind a event
			this._bindEvents();
			self._focusStatus = "init";
			// display widget
			$view.show();

			// assign global variables
			self._viewWidth = $view.innerWidth();
			self._reservedWidth += self._calcBlockWidth( moreBlock );
			self._reservedWidth += self._calcBlockWidth( labeltag );
			self._fontSize = parseInt( $( moreBlock ).css( "font-size" ), 10 );
			self._currentWidth = self._reservedWidth;
			self._modifyInputBoxWidth();
		},

		// bind events
		_bindEvents : function () {
			var self = this,
				$view = self.element,
				option = self.options,
				inputbox = $view.find( ".ui-tokentextarea-input" ),
				moreBlock = $view.find( ".ui-tokentextarea-link-base" );

			// delegate a event to HTMLDivElement(each block).
			$view.delegate( "div", "click", function ( event ) {
				if ( $( this ).hasClass( "ui-tokentextarea-sblock" ) ) {
					// If block is selected, it will be removed.
					self._removeTextBlock();
				}

				var lockBlock = $view.find( "div.ui-tokentextarea-sblock" );
				if ( typeof lockBlock !== "undefined" ) {
					lockBlock.removeClass( "ui-tokentextarea-sblock" ).addClass( "ui-tokentextarea-block" );
				}
				$( this ).removeClass( "ui-tokentextarea-block" ).addClass( "ui-tokentextarea-sblock" );
				$view.trigger( "select" );
			});

			inputbox.bind( "keyup", function ( event ) {
				// 8  : backspace
				// 13 : Enter
				// 186 : semi-colon
				// 188 : comma
				var keyValue = event.keyCode,
					valueString = $( inputbox ).val(),
					valueStrings = [],
					index,
					isSeparator = false;

				if ( keyValue === 8 ) {
					if ( valueString.length === 0 ) {
						self._validateTargetBlock();
					}
				} else if ( keyValue === 13 || keyValue === 186 || keyValue === 188 ) {
					if ( valueString.length !== 0 ) {
						// split content by separators(',', ';')
						valueStrings = valueString.split ( /[,;]/ );
						for ( index = 0; index < valueStrings.length; index++ ) {
							if ( valueStrings[index].length !== 0 && valueStrings[index].replace( /\s/g, "" ).length !== 0 ) {
								self._addTextBlock( valueStrings[index] );
							}
						}
					}
					inputbox.val( "" );
					isSeparator = true;
				} else {
					self._unlockTextBlock();
				}

				return !isSeparator;
			});

			moreBlock.click( function () {
				if ( $( moreBlock ).hasClass( "ui-tokentextarea-link-dim" ) ) {
					return;
				}

				$( inputbox ).removeClass( "ui-tokentextarea-input-visible" ).addClass( "ui-tokentextarea-input-invisible" );

				$.mobile.changePage( option.link, {
					transition: "slide",
					reverse: false,
					changeHash: false
				});
			});

			$( document ).bind( "pagechange.mbe", function ( event ) {
				if ( $view.innerWidth() === 0 ) {
					return ;
				}
				self.refresh();
				$( inputbox ).removeClass( "ui-tokentextarea-input-invisible" ).addClass( "ui-tokentextarea-input-visible" );
			});

			$view.bind( "click", function ( event ) {
				if ( self._focusStatus === "focusOut" ) {
					self.focusIn();
				}
			});
		},

		// create a textbutton and append this button to parent layer.
		// @param arg1 : string
		// @param arg2 : index
		_addTextBlock : function ( messages, blockIndex ) {
			if ( arguments.length === 0 ) {
				return;
			}

			if ( !messages ) {
				return ;
			}

			var self = this,
				$view = self.element,
				content = messages,
				index = blockIndex,
				blocks = null,
				textBlock = null;

			if ( self._viewWidth === 0 ) {
				self._viewWidth = $view.innerWidth();
			}

			// Create a new text HTMLDivElement.
			textBlock = $( document.createElement( 'div' ) );

			textBlock.text( content ).addClass( "ui-tokentextarea-block" ).attr( { "aria-label" : "double tap to edit", "tabindex" : 0 } );
			textBlock.css( {'visibility': 'hidden'} );

			blocks = $view.find( "div" );
			if ( index !== null && index <= blocks.length ) {
				$( blocks[index] ).before( textBlock );
			} else {
				$view.find( ".ui-tokentextarea-input" ).before( textBlock );
			}

			textBlock = self._ellipsisTextBlock( textBlock );
			textBlock.css( {'visibility': 'visible'} );

			self._modifyInputBoxWidth();

			textBlock.hide();
			textBlock.fadeIn( "fast", function () {
				self._currentWidth += self._calcBlockWidth( textBlock );
				$view.trigger( "add" );
			});
		},

		_removeTextBlock : function () {
			var self = this,
				$view = this.element,
				lockBlock = $view.find( "div.ui-tokentextarea-sblock" ),
				_temp = null,
				_dummy = function () {};

			if ( lockBlock !== null && lockBlock.length > 0 ) {
				self._currentWidth -= self._calcBlockWidth( lockBlock );

				lockBlock.fadeOut( "fast", function () {
					lockBlock.remove();
					self._modifyInputBoxWidth();
				});

				this._eventRemoveCall = true;
				if ( $view[0].remove ) {
					_temp = $view[0].remove;
					$view[0].remove = _dummy;
				}
				$view.triggerHandler( "remove" );
				if ( _temp) {
					$view[0].remove = _temp;
				}
				this._eventRemoveCall = false;
			} else {
				$view.find( "div:last" ).removeClass( "ui-tokentextarea-block" ).addClass( "ui-tokentextarea-sblock" );
			}
		},

		_calcBlockWidth : function ( block ) {
			return $( block ).outerWidth( true );
		},

		_unlockTextBlock : function () {
			var $view = this.element,
				lockBlock = $view.find( "div.ui-tokentextarea-sblock" );
			if ( lockBlock ) {
				lockBlock.removeClass( "ui-tokentextarea-sblock" ).addClass( "ui-tokentextarea-block" );
			}
		},

		// call when remove text block by backspace key.
		_validateTargetBlock : function () {
			var self = this,
				$view = self.element,
				lastBlock = $view.find( "div:last" ),
				tmpBlock = null;

			if ( lastBlock.hasClass( "ui-tokentextarea-sblock" ) ) {
				self._removeTextBlock();
			} else {
				tmpBlock = $view.find( "div.ui-tokentextarea-sblock" );
				tmpBlock.removeClass( "ui-tokentextarea-sblock" ).addClass( "ui-tokentextarea-block" );
				lastBlock.removeClass( "ui-tokentextarea-block" ).addClass( "ui-tokentextarea-sblock" );
			}
		},

		_ellipsisTextBlock : function ( textBlock ) {
			var self = this,
				$view = self.element,
				maxWidth = self._viewWidth / 2;

			if ( self._calcBlockWidth( textBlock ) > maxWidth ) {
				$( textBlock ).width( maxWidth - self._marginWidth );
			}

			return textBlock;
		},

		_modifyInputBoxWidth : function () {
			var self = this,
				$view = self.element,
				margin = 0,
				labelWidth = 0,
				anchorWidth = 0,
				inputBoxWidth = 0,
				blocks = $view.find( "div" ),
				blockWidth = 0,
				index = 0,
				inputBoxMargin = 10,
				inputBox = $view.find( ".ui-tokentextarea-input" );

			if ( $view.width() === 0 ) {
				return;
			}

			if ( self._labelWidth === 0 ) {
				self._labelWidth = $view.find( ".ui-tokentextarea-label" ).outerWidth( true );
				self._anchorWidth = $view.find( ".ui-tokentextarea-link-base" ).outerWidth( true );
				self._marginWidth = parseInt( ( $( inputBox ).css( "margin-left" ) ), 10 );
				self._marginWidth += parseInt( ( $( inputBox ).css( "margin-right" ) ), 10 );
				self._viewWidth = $view.innerWidth();
			}

			margin = self._marginWidth;
			labelWidth = self._labelWidth;
			anchorWidth = self._anchorWidth;
			inputBoxWidth = self._viewWidth - labelWidth;

			for ( index = 0; index < blocks.length; index += 1 ) {
				blockWidth = self._calcBlockWidth( blocks[index] );

				if ( blockWidth >= inputBoxWidth + anchorWidth ) {
					if ( blockWidth >= inputBoxWidth ) {
						inputBoxWidth = self._viewWidth - blockWidth;
					} else {
						inputBoxWidth = self._viewWidth;
					}
				} else {
					if ( blockWidth > inputBoxWidth ) {
						inputBoxWidth = self._viewWidth - blockWidth;
					} else {
						inputBoxWidth -= blockWidth;
					}
				}
			}

			inputBoxWidth -= margin;
			if ( inputBoxWidth < anchorWidth * 2 ) {
				inputBoxWidth = self._viewWidth - margin;
			}
			$( inputBox ).width( inputBoxWidth - anchorWidth - inputBoxMargin );
		},

		_stringFormat : function ( expression ) {
			var pattern = null,
				message = expression,
				i = 0;
			for ( i = 1; i < arguments.length; i += 1 ) {
				pattern = "{" + ( i - 1 ) + "}";
				message = message.replace( pattern, arguments[i] );
			}
			return message;
		},

		_resizeBlocks : function () {
			var self = this,
				$view = self.element,
				blocks = $view.find( "div" ),
				index = 0;

			for ( index = 0 ; index < blocks.length ; index += 1 ) {
				$( blocks[index] ).css( "width", "auto" );
				blocks[index] = self._ellipsisTextBlock( blocks[index] );
			}
		},

		//---------------------------------------------------- //
		//					Public Method   //
		//----------------------------------------------------//
		//
		// Focus In Event
		//
		focusIn : function () {
			if ( this._focusStatus === "focusIn" ) {
				return;
			}

			var $view = this.element;

			$view.find( ".ui-tokentextarea-label" ).attr( "tabindex", 0 ).show();
			$view.find( ".ui-tokentextarea-desclabel" ).remove();
			$view.find( "div.ui-tokentextarea-sblock" ).removeClass( "ui-tokentextarea-sblock" ).addClass( "ui-tokentextarea-block" );
			$view.find( "div" ).attr( { "aria-label" : "double tap to edit", "tabindex" : 0 } ).show();
			$view.find( ".ui-tokentextarea-input" ).removeClass( "ui-tokentextarea-input-invisible" ).addClass( "ui-tokentextarea-input-visible" ).attr( "tabindex", 0 );
			$view.find( "a" ).attr( "tabindex", 0 ).show();

			// change focus state.
			this._modifyInputBoxWidth();
			this._focusStatus = "focusIn";
			$view.removeClass( "ui-tokentextarea-focusout" ).addClass( "ui-tokentextarea-focusin" ).removeAttr( "tabindex" );
			$view.find( ".ui-tokentextarea-input" ).focus();
		},

		focusOut : function () {
			if ( this._focusStatus === "focusOut" ) {
				return;
			}

			var self = this,
				$view = self.element,
				tempBlock = null,
				stateBlock = null,
				numBlock = null,
				statement = "",
				index = 0,
				lastIndex = 10,
				label = $view.find( ".ui-tokentextarea-label" ),
				more = $view.find( "span" ),
				blocks = $view.find( "div" ),
				currentWidth = $view.outerWidth( true ) - more.outerWidth( true ) - label.outerWidth( true ),
				blockWidth = 0;

			label.removeAttr( "tabindex" );
			$view.find( ".ui-tokentextarea-input" ).removeClass( "ui-tokentextarea-input-visible" ).addClass( "ui-tokentextarea-input-invisible" ).removeAttr( "tabindex" );
			$view.find( "a" ).removeAttr( "tabindex" ).hide();
			blocks.removeAttr( "aria-label" ).removeAttr( "tabindex" ).hide();

			currentWidth = currentWidth - self._reservedWidth;

			for ( index = 0; index < blocks.length; index++ ) {
				blockWidth = $( blocks[index] ).outerWidth( true );
				if ( currentWidth - blockWidth <= 0 ) {
					lastIndex = index - 1;
					break;
				}

				$( blocks[index] ).show();
				currentWidth -= blockWidth;
			}

			if ( lastIndex !== blocks.length ) {
				statement = self._stringFormat( self.options.description, blocks.length - lastIndex - 1 );
				tempBlock = $( document.createElement( 'span' ) );
				tempBlock.addClass( "ui-tokentextarea-desclabel" ).attr( { "aria-label" : "more, double tap to edit", "tabindex" : "-1" } );
				stateBlock = $( document.createElement( 'span' ) ).text( statement ).attr( "aria-hidden", "true" );
				numBlock = $( document.createElement( 'span' ) ).text( blocks.length - lastIndex - 1 ).attr( "aria-label", "and" ).css( "visibility", "hidden" );
				tempBlock.append( stateBlock );
				tempBlock.append( numBlock );
				$( blocks[lastIndex] ).after( tempBlock );
			}

			// update focus state
			this._focusStatus = "focusOut";
			$view.removeClass( "ui-tokentextarea-focusin" ).addClass( "ui-tokentextarea-focusout" ).attr( "tabindex", 0 );
		},

		inputText : function ( message ) {
			var $view = this.element;

			if ( arguments.length === 0 ) {
				return $view.find( ".ui-tokentextarea-input" ).val();
			}
			$view.find( ".ui-tokentextarea-input" ).val( message );
			return message;
		},

		select : function ( index ) {
			var $view = this.element,
				lockBlock = null,
				blocks = null;

			if ( this._focusStatus === "focusOut" ) {
				return;
			}

			if ( arguments.length === 0 ) {
				// return a selected block.
				lockBlock = $view.find( "div.ui-tokentextarea-sblock" );
				if ( lockBlock ) {
					return lockBlock.text();
				}
				return null;
			}
			// 1. unlock all blocks.
			this._unlockTextBlock();
			// 2. select pointed block.
			blocks = $view.find( "div" );
			if ( blocks.length > index ) {
				$( blocks[index] ).removeClass( "ui-tokentextarea-block" ).addClass( "ui-tokentextarea-sblock" );
				$view.trigger( "select" );
			}
			return null;
		},

		add : function ( message, position ) {
			if ( this._focusStatus === "focusOut" ) {
				return;
			}

			this._addTextBlock( message, position );
		},

		remove : function ( position ) {
			var self = this,
				$view = this.element,
				blocks = $view.find( "div" ),
				index = 0,
				_temp = null,
				_dummy = function () {};

			if ( this._focusStatus === "focusOut" ) {
				return;
			}

			if ( arguments.length === 0 ) {
				blocks.fadeOut( "fast", function () {
					blocks.remove();
					self._modifyInputBoxWidth();
					self._trigger( "clear" );
				});
			} else if ( !isNaN( position ) ) {
				// remove selected button
				index = ( ( position < blocks.length ) ? position : ( blocks.length - 1 ) );

				$( blocks[index] ).fadeOut( "fast", function () {
					$( blocks[index] ).remove();
					self._modifyInputBoxWidth();
				});

				this._eventRemoveCall = true;
				if ( $view[0].remove ) {
					_temp = $view[0].remove;
					$view[0].remove = _dummy;
				}
				$view.triggerHandler( "remove" );
				if ( _temp) {
					$view[0].remove = _temp;
				}
				this._eventRemoveCall = false;
			}
		},

		length : function () {
			return this.element.find( "div" ).length;
		},

		refresh : function () {
			var self = this,
				viewWidth = this.element.innerWidth();

			if ( viewWidth && self._viewWidth !== viewWidth ) {
				self._viewWidth = viewWidth;
			}
			self._resizeBlocks();
			self._modifyInputBoxWidth();
		},

		destroy : function () {
			var $view = this.element,
				_temp = null,
				_dummy = function () {};

			if ( this._eventRemoveCall ) {
				return;
			}

			$view.find( ".ui-tokentextarea-label" ).remove();
			$view.find( "div" ).undelegate( "click" ).remove();
			$view.find( "a" ).remove();
			$view.find( ".ui-tokentextarea-input" ).unbind( "keyup" ).remove();

			this._eventRemoveCall = true;
			if ( $view[0].remove ) {
				_temp = $view[0].remove;
				$view[0].remove = _dummy;
			}
			$view.remove();
			if ( _temp) {
				$view[0].remove = _temp;
			}
			this._eventRemoveCall = false;

			this._trigger( "destroy" );
		}
	});

	$( document ).bind( "pagecreate create", function () {
		$( ":jqmData(role='tokentextarea')" ).tokentextarea();
	});

	$( window ).bind( "resize", function () {
		$( ":jqmData(role='tokentextarea')" ).tokentextarea( "refresh" );
	});
} ( jQuery, window, document ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
