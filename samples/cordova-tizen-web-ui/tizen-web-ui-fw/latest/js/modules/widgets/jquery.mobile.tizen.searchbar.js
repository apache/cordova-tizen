//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows searchbar, for text search
//>>label: Searchbar
//>>group: Tizen:Widgets

define( [
	'jquery',
	'../jquery.mobile.tizen.core',
	'./jquery.mobile.tizen.pagelayout'
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
 */
/*
* jQuery Mobile Framework : "textinput" plugin for text inputs, textareas
* Copyright (c) jQuery Project
* Licensed under the MIT license.
* http://jquery.org/license
* Authors: Jinhyuk Jun <jinhyuk.jun@samsung.com>
*          Wongi Lee <wongi11.lee@samsung.com>
*/

/**
 * Searchbar can be created using <input> element with type=search
 * <input type="search" name="search" id="search1" value=""  />
 *
 * Searchbar can be inserted 3 cases
 * content : seachbar behave same as content element
 * header : searchbar placed below title(header), It doesn't move when scrolling page
 * inside optionheader : Searchbar placed inside optionheader, searchbar can be seen only expand optionheader
 *
 * Examples:
 *
 *	HTML markup for creating Searchbar
 *		<input type="search"/>
 *
 *	How to make searchbar in content
 *		<input type="search" name="" id="" value=""  />
 *
 *	How to make cancel button in searchbar
 *		<div data-role="header" data-position ="fixed" >
 *			<h1>Searchbar</h1>
 *			<input type="search" data-cancel-btn=true name="" id="" value=""  />
 *		</div>
 *
 *	How to make icon in front of searchbar
 *		<div data-role="header" data-position ="fixed" >
 *			<h1>Searchbar</h1>
 *			<input type="search" data-icon="call" name="" id="" value=""  />
 *		</div>
*/

/**
	@class SearchBar
	The search bar widget is used to search for page content. This widget can be placed in the header, option header, or page content.

	To add a search bar widget to the application, use the following code:

		<label for="search-basic">Search Input:</label>
		<input type="search" name="search" id="searc-basic" value="" data-mini="true" />

	Tizen supports many search bar options as described in the jQueryMobile documentation for search bar options.
	The search bar can define callbacks for events as described in the jQueryMobile documentation for search bar events.
	You can use methods with the search bar as described in the jQueryMobile documentation for search bar methods.
*/

(function ( $, undefined ) {

	$.widget( "tizen.searchbar", $.mobile.widget, {
		options: {
			theme: null,
			initSelector: "input[type='search'],:jqmData(type='search'), input[type='tizen-search'],:jqmData(type='tizen-search')"
		},

		_create: function () {
			var input = this.element,
				o = this.options,
				theme = o.theme || $.mobile.getInheritedTheme( this.element, "c" ),
				themeclass  = " ui-body-" + theme,
				focusedEl,
				clearbtn,
				cancelbtn,
				defaultText,
				defaultTextClass,
				trimedText,
				newClassName,
				newStyle,
				newDiv,
				searchimage,
				inputedText,
				useCancelBtn = false,
				frontIcon = false;

			$( "label[for='" + input.attr( "id" ) + "']" ).addClass( "ui-input-text" );

			if ( typeof input[0].autocorrect !== "undefined" && !$.support.touchOverflow ) {
				// Set the attribute instead of the property just in case there
				// is code that attempts to make modifications via HTML.
				input[0].setAttribute( "autocorrect", "off" );
				input[0].setAttribute( "autocomplete", "off" );
			}

			focusedEl = input.wrap( "<div class='ui-input-search ui-shadow-inset ui-corner-all ui-btn-shadow" + themeclass + "'></div>" ).parent();

			if ( $( this.element ).data( "cancel-btn" ) === true ) {
				useCancelBtn = true;
				focusedEl.addClass( "ui-input-search-default" );
			}
			if ( $( this.element ).data( "icon" ) != undefined ) {
				frontIcon = true;
				focusedEl.addClass( "ui-search-bar-icon" );
			}

			clearbtn = $( "<a href='#' class='ui-input-clear' title='clear text'>clear text</a>" );

			clearbtn.on( "click", function (event) {
					if ( input.attr( "disabled" ) == "disabled" ) {
						return false;
					}
					input
						.val( "" )
						.trigger('change')
						.focus();
					event.preventDefault();
				})
				.appendTo( focusedEl )
				.buttonMarkup({
					icon: "deleteSearch",
					iconpos: "notext",
					corners: true,
					shadow: true
				});

			/* temporarily delete 06.28 Heeju Joo */
			/*function toggleClear() {
				setTimeout(function () {
					clearbtn.toggleClass( "ui-input-clear-hidden", !input.val()
				}, 0);
			}*/


			function showCancel() {
				focusedEl
					.addClass( "ui-input-search-default" )
					.removeClass( "ui-input-search-wide" );
				cancelbtn
					.addClass( "ui-btn-cancel-show" )
					.removeClass( "ui-btn-cancel-hide" );
			}

			function hideCancel() {
				focusedEl
					.addClass( "ui-input-search-wide" )
					.removeClass( "ui-input-search-default" );
				cancelbtn
					.addClass( "ui-btn-cancel-hide" )
					.removeClass( "ui-btn-cancel-show" );
			}

			function makeFrontIcon() {
				var IconStyle = $( input ).jqmData( "icon" ),
					frontIcon = $( "<div data-role='button' data-style='circle'></div>" );

				frontIcon
					.appendTo( focusedEl.parent() )
					.buttonMarkup( {
						icon: IconStyle,
						iconpos: "notext",
						corners: true,
						shadow: true
					} );
				frontIcon.addClass( "ui-btn-search-front-icon" );
			}
			/* temporarily delete - 06.28 Heeju Joo */
			/*toggleClear();

			input.bind( 'paste cut keyup focus change blur', toggleClear );
			*/

			/* N_SE-43150 when input get event "focus", it show clearbtn */
			input.bind( "focus", function() {
				clearbtn.css("display", "inline-block");
			});
			//SLP --start search bar with cancel button
			focusedEl.wrapAll( "<div class='input-search-bar'></div>" );
			searchimage = $("<div class='ui-image-search'></div>").appendTo( focusedEl );

			if ( frontIcon ) {
				makeFrontIcon();
			}

			if ( useCancelBtn ) {
				cancelbtn = $( "<div data-role='button' class='ui-input-cancel' title='clear text'>Cancel</div>" )
					.bind('click', function ( event ) {
						if ( input.attr( "disabled" ) == "disabled" ) {
							return false;
						}
						event.preventDefault();
						event.stopPropagation();

						input
							.val( "" )
							.trigger('change')
							.blur();

						if ( useCancelBtn ) {
							hideCancel();
						}
					} )
					.appendTo( focusedEl.parent() )
					.buttonMarkup( {
						iconpos: "cancel",
						corners: true,
						shadow: true
					} );
			}

			// Input Focused
			input
				.focus( function () {
					if ( input.attr( "disabled" ) == "disabled" ) {
						return false;
					}
					if ( useCancelBtn ) {
						showCancel();
					}
					focusedEl.addClass( $.mobile.focusClass );
				})
				.blur(function () {
					focusedEl.removeClass( $.mobile.focusClass );
				});

			// Default Text
			defaultText = input.jqmData( "default-text" );

			if ( ( defaultText != undefined ) && ( defaultText.length > 0 ) ) {
				defaultTextClass = "ui-input-default-text";
				trimedText = defaultText.replace(/\s/g, "");

				/* Make new class for default text string */
				newClassName = defaultTextClass + "-" + trimedText;
				newStyle = $( "<style>" + '.' + newClassName + ":after" + "{content:" + "'" + defaultText + "'" + "}" + "</style>" );
				$( 'html > head' ).append( newStyle );

				/* Make new empty <DIV> for default text */
				newDiv = $( "<div></div>" );

				/* Add class and append new div */
				newDiv.addClass( defaultTextClass );
				newDiv.addClass( newClassName );
				newDiv.tap( function ( event ) {
					input.blur();
					input.focus();
				} );

				input.parent().append( newDiv );

				/* When focus, default text will be hide. */
				input
					.focus( function () {
						input.parent().find( "div.ui-input-default-text" ).addClass( "ui-input-default-hidden" );
					} )
					.blur( function () {
						var inputedText = input.val();
						if ( inputedText.length > 0 ) {
							input.parent().find( "div.ui-input-default-text" ).addClass( "ui-input-default-hidden" );
						} else {
							input.parent().find( "div.ui-input-default-text" ).removeClass( "ui-input-default-hidden" );
						}
					} );
			}

			if ( !input.attr("placeholder") ) {
				input.attr( "placeholder", "Search" );
			}
		},

		disable: function () {
			this.element.attr( "disabled", true );
			this.element.parent().addClass( "ui-disabled" );
			$( this.element ).blur();
			this.element.parent().parent().find(".ui-input-cancel").addClass( "ui-disabled" );
		},

		enable: function () {
			this.element.attr( "disabled", false );
			this.element.parent().removeClass( "ui-disabled" );
			this.element.parent().parent().find(".ui-input-cancel").removeClass( "ui-disabled" );
			$( this.element ).focus();
		}
	} );

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$.tizen.searchbar.prototype.enhanceWithin( e.target );
	} );

}( jQuery ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
