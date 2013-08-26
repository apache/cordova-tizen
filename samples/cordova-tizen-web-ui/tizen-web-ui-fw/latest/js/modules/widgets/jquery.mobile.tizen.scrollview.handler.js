//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows a scroll-handler with a scrollview
//>>label: Scrollview Handler
//>>group: Tizen:Widgets

define( [
	'jquery',
	'../jquery.mobile.tizen.core',
	'../jquery.mobile.tizen.scrollview'
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
 * Authors: Wonseop Kim ( wonseop.kim@samsung.com )
*/

/**
 * "Handler" is a widget helping a user to scroll a window or panel.
 * It is different from the scrollview feature in that the handler has a fixed size
 * and disappears when a scroll size is smaller than a parent window's size.
 * If the handler widget is activated, a scroll bar on the screen will be deactivated.
 * The handler widget supports scrolling up and down and indicates the position of the scrolled window.
 *
 * HTML Attributes:
 *
 *		data-handler : This attribute is indicating that whether enable.
 *						If you want to use, you will set 'true'.
 *		data-handler-theme : Set the widget theme ( optional )
 *
 * APIs:
 *
 *		enableHandler ( boolean )
 *			: Get or set the use of handler widget.
 *			If the value is "true", it will be run handler widget.
 *			If the value is "false", it will be not run handler widget.
 *			If no value is specified, will act as a getter.
 *
 * Events:
 *
 * Examples:
 *
 *		<div data-role="content" data-scroll="y" data-handler="true">
 *			<ul data-role="listview">
 *				<li data-role="list-divider">A</li>
 *				<li><a href="#">Adam Kinkaid</a></li>
 *					...
 *			</ul>
 *		</div>
 */

/**
	@class handler
	The handler widget enables the user to vertically scroll through a page or panel using a fixed-size handle. The widget indicates the position of the scrolled window, and only appears on the screen if the parent page or panel's scroll size is larger than the screen size. <br/> To add a handler widget to the application, use the following code:

		<div data-role="content" data-scroll="y" data-handler="true">
			<ul data-role="listview">
				<li data-role="list-divider">A</li>
				<li><a href="#">Adam Kinkaid</a></li>
					...
			</ul>
		</div>
	
	You can use the enableHandler method with the handler widget to get (if no value is defined) or set the handler usage status. If the [enable] value is true, the handler is enabled; otherwise the handler is not used.

		$("#.selector").scrollview("enableHandler", [enable]);
*/
/**
	@property {Boolean} data-handler
	Enables the handler widget. The value must be set to true.
*/
/**
	@property {String} data-handler-theme
	Sets the handler widget theme.
*/
( function ( $, document, undefined ) {
	// The options of handler in scrollview
	$.tizen.scrollview.prototype.options.handler = false;
	$.tizen.scrollview.prototype.options.handlerTheme = "s";

	var originSetOption = $.tizen.scrollview.prototype._setOption,
		createHandler = function ( target ) {
			var $view = target,
				prefix = "<div class=\"ui-handler ui-handler-direction-",
				suffix = "\"><div class=\"ui-handler-track\"><div class=\"ui-handler-handle\"><div class=\"ui-handler-thumb\"></div></div></div></div>",
				scrollview = $view.data( "scrollview" ),
				options = scrollview.options,
				direction = options.direction,
				parentTheme = $.mobile.getInheritedTheme( scrollview, "s" ),
				theme = options.theme || parentTheme,
				isHorizontal = ( scrollview.options.direction === "x" ),
				_$view = scrollview._$view,
				_$clip = scrollview._$clip,
				scrollbar = $view.find( ".ui-scrollbar" ),
				handler = null,
				handlerHandle = null,
				viewLength = 0,
				clipLength = 0,
				handlerHeight = 0,
				handlerMargin = 0,
				trackLength = 0,
				moveTimer,
				isTouchable = $.support.touch,
				dragStartEvt = ( isTouchable ? "touchstart" : "mousedown" ) + ".handler",
				dragMoveEvt = ( isTouchable ? "touchmove" : "mousemove" ) + ".handler",
				dragStopEvt = ( isTouchable ? "touchend" : "mouseup" ) + ".handler",
				dragLeaveEvt = ( isTouchable ? " touchleave" : " mouseleave" ) + ".handler",
				calculateLength = function () {
					clipLength = ( isHorizontal ? _$clip.width() : _$clip.height() );
					viewLength = ( isHorizontal ? _$view.width() : _$view.height() ) - clipLength;
					trackLength = clipLength - handlerHeight - handlerMargin * 2;
				},
				setHanderPostion = function ( scrollPos ) {
					var handlerPos = Math.round( ( isHorizontal ? scrollPos.x : scrollPos.y ) / viewLength * trackLength );
					handlerHandle[0].style[ ( isHorizontal ? "left" : "top" ) ] = handlerPos + "px";
				},
				stopHandlerScroll = function () {
					$( document ).unbind( ".handler" );
					$view.moveData = null;
					_$view.trigger( "scrollstop" );
				};

			if ( $view.find( ".ui-handler-handle" ).length !== 0 || typeof direction !== "string" ) {
				return;
			}

			handler = $( [ prefix, direction, suffix ].join( "" ) ).appendTo( $view.addClass( " ui-handler-" + theme ) );
			handlerHandle = $view.find( ".ui-handler-handle" ).attr( {
				"tabindex" : "0",
				"aria-label" : ( isHorizontal ? "Horizontal handler, double tap and move to scroll" : "Verticalhandler, double tap and move to scroll" )
			}).hide();
			handlerHeight = ( isHorizontal ? handlerHandle.width() : handlerHandle.height() );
			handlerMargin = ( isHorizontal ? parseInt( handler.css( "right" ), 10 ) : parseInt( handler.css( "bottom" ), 10 ) );

			$.extend( $view, {
				moveData : null
			});

			// handler drag
			handlerHandle.bind( dragStartEvt, {
				e : handlerHandle[0]
			}, function ( event ) {
				scrollview._stopMScroll();

				var target = event.data.e,
					t = ( isTouchable ? event.originalEvent.targetTouches[0] : event );

				target.style.opacity = 1.0;

				$view.moveData = {
					target : target,
					X : parseInt( target.style.left, 10 ) || 0,
					Y : parseInt( target.style.top, 10 ) || 0,
					pX : t.pageX,
					pY : t.pageY
				};
				calculateLength();

				_$view.trigger( "scrollstart" );

				if ( !isTouchable ) {
					event.preventDefault();
				}

				$( document ).bind( dragMoveEvt, function ( event ) {
					var moveData = $view.moveData,
						target = moveData.target,
						handlePos = 0,
						scrollPos = 0,
						t = ( isTouchable ? event.originalEvent.targetTouches[0] : event );

					handlePos = ( isHorizontal ? moveData.X + t.pageX - moveData.pX : moveData.Y + t.pageY - moveData.pY );

					if ( handlePos < 0 ) {
						handlePos = 0;
					}

					if ( handlePos > trackLength ) {
						handlePos = trackLength;
					}
					scrollPos = - Math.round( handlePos / trackLength * viewLength );

					if ( isHorizontal ) {
						scrollview._setScrollPosition( scrollPos, 0 );
						target.style.left = handlePos + "px";
					} else {
						scrollview._setScrollPosition( 0, scrollPos );
						target.style.top = handlePos + "px";
					}

					event.preventDefault();
				}).bind( dragStopEvt + dragLeaveEvt, function ( event ) {
					stopHandlerScroll();
				});
			});

			_$view.bind( dragStopEvt, function ( event ) {
				stopHandlerScroll();
			});

			$view.bind( "scrollstart", function ( event ) {
				if ( !scrollview.enableHandler() ) {
					return;
				}

				calculateLength();

				if ( viewLength < 0 || clipLength < handlerHeight ) {
					if ( scrollbar.is( ":hidden" ) ) {
						scrollbar.show();
					}
					return;
				}

				if ( scrollbar.is( ":visible" ) ) {
					scrollbar.hide();
				}

				if ( moveTimer ) {
					clearInterval( moveTimer );
					moveTimer = undefined;
				}

				handler.addClass( "ui-handler-visible" );
				handlerHandle.stop( true, true )
							.fadeIn();
			}).bind( "scrollupdate", function ( event, data ) {
				if ( !scrollview.enableHandler() || viewLength < 0 || clipLength < handlerHeight ) {
					return;
				}

				setHanderPostion( scrollview.getScrollPosition() );
			}).bind( "scrollstop", function ( event ) {
				if ( !scrollview.enableHandler() || viewLength < 0 || clipLength < handlerHeight ) {
					return;
				}

				moveTimer = setInterval( function () {
					setHanderPostion( scrollview.getScrollPosition() );
					if ( !scrollview._gesture_timer ) {
						clearInterval( moveTimer );
						moveTimer = undefined;
					}
				}, 10 );

				if ( scrollview._handlerTimer ) {
					clearTimeout( scrollview._handlerTimer );
					scrollview._handlerTimer = 0;
				}
				scrollview._handlerTimer = setTimeout( function () {
					if ( scrollview._timerID === 0 && $view.moveData === null ) {
						handlerHandle.stop( true, true )
							.css( "opacity", 1.0 )
							.fadeOut( function () {
								handler.removeClass( "ui-handler-visible" );
							});
						scrollview._handlerTimer = 0;
					}
				}, 1000 );
			}).bind( "mousewheel", function ( event ) {
				handler.removeClass( "ui-handler-visible" );
				setHanderPostion( scrollview.getScrollPosition() );
			});
		};

	$.extend( $.tizen.scrollview.prototype, {
		enableHandler: function ( enabled ) {
			if ( typeof enabled === 'undefined' ) {
				return this.options.handler;
			}

			this.options.handler = !!enabled;

			var $view = this.element;
			if ( this.options.handler ) {
				if ( $view.find( ".ui-handler" ).length === 0 ) {
					createHandler( $view );
				}

				$view.find( ".ui-scrollbar" ).hide();
				$view.find( ".ui-handler" ).show();
			} else {
				$view.find( ".ui-handler" ).removeClass( "ui-handler-visible" ).hide();
				$view.find( ".ui-scrollbar" ).show();
			}
		},

		_setHandlerTheme: function ( handlerTheme ) {
			if ( !handlerTheme ) {
				return;
			}

			var oldClass = "ui-handler-" + this.options.handlerTheme,
				newClass = "ui-handler-" + handlerTheme;

			this.element.removeClass( oldClass ).addClass( newClass );
			this.options.handlerTheme = handlerTheme;
		},

		_setOption: function ( key, value ) {
			switch ( key ) {
			case "handler":
				this.enableHandler( value );
				break;
			case "handlerTheme":
				this._setHandlerTheme( value );
				break;
			default:
				originSetOption.call( this, key, value );
			}
		},

		_handlerTimer : 0
	});

	$( document ).delegate( ":jqmData(scroll)", "scrollviewcreate", function () {
		var widget = $( this );
		if ( widget.attr( "data-" + $.mobile.ns + "scroll" ) === "none"
				|| widget.attr( "data-" + $.mobile.ns + "handler" ) !== "true" ) {
			return;
		}
		widget.scrollview( "enableHandler", "true" );
	});
} ( jQuery, document ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
