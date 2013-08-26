//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows notification popup over header/footer
//>>label: Notification
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
 *	Author: Minkyu Kang <mk7.kang@samsung.com>
 */

/*
 * Notification widget
 *
 * HTML Attributes
 *
 *  data-role: set to 'notification'.
 *  data-type: 'ticker' or 'popup'.
 *  data-interval: time to showing. If don't set, will show infinitely.
 *
 * APIs
 *
 *  open(): open the notification.
 *  close(): close the notification.
 *  text(text0, text1): set texts or get texts
 *  icon(src): set the icon (tickernoti only)
 *
 * Events
 *
 *  N/A
 *
 * Examples
 *
 * // tickernoti
 * <div data-role="notification" id="notification" data-type="ticker" data-interval="3000">
 *	<img src="icon01.png">
 *	<p>Hello World</p>
 *	<p>Denis</p>
 * </div>
 *
 * // smallpopup
 * <div data-role="notification" id="notification" data-type="popup" data-interval="3000">
 *	<p>Hello World</p>
 * </div>
 *
 */

/**
	@class Notification
	The notification widget shows a pop-up window on the screen to provide notifications.
	To add a notification widget to the application, use the following code:

		<div data-role="page">
			<div data-role="notification" data-type="smallpopup">
				<p>text1</p>
			</div>
			<div data-role="header"></div>
			<div data-role="content"></div>
			<div data-role="footer"></div>
		</div>
*/
/**
	@property {String} data-type
	Defines the notification type. The type options are tickernoti and smallpopup. <br/>The default value is smallpopup.

*/
/**
	@property {Integer} data-interval
	Defines the time to showing a notification widget. <br/>The default is infinitely.

*/
/**
	@method open
	The open method is used to open the notification widget:

		<div data-role="notification" data-type="smallpopup" data-interval="3000"></div>
		$('#notification').notification('open');
*/
/**
	@method close
	The close method is used to close the notification widget:

		<div data-role="notification" data-type="smallpopup" data-interval="3000"></div>
		$('#notification').notification('close');
*/
/**
	@method text
	The text method is used to set or get the notification text:

		<div data-role="notification" data-type="smallpopup" data-interval="3000"></div>
		// Set notification text
		$('#notification').notification('text', 'setThisText');
		// Get notification text
		texts = $('#notification').notification('text');
	@since Tizen2.0
*/
/**
	@method icon
	The setIcon method is used to set the ticker notification icon. The icon can be set only if the notification type is set to tickernoti.

		<div data-role="notification" data-type="ticker" data-interval="3000"></div>
		$('#notification').notification('icon', './test.png');
*/
(function ( $, window ) {
	$.widget( "tizen.notification", $.mobile.widget, {
		btn: null,
		text_bg: [],
		icon_img: [],
		interval: null,
		seconds: null,
		running: false,

		_get_text: function () {
			var text = new Array( 2 );

			if ( this.type === 'ticker' ) {
				text[0] = $( this.text_bg[0] ).text();
				text[1] = $( this.text_bg[1] ).text();
			} else {
				text[0] = $( this.text_bg[0] ).text();
			}

			return text;
		},

		_set_text: function ( text0, text1 ) {
			var _set = function ( elem, text ) {
				if ( !text ) {
					return;
				}
				elem.text( text );
			};

			if ( this.type === 'ticker' ) {
				_set( $( this.text_bg[0] ), text0 );
				_set( $( this.text_bg[1] ), text1 );
			} else {
				_set( $( this.text_bg[0] ), text0 );
			}
		},

		text: function ( text0, text1 ) {
			if ( text0 === undefined && text1 === undefined ) {
				return this._get_text();
			}

			this._set_text( text0, text1 );
		},

		icon: function ( src ) {
			if ( src === undefined ) {
				return;
			}

			this.icon_img.detach();
			this.icon_img = $( "<img src='" + src + "' class='ui-ticker-icon'>" );
			$( this.element ).find(".ui-ticker").append( this.icon_img );
		},

		_refresh: function () {
			var container = this._get_container();

			$( container ).addClass("fix")
					.removeClass("show")
					.removeClass("hide");

			this._set_interval();
		},

		open: function () {
			var container = this._get_container();

			if ( this.running ) {
				this._refresh();
				return;
			}

			$( container ).addClass("show")
					.removeClass("hide")
					.removeClass("fix");

			this.running = true;

			if ( this.type === 'popup' ) {
				this._set_position();
			}

			this._set_interval();
		},

		close: function () {
			var container = this._get_container();

			if ( !this.running ) {
				return;
			}

			$( container ).addClass("hide")
					.removeClass("show")
					.removeClass("fix");

			this.running = false;
			clearInterval( this.interval );
		},

		destroy: function () {
			var container = this._get_container();

			$( container ).removeClass("show")
					.removeClass("hide")
					.removeClass("fix");

			this._del_event();

			this.running = false;
		},

		_get_container: function () {
			if ( this.type === 'ticker' ) {
				return $( this.element ).find(".ui-ticker");
			}

			return $( this.element ).find(".ui-smallpopup");
		},

		_set_interval: function () {
			var self = this;

			clearInterval( this.interval );

			if ( this.seconds !== undefined && this.second !== 0 ) {
				this.interval = setInterval( function () {
					self.close();
				}, this.seconds );
			}
		},

		_add_event: function () {
			var self = this,
				container = this._get_container();

			if ( this.type === 'ticker' ) {
				container.find(".ui-ticker-btn").append( this.btn ).trigger("create");

				this.btn.bind( "vmouseup", function () {
					self.close();
				});
			}

			container.bind( 'vmouseup', function () {
				self.close();
			});
		},

		_del_event: function () {
			var container = this._get_container();

			if ( this.type === 'ticker' ) {
				this.btn.unbind("vmouseup");
			}
			container.unbind('vmouseup');
			clearInterval( this.interval );
		},

		_set_position: function () {
			var container = this._get_container(),
				$footer = $('.ui-page-active').children('.ui-footer'),
				footer_h = $footer.outerHeight() || 0;

			container.css( 'bottom', footer_h);
		},

		_create: function () {
			var self = this,
				elem = $( this.element ),
				i;

			this.btn = $('<div data-role="button" data-inline="true">Close</div>');

			this.seconds = elem.jqmData('interval');
			this.type = elem.jqmData('type') || 'popup';

			if ( this.type === 'ticker' ) {
				elem.wrapInner("<div class='ui-ticker'></div>");
				elem.find(".ui-ticker").append("<div class='ui-ticker-body'></div>" +
							"<div class='ui-ticker-btn'></div>");
				this.text_bg = elem.find("p");

				if ( this.text_bg.length < 2 ) {
					elem.find(".ui-ticker").append("<p></p><p></p>");
					this.text_bg = elem.find("p");
				} else if ( this.text_bg.length > 2 ) {
					for ( i = 2; i < this.text_bg.length; i++ ) {
						$( this.text_bg[i] ).css( "display", "none" );
					}
				}

				$( this.text_bg[0] ).addClass("ui-ticker-text1-bg");
				$( this.text_bg[1] ).addClass("ui-ticker-text2-bg");

				this.icon_img = elem.find("img");

				if ( this.icon_img.length ) {
					$( this.icon_img ).addClass("ui-ticker-icon");

					for ( i = 1; i < this.icon_img.length; i++ ) {
						$( this.icon_img[i] ).css( "display", "none" );
					}
				}
			} else {
				elem.wrapInner("<div class='ui-smallpopup'></div>");
				this.text_bg = elem.find("p").addClass("ui-smallpopup-text-bg");

				if ( this.text_bg.length < 1 ) {
					elem.find(".ui-smallpopup")
						.append("<p class='ui-smallpopup-text-bg'></p>");
					this.text_bg = elem.find("p");
				} else if ( this.text_bg.length > 1 ) {
					for ( i = 1; i < this.text_bg.length; i++ ) {
						$( this.text_bg[i] ).css( "display", "none" );
					}
				}

				this._set_position();
			}

			this._add_event();

			$( window ).bind( "resize", function () {
				if ( !self.running ) {
					return;
				}

				self._refresh();

				if ( self.type === 'popup' ) {
					self._set_position();
				}
			});
		}
	}); // End of widget

	// auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$( e.target ).find(":jqmData(role='notification')").notification();
	});

	$( document ).bind( "pagebeforehide", function ( e ) {
		$( e.target ).find(":jqmData(role='notification')").notification('destroy');
	});
}( jQuery, this ));

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
