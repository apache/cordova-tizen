//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows list index and scroll to the index directly
//>>label: Fastscroll
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	'../jquery.mobile.tizen.scrollview'
	], function ( jQuery ) {

//>>excludeEnd("jqmBuildExclude");

/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
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
 * Authors: Elliot Smith <elliot.smith@intel.com>
 *		 Yonghwi Park <yonghwi0324.park@samsung.com>
 */

// fastscroll is a scrollview controller, which binds
// a scrollview to a a list of short cuts; the shortcuts are built
// from the text on dividers in the list. Clicking on a shortcut
// instantaneously jumps the scrollview to the selected list divider;
// mouse movements on the shortcut column move the scrollview to the
// list divider matching the text currently under the touch; a popup
// with the text currently under the touch is also displayed.
//
// To apply, add the attribute data-fastscroll="true" to a listview
// (a <ul> or <ol> element inside a page). Alternatively, call
// fastscroll() on an element.
//
// The closest element with class ui-scrollview-clip is used as the
// scrollview to be controlled.
//
// If a listview has no dividers or a single divider, the widget won't
// display.

/**
	@class fastscroll
	The shortcut scroll widget shows a shortcut list that is bound to its parent scroll bar and respective list view. This widget is displayed as a text pop-up representing shortcuts to different list dividers in the list view. If you select a shortcut text from the shortcut scroll, the parent list view is moved to the location representing the selected shortcut.

	To add a shortcut scroll widget to the application, use the following code:

		<div class="content" data-role="content" data-scroll="y">
			<ul id="contacts" data-role="listview" data-fastscroll="true">
				<li>Anton</li>
			</ul>
		</div>

	For the shortcut scroll widget to be visible, the parent list view must have multiple list dividers.
*/

/**
	@property {Boolean}  data-fastscroll
	When set to true, creates a shortcut scroll using the HTML unordered list (&lt;ul&gt;) element.
*/
/**
	@method fastscroll
	The shortcut scroll is created for the closest list view with the ui-scrollview-clip class.
*/
/**
	@method indexString
	The indexString method is used to get (if no value is defined) or set the string to present the index.

		<div class="content" data-role="content" data-scroll="y">
			ul id="contacts" data-role="listview" data-fastscroll="true">
				<li data-role="list-divider">A</li>
				<li>Anton</li>
			</ul>
		</div>

		$(".selector").fastscroll( "indexString" [, indexAlphabet] );
*/
(function ( $, undefined ) {

	$.widget( "tizen.fastscroll", $.mobile.widget, {
		options: {
			initSelector: ":jqmData(fastscroll)"
		},

		_primaryLanguage: null,
		_secondLanguage: null,
		_dividerMap: {},
		_charSet: null,

		_create: function () {
			var $el = this.element,
				self = this,
				$popup,
				page = $el.closest( ':jqmData(role="page")' ),
				jumpToDivider;

			this.scrollview = $el.addClass( 'ui-fastscroll-target' ).closest( '.ui-scrollview-clip' );
			this.shortcutsContainer = $( '<div class="ui-fastscroll" aria-label="Fast scroll bar, double tap to fast scroll mode" tabindex="0"/>' );
			this.shortcutsList = $( '<ul aria-hidden="true"></ul>' );

			// popup for the hovering character
			this.scrollview.append($( '<div class="ui-fastscroll-popup"></div>' ) );
			$popup = this.scrollview.find( '.ui-fastscroll-popup' );

			this.shortcutsContainer.append( this.shortcutsList );
			this.scrollview.append( this.shortcutsContainer );

			// find the bottom of the last item in the listview
			this.lastListItem = $el.children().last();

			// remove scrollbars from scrollview
			this.scrollview.find( '.ui-scrollbar' ).hide();

			this.jumpToDivider = function ( divider ) {
				// get the vertical position of the divider (so we can scroll to it)
				var dividerY = $( divider ).position().top,
					// find the bottom of the last list item
					bottomOffset = self.lastListItem.outerHeight( true ) + self.lastListItem.position().top,
					scrollviewHeight = self.scrollview.height(),

				// check that after the candidate scroll, the bottom of the
				// last item will still be at the bottom of the scroll view
				// and not some way up the page
					maxScroll = bottomOffset - scrollviewHeight,
					dstOffset;

				dividerY = ( dividerY > maxScroll ? maxScroll : dividerY );

				// don't apply a negative scroll, as this means the
				// divider should already be visible
				dividerY = Math.max( dividerY, 0 );

				// apply the scroll
				self.scrollview.scrollview( 'scrollTo', 0, -dividerY );

				dstOffset = self.scrollview.offset();
			};

			this.shortcutsList
			// bind mouse over so it moves the scroller to the divider
				.bind( 'touchstart mousedown vmousedown touchmove vmousemove vmouseover', function ( e ) {
					// Get coords relative to the element
					var coords = $.mobile.tizen.targetRelativeCoordsFromEvent( e ),
						shortcutsListOffset = self.shortcutsList.offset();

					self.shortcutsContainer.addClass( "ui-fastscroll-hover" );

					// If the element is a list item, get coordinates relative to the shortcuts list
					if ( e.target.tagName.toLowerCase() === "li" ) {
						coords.x += $( e.target ).offset().left - shortcutsListOffset.left;
						coords.y += $( e.target ).offset().top  - shortcutsListOffset.top;
					}

					if ( e.target.tagName.toLowerCase() === "span" ) {
						coords.x += $( e.target ).parent().offset().left - shortcutsListOffset.left;
						coords.y += $( e.target ).parent().offset().top  - shortcutsListOffset.top;
					}

					self.shortcutsList.find( 'li' ).each( function () {
						var listItem = $( this );
						$( listItem )
							.removeClass( "ui-fastscroll-hover" )
							.removeClass( "ui-fastscroll-hover-down" );
					});
					// Hit test each list item
					self.shortcutsList.find( 'li' ).each( function () {
						var listItem = $( this ),
							l = listItem.offset().left - shortcutsListOffset.left,
							t = listItem.offset().top  - shortcutsListOffset.top,
							r = l + Math.abs(listItem.outerWidth( true ) ),
							b = t + Math.abs(listItem.outerHeight( true ) ),
							unit,
							baseTop,
							baseBottom,
							omitSet,
							i;

						if ( coords.x >= l && coords.x <= r && coords.y >= t && coords.y <= b ) {
							if ( listItem.text() !== "." ) {
								self._hitItem( listItem );
							} else {
								omitSet = listItem.data( "omitSet" );
								unit = ( b - t ) / omitSet.length;
								for ( i = 0; i < omitSet.length; i++ ) {
									baseTop = t + ( i * unit );
									baseBottom = baseTop + unit;
									if ( coords.y >= baseTop && coords.y <= baseBottom ) {
										self._hitOmitItem( listItem, omitSet.charAt( i ) );
									}
								}
							}
							return false;
						}
						return true;
					} );

					e.preventDefault();
					e.stopPropagation();
				} )
				// bind mouseout of the fastscroll container to remove popup
				.bind( 'touchend mouseup vmouseup vmouseout', function () {
					$popup.hide();
					$( ".ui-fastscroll-hover" ).removeClass( "ui-fastscroll-hover" );
					$( ".ui-fastscroll-hover-first-item" ).removeClass( "ui-fastscroll-hover-first-item" );
					$( ".ui-fastscroll-hover-down" ).removeClass( "ui-fastscroll-hover-down" );
					self.shortcutsContainer.removeClass( "ui-fastscroll-hover" );
				} );

			if ( page && !( page.is( ':visible' ) ) ) {
				page.bind( 'pageshow', function () { self.refresh(); } );
			} else {
				self.refresh();
			}

			// refresh the list when dividers are filtered out
			$el.bind( 'updatelayout', function () {
				self.refresh();
			} );
		},

		_findClosestDivider: function ( targetChar ) {
			var i,
				dividerMap = this._dividerMap,
				charSet = this._charSet,
				charSetLen = charSet.length,
				targetIdx = charSet.indexOf( targetChar ),
				lastDivider,
				subDivider = null;

			for ( i = 0; i < targetIdx; ++i ) {
				lastDivider = dividerMap[ charSet.charAt( i ) ];
				if ( lastDivider !== undefined ) {
					subDivider = lastDivider;
				}
			}
			if ( !subDivider ) {
				for ( ++i; i < charSetLen; ++i ) {
					lastDivider = dividerMap[ charSet.charAt( i ) ];
					if ( lastDivider !== undefined ) {
						subDivider = lastDivider;
						break;
					}
				}
			}
			return subDivider;
		},

		_hitOmitItem: function ( listItem, text ) {
			var $popup = this.scrollview.find( '.ui-fastscroll-popup' ),
				divider;

			divider = this._dividerMap[ text ] || this._findClosestDivider( text );
			if ( typeof divider !== "undefined" ) {
				this.jumpToDivider( $( divider ) );
			}

			$popup.text( text ).show();

			$( listItem ).addClass( "ui-fastscroll-hover" );
			if ( listItem.index() === 0 ) {
				$( listItem ).addClass( "ui-fastscroll-hover-first-item" );
			}
			$( listItem ).siblings().eq( listItem.index() ).addClass( "ui-fastscroll-hover-down" );
		},

		_hitItem: function ( listItem  ) {
			var $popup = this.scrollview.find( '.ui-fastscroll-popup' ),
				text = listItem.text(),
				divider;

			if ( text === "#" ) {
				divider = this._dividerMap.number;
			} else {
				divider = this._dividerMap[ text ] || this._findClosestDivider( text );
			}

			if ( typeof divider !== "undefined" ) {
				this.jumpToDivider( $( divider ) );
			}

			$popup.text( text ).show();

			$( listItem ).addClass( "ui-fastscroll-hover" );
			if ( listItem.index() === 0 ) {
				$( listItem ).addClass( "ui-fastscroll-hover-first-item" );
			}
			$( listItem ).siblings().eq( listItem.index() ).addClass( "ui-fastscroll-hover-down" );
		},

		_focusItem: function ( listItem ) {
			var self = this,
				$popup = self.scrollview.find( '.ui-fastscroll-popup' );

			listItem.focusin( function ( e ) {
				self.shortcutsList.attr( "aria-hidden", false );
				self._hitItem( listItem );
			}).focusout( function ( e ) {
				self.shortcutsList.attr( "aria-hidden", true );
				$popup.hide();
				$( ".ui-fastscroll-hover" ).removeClass( "ui-fastscroll-hover" );
				$( ".ui-fastscroll-hover-first-item" ).removeClass( "ui-fastscroll-hover-first-item" );
				$( ".ui-fastscroll-hover-down" ).removeClass( "ui-fastscroll-hover-down" );
			});
		},

		_contentHeight: function () {
			var self = this,
				$content = $( '.ui-scrollview-clip' ),
				header = null,
				footer = null,
				paddingValue = 0,
				clipSize = $( window ).height();

			if ( $content.hasClass( "ui-content" ) ) {
				paddingValue = parseInt( $content.css( "padding-top" ), 10 );
				clipSize = clipSize - ( paddingValue || 0 );
				paddingValue = parseInt( $content.css( "padding-bottom" ), 10 );
				clipSize = clipSize - ( paddingValue || 0 );
				header = $content.siblings( ".ui-header:visible" );
				footer = $content.siblings( ".ui-footer:visible" );

				if ( header ) {
					if ( header.outerHeight( true ) === null ) {
						clipSize = clipSize - ( $( ".ui-header" ).outerHeight() || 0 );
					} else {
						clipSize = clipSize - header.outerHeight( true );
					}
				}
				if ( footer ) {
					clipSize = clipSize - footer.outerHeight( true );
				}
			} else {
				clipSize = $content.height();
			}
			return clipSize;
		},

		_omit: function ( numOfItems, maxNumOfItems ) {
			var maxGroupNum = parseInt( ( maxNumOfItems - 1 ) / 2, 10 ),
				numOfExtraItems = numOfItems - maxNumOfItems,
				groupPos = [],
				omitInfo = [],
				groupPosLength,
				group,
				size,
				i;

			if ( ( maxNumOfItems < 3 ) || ( numOfItems <= maxNumOfItems ) ) {
				return;
			}

			if ( numOfExtraItems >= maxGroupNum ) {
				size = 2;
				group = 1;
				groupPosLength = maxGroupNum;
			} else {
				size = maxNumOfItems / ( numOfExtraItems + 1 );
				group = size;
				groupPosLength = numOfExtraItems;
			}

			for ( i = 0; i < groupPosLength; i++ ) {
				groupPos.push( parseInt( group, 10 ) );
				group += size;
			}

			for ( i = 0; i < maxNumOfItems; i++ ) {
				omitInfo.push( 1 );
			}

			for ( i = 0; i < numOfExtraItems; i++ ) {
				omitInfo[ groupPos[ i % maxGroupNum ] ]++;
			}

			return omitInfo;
		},

		_createDividerMap: function () {
			var primaryCharacterSet = this._primaryLanguage ? this._primaryLanguage.replace( /,/g, "" ) : null,
				secondCharacterSet = this._secondLanguage ? this._secondLanguage.replace( /,/g, "" ) : null,
				numberSet = "0123456789",
				dividers = this.element.find( '.ui-li-divider' ),
				map = {},
				matchToDivider,
				makeCharacterSet,
				indexChar,
				i;

			matchToDivider = function ( index, divider ) {
				if ( $( divider ).text() === indexChar ) {
					map[ indexChar ] = divider;
				}
			};

			makeCharacterSet = function ( index, divider ) {
				primaryCharacterSet += $( divider ).text();
			};

			if ( primaryCharacterSet === null ) {
				primaryCharacterSet = "";
				dividers.each( makeCharacterSet );
			}

			for ( i = 0; i < primaryCharacterSet.length; i++ ) {
				indexChar = primaryCharacterSet.charAt( i );
				dividers.each( matchToDivider );
			}

			if ( secondCharacterSet !== null ) {
				for ( i = 0; i < secondCharacterSet.length; i++ ) {
					indexChar = secondCharacterSet.charAt( i );
					dividers.each( matchToDivider );
				}
			}

			dividers.each( function ( index, divider ) {
				if ( numberSet.search( $( divider ).text() ) !== -1  ) {
					map.number = divider;
					return false;
				}
			});

			this._dividerMap = map;
			this._charSet = primaryCharacterSet + secondCharacterSet;
		},

		indexString: function ( indexAlphabet ) {
			var self = this,
				characterSet = [];

			if ( typeof indexAlphabet === "undefined" ) {
				return self._primaryLanguage + ":" + self._secondLanguage;
			}

			characterSet = indexAlphabet.split( ":" );
			self._primaryLanguage = characterSet[ 0 ];
			if ( characterSet.length === 2 ) {
				self._secondLanguage = characterSet[ 1 ];
			}
		},

		refresh: function () {
			var self = this,
				primaryCharacterSet = self._primaryLanguage ? self._primaryLanguage.replace( /,/g, "" ) : null,
				secondCharacterSet = self._secondLanguage ? self._secondLanguage.replace( /,/g, "" ) : null,
				contentHeight = self._contentHeight(),
				shapItem = $( '<li tabindex="0" aria-label="double to move Number list"><span aria-hidden="true">#</span><span aria-label="Number"/></li>' ),
				$popup = this.scrollview.find( '.ui-fastscroll-popup' ),
				omitIndex = 0,
				makeCharacterSet,
				makeOmitSet,
				itemHandler,
				containerHeight,
				shortcutsItems,
				shortcutItem,
				shortcutsTop,
				minClipHeight,
				maxNumOfItems,
				numOfItems,
				minHeight,
				omitInfo,
				dividers,
				listItems,
				emptySize,
				correction,
				indexChar,
				lastIndex,
				seconds,
				height,
				size,
				i;

			makeCharacterSet = function ( index, divider ) {
				primaryCharacterSet += $( divider ).text();
			};

			makeOmitSet = function ( index, length ) {
				var count,
					omitSet = "";

				for ( count = 0; count < length; count++ ) {
					omitSet += primaryCharacterSet[ index + count ];
				}

				return omitSet;
			};

			self._createDividerMap();

			self.shortcutsList.find( 'li' ).remove();

			// get all the dividers from the list and turn them into shortcuts
			dividers = self.element.find( '.ui-li-divider' );

			// get all the list items
			listItems = self.element.find('li').not('.ui-li-divider');

			// only use visible dividers
			dividers = dividers.filter( ':visible' );
			listItems = listItems.filter( ':visible' );

			if ( dividers.length < 2 ) {
				self.shortcutsList.hide();
				return;
			}

			self.shortcutsList.show();
			self.lastListItem = listItems.last();
			self.shortcutsList.append( shapItem );
			self._focusItem( shapItem );

			if ( primaryCharacterSet === null ) {
				primaryCharacterSet = "";
				dividers.each( makeCharacterSet );
			}

			minHeight = shapItem.outerHeight( true );
			maxNumOfItems = parseInt( contentHeight / minHeight - 1, 10 );
			numOfItems = primaryCharacterSet.length;

			maxNumOfItems = secondCharacterSet ? maxNumOfItems - 2 : maxNumOfItems;

			if ( maxNumOfItems < 3 ) {
				shapItem.remove();
				return;
			}

			omitInfo = self._omit( numOfItems, maxNumOfItems );

			for ( i = 0; i < primaryCharacterSet.length; i++ ) {
				indexChar = primaryCharacterSet.charAt( i );
				shortcutItem = $( '<li tabindex="0" aria-label="double to move ' + indexChar + ' list">' + indexChar + '</li>' );

				self._focusItem( shortcutItem );

				if ( typeof omitInfo !== "undefined" && omitInfo[ omitIndex ] > 1 ) {
					shortcutItem = $( '<li>.</li>' );
					shortcutItem.data( "omitSet",  makeOmitSet( i, omitInfo[ omitIndex ] ) );
					i += omitInfo[ omitIndex ] - 1;
				}

				self.shortcutsList.append( shortcutItem );
				omitIndex++;
			}

			if ( secondCharacterSet !== null ) {
				lastIndex = secondCharacterSet.length - 1;
				seconds = [];

				seconds.push( secondCharacterSet.charAt( 0 ) );
				seconds.push( secondCharacterSet.charAt( lastIndex ) );

				for ( i = 0; i < seconds.length; i++ ) {
					indexChar = seconds[ i ];
					shortcutItem = $( '<li tabindex="0" aria-label="double to move ' + indexChar + ' list">' + indexChar + '</li>' );

					self._focusItem( shortcutItem );
					shortcutItem.bind( 'vclick', itemHandler );
					self.shortcutsList.append( shortcutItem );
				}
			}

			containerHeight = self.shortcutsContainer.outerHeight( true );
			emptySize = contentHeight - containerHeight;
			shortcutsItems = self.shortcutsList.children();
			size = parseInt( emptySize / shortcutsItems.length, 10 );
			correction = emptySize - ( shortcutsItems.length * size );

			if ( emptySize > 0 ) {
				shortcutsItems.each( function ( index, item ) {
					height = $( item ).height() + size;
					if ( correction !== 0 ) {
						height += 1;
						correction -= 1;
					}
					$( item ).css( {
						height: height,
						lineHeight: height + "px"
					} );
				} );
			}

			// position the shortcut flush with the top of the first list divider
			shortcutsTop = dividers.first().position().top;
			self.shortcutsContainer.css( 'top', shortcutsTop );

			// make the scrollview clip tall enough to show the whole of the shortcutslist
			minClipHeight = shortcutsTop + self.shortcutsContainer.outerHeight() + 'px';
			self.scrollview.css( 'min-height', minClipHeight );

			$popup.text( "M" ) // Popup size is determined based on "M".
				.width( $popup.height() )
				.css( { marginLeft: -( $popup.outerWidth() / 2 ),
					marginTop: -( $popup.outerHeight() / 2 ) } );
		}
	} );

	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.fastscroll.prototype.options.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.fastscroll();
	} );

	$( window ).bind( "resize orientationchange", function ( e ) {
		$( ".ui-page-active .ui-fastscroll-target" ).fastscroll( "refresh" );
	} );
} ( jQuery ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
