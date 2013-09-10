//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows popup on the page
//>>label: Popup
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	'../jquery.mobile.tizen.core',
	'./jquery.mobile.tizen.widgetex'
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
 * Authors: Gabriel Schulhof <gabriel.schulhof@intel.com>,
 *          Elliot Smith <elliot.smith@intel.com>
 *			Hyunjung Kim <hjnim.kim@samsung.com>
 */

/*
 * % Popupwindow widget do not use anymore(will be deprecated, internal use only)
 *
 *
 * Shows other elements inside a popup window.
 *
 * To apply, add the attribute data-role="popupwindow" to a <div> element inside
 * a page. Alternatively, call popupwindow()
 * on an element, eg :
 *
 *     $("#mypopupwindowContent").popupwindow();
 * where the html might be :
 *     <div id="mypopupwindowContent"></div>
 *
 * To trigger the popupwindow to appear, it is necessary to make a call to its
 * 'open()' method. This is typically done by binding a function to an event
 * emitted by an input element, such as a the clicked event emitted by a button
 * element. The open() method takes two arguments, specifying the x and y
 * screen coordinates of the center of the popup window.

 * You can associate a button with a popup window like this:
 *      <div id="mypopupContent" style="display: table;" data-role="popupwindow">
 *          <table>
 *              <tr> <td>Eenie</td>   <td>Meenie</td>  <td>Mynie</td>   <td>Mo</td>  </tr>
 *              <tr> <td>Catch-a</td> <td>Tiger</td>   <td>By-the</td>  <td>Toe</td> </tr>
 *              <tr> <td>If-he</td>   <td>Hollers</td> <td>Let-him</td> <td>Go</td>  </tr>
 *              <tr> <td>Eenie</td>   <td>Meenie</td>  <td>Mynie</td>   <td>Mo</td>  </tr>
 *          </table>
 *      </div>
 * <a href="#myPopupContent" data-rel="popupwindow" data-role="button">Show popup</a>
 *
 * Options:
 *
 *     theme: String; the theme for the popupwindow contents
 *                   Default: null
 *
 *     overlayTheme: String; the theme for the popupwindow
 *                   Default: null
 *
 *     shadow: Boolean; display a shadow around the popupwindow
 *             Default: true
 *
 *     corners: Boolean; display a shadow around the popupwindow
 *             Default: true
 *
 *     fade: Boolean; fades the opening and closing of the popupwindow
 *
 *     transition: String; the transition to use when opening or closing
 *                 a popupwindow
 *                 Default: $.mobile.defaultDialogTransition
 *
 * Events:
 *	popupbeforeposition: triggered after a popup has completed preparations for opening, but has not yet opened
 *	popupafteropen: triggered after a popup has completely opened
 *	popupafterclose triggered when a popup has completely closed
*/

/**
	class Popupwindow
	The pop-up widget shows a list of items in a pop-up window in the middle of the screen. It automatically optimizes the pop-up window size within the screen.
	To add a pop-up widget to the application, use the following code:

		// Basic pop-up
		<div id="center_info" data-role="popup" data-style="center_info">
			<div data-role="text">
				<p>
				Pop-up dialog box, a child window that blocks user interaction in the parent window
				</p>
			</div>
		</div>
		// Pop-up with a title and button
		<div id="center_title_1btn" data-role="popup" data-style="center_title_1btn">
			<p data-role="title">
				Pop-up title
			</p>
			<p data-role="text">
				Pop-up dialog box
			</p>
		<div data-role="button-bg">
			<input type="button" value="Text Button" />
		</div>
		</div>

	The pop-up can define callbacks for events as described in the jQueryMobile documentation for pop-up events. <br/>You can use methods with the pop-up as described in the jQueryMobile documentation for pop-up methods.

	@deprecated 2.0 verisons
*/

/**
	@property {String} data-style
	Defines the pop-up window style.
	The following styles are available:

	center_info: basic pop-up message
	center_title: pop-up message with a title
	center_basic_1btn: pop-up message with 1 button
	center_basic_2btn: pop-up message with 2 horizontal buttons
	center_title_1btn: pop-up message with a title and 1 button
	center_title_2btn: pop-up message with a title and 2 horizontal buttons
	center_title_3btn: pop-up message with a title and 3 horizontal buttons
	center_button_vertical: pop-up message with vertical buttons
	center_checkbox: pop-up message with a check box
	center_liststyle_1btn>: pop-up message with a list and 1 button
	center_liststyle_2btn: pop-up message with a list and 2 horizontal buttons
	center_liststyle_3btn: pop-up message with a list and 3 horizontal buttons
*/

(function ( $, undefined ) {
	$.widget( "tizen.popupwindow", $.tizen.widgetex, {
		options: {
			theme: null,
			overlayTheme: "s",
			style: "custom",
			disabled: false,
			shadow: true,
			corners: true,
			fade: false,
			opacity: 0.7,
			widthRatio: 0.8612,
			transition: $.mobile.defaultDialogTransition,
			initSelector: ":jqmData(role='popupwindow')"
		},

		_htmlProto: {
source:

 [ "<div><div>" ,
  "    <div id='popupwindow-screen' class='ui-selectmenu-screen ui-screen-hidden ui-popupwindow-screen'></div>" ,
  "    <div id='popupwindow-container' class='ui-popupwindow ui-popupwindow-padding ui-selectmenu-hidden ui-overlay-shadow ui-corner-all'></div>" ,
  "</div>" ,
  "</div>" ].join("")
,			ui: {
				screen: "#popupwindow-screen",
				container: "#popupwindow-container"
			}
		},

		_setStyle: function () {
			var popup = this.element,
				style = popup.attr( 'data-style' );

			if ( style ) {
				this.options.style = style;
			}

			popup.addClass( this.options.style );
			popup.find( ":jqmData(role='title')" )
					.wrapAll( "<div class='popup-title'></div>" );
			popup.find( ":jqmData(role='text')" )
					.wrapAll( "<div class='popup-text'></div>" );
			popup.find( ":jqmData(role='button-bg')" )
					.wrapAll( "<div class='popup-button-bg'></div>" );
			popup.find( ":jqmData(role='check-bg')" )
					.wrapAll( "<div class='popup-check-bg'></div>" );
			popup.find( ":jqmData(role='scroller-bg')" )
					.addClass( "popup-scroller-bg" );
			popup.find( ":jqmData(role='text-bottom-bg')" )
					.wrapAll( "<div class='popup-text-bottom-bg'></div>" );
			popup.find( ":jqmData(role='text-left')" )
					.wrapAll( "<div class='popup-text-left'></div>" );
			popup.find( ":jqmData(role='text-right')" )
					.wrapAll( "<div class='popup-text-right'></div>" );
			popup.find( ":jqmData(role='progress-bg')" )
					.wrapAll( "<div class='popup-progress-bg'></div>" );
		},

		_create: function () {
			console.warn("popupwindow() was deprecated. use popup() instead.");
			var thisPage = this.element.closest(":jqmData(role='page')"),
				self = this;

			if ( thisPage.length === 0 ) {
				thisPage = $("body");
			}

			this._ui.placeholder =
					$( "<div><!-- placeholder for " + this.element.attr("id") + " --></div>" )
					.css("display", "none")
					.insertBefore( this.element );

			thisPage.append( this._ui.screen );
			this._ui.container.insertAfter( this._ui.screen );
			this._ui.container.append( this.element );

			this._setStyle();

			this._isOpen = false;

			this._ui.screen.bind( "vclick", function ( e ) {
				self.close();
				return false;
			} );

			this.element.bind( "vclick", function ( e ) {
				if ( $( e.target ).is("ui-btn-ctxpopup-close") ) {
					self.close();
				}
			} );
		},

		destroy: function () {
			this.element.insertBefore( this._ui.placeholder );

			this._ui.placeholder.remove();
			this._ui.container.remove();
			this._ui.screen.remove();
			this.element.triggerHandler("destroyed");
			$.Widget.prototype.destroy.call( this );
		},

		_placementCoords: function ( x, y, cw, ch ) {
			var screenHeight = $( window ).height(),
				screenWidth = $( window ).width(),
				halfheight = ch / 2,
				maxwidth = parseFloat( this._ui.container.css( "max-width" ) ),
				roomtop = y,
				roombot = screenHeight - y,
				newtop,
				newleft;

			if ( roomtop > ch / 2 && roombot > ch / 2 ) {
				newtop = y - halfheight;
			} else {
				newtop = roomtop > roombot ? screenHeight - ch - 30 : 30;
			}

			if ( cw < maxwidth ) {
				newleft = ( screenWidth - cw ) / 2;
			} else {
				newleft = x - cw / 2;

				if ( newleft < 10 ) {
					newleft = 10;
				} else if ( ( newleft + cw ) > screenWidth ) {
					newleft = screenWidth - cw - 10;
				}
			}

			return { x : newleft, y : newtop };
		},

		_setPosition: function ( x_where, y_where ) {
			var x = ( undefined === x_where ? $( window ).width()  / 2 : x_where ),
				y = ( undefined === y_where ? $( window ).height() / 2 : y_where ),
				coords,
				ctxpopup = this.element.data("ctxpopup"),
				popupWidth,
				menuHeight,
				menuWidth,
				screenHeight,
				screenWidth,
				roomtop,
				roombot,
				halfheight,
				maxwidth,
				newtop,
				newleft;

			if ( !ctxpopup ) {
				popupWidth = $( window ).width() * this.options.widthRatio;
				this._ui.container.css( "width", popupWidth );

				if ( this._ui.container.outerWidth() > $( window ).width() ) {
					this._ui.container.css( {"max-width" : $( window ).width() - 30} );
				}
			}

			coords = this._placementCoords( x, y,
					this._ui.container.outerWidth(),
					this._ui.container.outerHeight() );

			menuHeight = this._ui.container.innerHeight();
			menuWidth = this._ui.container.innerWidth();
			screenHeight = $( window ).height();
			screenWidth = $( window ).width();
			roomtop = y;
			roombot = screenHeight - y;
			halfheight = menuHeight / 2;
			maxwidth = parseFloat( this._ui.container.css( "max-width" ) );
			newtop = ( screenHeight - menuHeight ) / 2;

			if ( !maxwidth || menuWidth < maxwidth ) {
				newleft = ( screenWidth - menuWidth ) / 2;
			} else {
				newleft = x - menuWidth / 2;

				if ( newleft < 30 ) {
					newleft = 30;
				} else if ( ( newleft + menuWidth ) > screenWidth ) {
					newleft = screenWidth - menuWidth - 30;
				}
			}

			if ( ctxpopup ) {
				newtop = coords.y;
				newleft = coords.x;
			}

			this._ui.container.css({
				top: newtop,
				left: newleft
			});

			this._ui.screen.css( "height", screenHeight );
		},
		open: function ( x_where, y_where, backgroundclose ) {
			var self = this,
				zIndexMax = 0;

			if ( this._isOpen || this.options.disabled ) {
				return;
			}

			$( document ).find("*").each( function () {
				var el = $( this ),
					zIndex = parseInt( el.css("z-index"), 10 );

				if ( !( el.is( self._ui.container ) ||
						el.is( self._ui.screen ) ||
						isNaN( zIndex ))) {
					zIndexMax = Math.max( zIndexMax, zIndex );
				}
			} );

			this._ui.screen.css( "height", $( window ).height() );

			if ( backgroundclose ) {
				this._ui.screen.css( "opacity", 0 )
						.removeClass("ui-screen-hidden");
			} else {
				this._ui.removeClass("ui-screen-hidden");

				if ( this.options.fade ) {
					this._ui.screen.animate( {opacity: this.options.opacity}, "fast" );
				} else {
					this._ui.screen.css( {opacity: this.options.opacity} );
				}
			}

			this._setPosition( x_where, y_where );

			this.element.trigger("popupbeforeposition");

			this._ui.container
				.removeClass("ui-selectmenu-hidden")
				.addClass("in")
				.animationComplete( function () {
					self.element.trigger("popupafteropen");
				} );

			this._isOpen = true;

			if ( !this._reflow ) {
				this._reflow = function () {
					if ( !self._isOpen ) {
						return;
					}

					self._setPosition( x_where, y_where );
				};

				$( window ).bind( "resize", this._reflow );
			}
		},

		close: function () {
			if ( !this._isOpen ) {
				return;
			}

			if ( this._reflow ) {
				$( window ).unbind( "resize", this._reflow );
				this._reflow = null;
			}

			var self = this,
				hideScreen = function () {
					self._ui.screen.addClass("ui-screen-hidden");
					self._isOpen = false;
				};

			this._ui.container.removeClass("in").addClass("reverse out");

			if ( this.options.transition === "none" ) {
				this._ui.container
					.addClass("ui-selectmenu-hidden")
					.removeAttr("style");
				this.element.trigger("popupafterclose");
			} else {
				this._ui.container.animationComplete( function () {
					self._ui.container
						.removeClass("reverse out")
						.addClass("ui-selectmenu-hidden")
						.removeAttr("style");
					self.element.trigger("popupafterclose");
				} );
			}

			if ( this.options.fade ) {
				this._ui.screen.animate( {opacity: 0}, "fast", hideScreen );
			} else {
				hideScreen();
			}
		},

		_realSetTheme: function ( dst, theme ) {
			var classes = ( dst.attr("class") || "" ).split(" "),
				alreadyAdded = true,
				currentTheme = null,
				matches;

			while ( classes.length > 0 ) {
				currentTheme = classes.pop();
				matches = currentTheme.match(/^ui-body-([a-z])$/);

				if ( matches && matches.length > 1 ) {
					currentTheme = matches[1];
					break;
				} else {
					currentTheme = null;
				}
			}

			dst.removeClass( "ui-body-" + currentTheme );
			if ( ( theme || "" ).match(/[a-z]/) ) {
				dst.addClass( "ui-body-" + theme );
			}
		},

		_setTheme: function ( value ) {
			this._realSetTheme( this.element, value );
			this.options.theme = value;
			this.element.attr( "data-" + ( $.mobile.ns || "" ) + "theme", value );
		},

		_setOverlayTheme: function ( value ) {
			this._realSetTheme( this._ui.container, value );
			this.options.overlayTheme = value;
			this.element.attr( "data-" + ( $.mobile.ns || "" ) + "overlay-theme", value );
		},

		_setShadow: function ( value ) {
			this.options.shadow = value;
			this.element.attr( "data-" + ( $.mobile.ns || "" ) + "shadow", value );
			this._ui.container[value ? "addClass" : "removeClass"]("ui-overlay-shadow");
		},

		_setCorners: function ( value ) {
			this.options.corners = value;
			this.element.attr( "data-" + ( $.mobile.ns || "" ) + "corners", value );
			this._ui.container[value ? "addClass" : "removeClass"]("ui-corner-all");
		},

		_setFade: function ( value ) {
			this.options.fade = value;
			this.element.attr( "data-" + ( $.mobile.ns || "" ) + "fade", value );
		},

		_setTransition: function ( value ) {
			this._ui.container
				.removeClass( this.options.transition || "" )
				.addClass( value );
			this.options.transition = value;
			this.element.attr( "data-" + ( $.mobile.ns || "" ) + "transition", value );
		},

		_setDisabled: function ( value ) {
			$.Widget.prototype._setOption.call( this, "disabled", value );
			if ( value ) {
				this.close();
			}
		}
	});

	$.tizen.popupwindow.bindPopupToButton = function ( btn, popup ) {
		if ( btn.length === 0 || popup.length === 0 ) {
			return;
		}

		var btnVClickHandler = function ( e ) {
			if ( !popup.jqmData("overlay-theme-set") ) {
				popup.popupwindow( "option", "overlayTheme", btn.jqmData("theme") );
			}

			popup.popupwindow( "open",
				btn.offset().left + btn.outerWidth()  / 2,
				btn.offset().top  + btn.outerHeight() / 2 );

			return false;
		};

		if ( ( popup.popupwindow("option", "overlayTheme") || "" ).match(/[a-z]/) ) {
			popup.jqmData( "overlay-theme-set", true );
		}

		btn
			.attr({
				"aria-haspopup": true,
				"aria-owns": btn.attr("href")
			})
			.removeAttr("href")
			.bind( "vclick", btnVClickHandler );

		popup.bind( "destroyed", function () {
			btn.unbind( "vclick", btnVClickHandler );
		} );
	};

	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.popupwindow.prototype.options.initSelector, e.target )
			.not(":jqmData(role='none'), :jqmData(role='nojs')")
			.popupwindow();

		$( "a[href^='#']:jqmData(rel='popupwindow')", e.target ).each( function () {
			$.tizen.popupwindow.bindPopupToButton( $( this ), $( $( this ).attr("href") ) );
		});
	});
}( jQuery ));

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
