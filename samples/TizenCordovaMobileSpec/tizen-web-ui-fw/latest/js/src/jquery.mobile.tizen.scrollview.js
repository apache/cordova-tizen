
/*
* jQuery Mobile Framework : scrollview plugin
* Copyright (c) 2010 Adobe Systems Incorporated - Kin Blas (jblas@adobe.com)
* Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
* Note: Code is in draft form and is subject to change
* Modified by Koeun Choi <koeun.choi@samsung.com>
* Modified by Minkyu Kang <mk7.kang@samsung.com>
*/

(function ( $, window, document, undefined ) {

	function resizePageContentHeight( page ) {
		var $page = $( page ),
			$content = $page.children(".ui-content"),
			hh = $page.children(".ui-header").outerHeight() || 0,
			fh = $page.children(".ui-footer").outerHeight() || 0,
			pt = parseFloat( $content.css("padding-top") ),
			pb = parseFloat( $content.css("padding-bottom") ),
			wh = $( window ).height();

		$content.height( wh - (hh + fh) - (pt + pb) );
	}

	function MomentumTracker( options ) {
		this.options = $.extend( {}, options );
		this.easing = "easeOutQuad";
		this.reset();
	}

	var tstates = {
		scrolling: 0,
		overshot:  1,
		snapback:  2,
		done:      3
	};

	function getCurrentTime() {
		return Date.now();
	}

	jQuery.widget( "tizen.scrollview", jQuery.mobile.widget, {
		options: {
			direction:         null,  // "x", "y", or null for both.

			timerInterval:     10,
			scrollDuration:    1000,  // Duration of the scrolling animation in msecs.
			overshootDuration: 250,   // Duration of the overshoot animation in msecs.
			snapbackDuration:  500,   // Duration of the snapback animation in msecs.

			moveThreshold:     30,   // User must move this many pixels in any direction to trigger a scroll.
			moveIntervalThreshold:     150,   // Time between mousemoves must not exceed this threshold.

			scrollMethod:      "translate",  // "translate", "position"
			startEventName:    "scrollstart",
			updateEventName:   "scrollupdate",
			stopEventName:     "scrollstop",

			eventType:         $.support.touch ? "touch" : "mouse",

			showScrollBars:    true,
			overshootEnable:   false,
			outerScrollEnable: false,
			overflowEnable:    true,
			scrollJump:        false
		},

		_getViewHeight: function () {
			return this._$view.height();
		},

		_getViewWidth: function () {
			return this._$view.width();
		},

		_makePositioned: function ( $ele ) {
			if ( $ele.css("position") === "static" ) {
				$ele.css( "position", "relative" );
			}
		},

		_create: function () {
			var direction,
				self = this;

			this._$clip = $( this.element ).addClass("ui-scrollview-clip");

			if ( this._$clip.children(".ui-scrollview-view").length ) {
				this._$view = this._$clip.children(".ui-scrollview-view");
			} else {
				this._$view = this._$clip.wrapInner("<div></div>").children()
							.addClass("ui-scrollview-view");
			}

			if ( this.options.scrollMethod === "translate" ) {
				if ( this._$view.css("transform") === undefined ) {
					this.options.scrollMethod = "position";
				}
			}

			this._$clip.css( "overflow", "hidden" );
			this._makePositioned( this._$clip );

			this._makePositioned( this._$view );
			this._$view.css( { left: 0, top: 0 } );

			this._view_height = this._getViewHeight();

			this._sx = 0;
			this._sy = 0;

			direction = this.options.direction;

			this._hTracker = ( direction !== "y" ) ?
					new MomentumTracker( this.options ) : null;
			this._vTracker = ( direction !== "x" ) ?
					new MomentumTracker( this.options ) : null;

			this._timerInterval = this.options.timerInterval;
			this._timerID = 0;

			this._timerCB = function () {
				self._handleMomentumScroll();
			};

			this._add_event();
			this._add_scrollbar();
			this._add_scroll_jump();
			this._add_overflow_indicator();
		},

		_startMScroll: function ( speedX, speedY ) {
			var keepGoing = false,
				duration = this.options.scrollDuration,
				ht = this._hTracker,
				vt = this._vTracker,
				c,
				v;

			this._$clip.trigger( this.options.startEventName );

			if ( ht ) {
				c = this._$clip.width();
				v = this._getViewWidth();

				if ( (( this._sx === 0 && speedX > 0 ) ||
					( this._sx === -(v - c) && speedX < 0 )) &&
						v > c ) {
					return;
				}

				ht.start( this._sx, speedX,
					duration, (v > c) ? -(v - c) : 0, 0 );
				keepGoing = !ht.done();
			}

			if ( vt ) {
				c = this._$clip.height();
				v = this._getViewHeight();

				if ( (( this._sy === 0 && speedY > 0 ) ||
					( this._sy === -(v - c) && speedY < 0 )) &&
						v > c ) {
					return;
				}

				vt.start( this._sy, speedY,
					duration, (v > c) ? -(v - c) : 0, 0 );
				keepGoing = keepGoing || !vt.done();
			}

			if ( keepGoing ) {
				this._timerID = setTimeout( this._timerCB, this._timerInterval );
			} else {
				this._stopMScroll();
			}
		},

		_stopMScroll: function () {
			if ( this._timerID ) {
				this._$clip.trigger( this.options.stopEventName );
				clearTimeout( this._timerID );
			}
			this._timerID = 0;

			if ( this._vTracker ) {
				this._vTracker.reset();
			}

			if ( this._hTracker ) {
				this._hTracker.reset();
			}

			this._hideScrollBars();
			this._hideOverflowIndicator();
		},

		_handleMomentumScroll: function () {
			var keepGoing = false,
				x = 0,
				y = 0,
				scroll_height = 0,
				self = this,
				vt = this._vTracker,
				ht = this._hTracker;

			if ( this._outerScrolling ) {
				return;
			}

			if ( vt ) {
				vt.update( this.options.overshootEnable );
				y = vt.getPosition();
				keepGoing = !vt.done();

				if ( vt.getRemained() > this.options.overshootDuration ) {
					scroll_height = this._getViewHeight() - this._$clip.height();

					if ( !vt.isAvail() ) {
						if ( this._speedY > 0 ) {
							this._outerScroll( vt.getRemained() / 3, scroll_height );
						} else {
							this._outerScroll( y - vt.getRemained() / 3, scroll_height );
						}
					} else if ( vt.isMin() ) {
						this._outerScroll( y - vt.getRemained() / 3, scroll_height );

					} else if ( vt.isMax() ) {
						this._outerScroll( vt.getRemained() / 3, scroll_height );
					}
				}
			}

			if ( ht ) {
				ht.update( this.options.overshootEnable );
				x = ht.getPosition();
				keepGoing = keepGoing || !ht.done();
			}

			this._setScrollPosition( x, y );
			this._$clip.trigger( this.options.updateEventName,
					[ { x: x, y: y } ] );

			if ( keepGoing ) {
				this._timerID = setTimeout( this._timerCB, this._timerInterval );
			} else {
				this._stopMScroll();
			}
		},

		_setElementTransform: function ( $ele, x, y, duration ) {
			var translate,
				transition;

			if ( !duration || duration === undefined ) {
				transition = "none";
			} else {
				transition =  "-webkit-transform " + duration / 1000 + "s ease-out";
			}

			if ( $.support.cssTransform3d ) {
				translate = "translate3d(" + x + "," + y + ", 0px)";
			} else {
				translate = "translate(" + x + "," + y + ")";
			}

			$ele.css({
				"-moz-transform": translate,
				"-webkit-transform": translate,
				"-ms-transform": translate,
				"-o-transform": translate,
				"transform": translate,
				"-webkit-transition": transition
			});
		},

		_setEndEffect: function ( dir ) {
			var scroll_height = this._getViewHeight() - this._$clip.height();

			if ( this._softkeyboard ) {
				if ( this._effect_dir ) {
					this._outerScroll( -scroll_height - this._softkeyboardHeight,
							scroll_height );
				} else {
					this._outerScroll( this._softkeyboardHeight, scroll_height );
				}
				return;
			}

			if ( dir === "in" ) {
				if ( this._endEffect ) {
					return;
				}

				this._endEffect = true;
				this._setOverflowIndicator( this._effect_dir );
				this._showOverflowIndicator();
			} else if ( dir === "out" ) {
				if ( !this._endEffect ) {
					return;
				}

				this._endEffect = false;
			} else {
				this._endEffect = false;
				this._setOverflowIndicator();
				this._showOverflowIndicator();
			}
		},

		_setCalibration: function ( x, y ) {
			if ( this.options.overshootEnable ) {
				this._sx = x;
				this._sy = y;
				return;
			}

			var $v = this._$view,
				$c = this._$clip,
				dirLock = this._directionLock,
				scroll_height = 0,
				scroll_width = 0;

			if ( dirLock !== "y" && this._hTracker ) {
				scroll_width = $v.width() - $c.width();

				if ( x >= 0 ) {
					this._sx = 0;
				} else if ( x < -scroll_width ) {
					this._sx = -scroll_width;
				} else {
					this._sx = x;
				}

				if ( scroll_width < 0 ) {
					this._sx = 0;
				}
			}

			if ( dirLock !== "x" && this._vTracker ) {
				scroll_height = this._getViewHeight() - $c.height();

				if ( y > 0 ) {
					this._sy = 0;

					this._effect_dir = 0;
					this._setEndEffect( "in" );
				} else if ( y < -scroll_height ) {
					this._sy = -scroll_height;

					this._effect_dir = 1;
					this._setEndEffect( "in" );
				} else {
					if ( this._endEffect && this._sy !== y ) {
						this._setEndEffect();
					}

					this._sy = y;
				}

				if ( scroll_height < 0 ) {
					this._sy = 0;
				}
			}
		},

		_setScrollPosition: function ( x, y, duration ) {
			var $v = this._$view,
				sm = this.options.scrollMethod,
				$vsb = this._$vScrollBar,
				$hsb = this._$hScrollBar,
				$sbt;

			this._setCalibration( x, y );

			x = this._sx;
			y = this._sy;

			if ( sm === "translate" ) {
				this._setElementTransform( $v, x + "px", y + "px", duration );
			} else {
				$v.css( {left: x + "px", top: y + "px"} );
			}

			if ( $vsb ) {
				$sbt = $vsb.find(".ui-scrollbar-thumb");

				if ( sm === "translate" ) {
					this._setElementTransform( $sbt, "0px",
						-y / this._getViewHeight() * $sbt.parent().height() + "px",
						duration );
				} else {
					$sbt.css( "top", -y / this._getViewHeight() * 100 + "%" );
				}
			}

			if ( $hsb ) {
				$sbt = $hsb.find(".ui-scrollbar-thumb");

				if ( sm === "translate" ) {
					this._setElementTransform( $sbt,
						-x / $v.width() * $sbt.parent().width() + "px", "0px",
						duration);
				} else {
					$sbt.css("left", -x / $v.width() * 100 + "%");
				}
			}
		},

		_outerScroll: function ( y, scroll_height ) {
			var self = this,
				top = $( window ).scrollTop() - window.screenTop,
				sy = 0,
				duration = this.options.snapbackDuration,
				start = getCurrentTime(),
				tfunc;

			if ( !this.options.outerScrollEnable ) {
				return;
			}

			if ( this._$clip.jqmData("scroll") !== "y" ) {
				return;
			}

			if ( this._outerScrolling ) {
				return;
			}

			if ( y > 0 ) {
				sy = ( window.screenTop ? window.screenTop : -y );
			} else if ( y < -scroll_height ) {
				sy = -y - scroll_height;
			} else {
				return;
			}

			tfunc = function () {
				var elapsed = getCurrentTime() - start;

				if ( elapsed >= duration ) {
					window.scrollTo( 0, top + sy );
					self._outerScrolling = undefined;

					self._stopMScroll();
				} else {
					ec = $.easing.easeOutQuad( elapsed / duration,
							elapsed, 0, 1, duration );

					window.scrollTo( 0, top + ( sy * ec ) );
					self._outerScrolling = setTimeout( tfunc, self._timerInterval );
				}
			};
			this._outerScrolling = setTimeout( tfunc, self._timerInterval );
		},

		_scrollTo: function ( x, y, duration ) {
			var self = this,
				start = getCurrentTime(),
				efunc = $.easing.easeOutQuad,
				sx = this._sx,
				sy = this._sy,
				dx = x - sx,
				dy = y - sy,
				tfunc;

			x = -x;
			y = -y;

			tfunc = function () {
				var elapsed = getCurrentTime() - start,
				    ec;

				if ( elapsed >= duration ) {
					self._timerID = 0;
					self._setScrollPosition( x, y );
				} else {
					ec = efunc( elapsed / duration, elapsed, 0, 1, duration );

					self._setScrollPosition( sx + ( dx * ec ), sy + ( dy * ec ) );
					self._timerID = setTimeout( tfunc, self._timerInterval );
				}
			};

			this._timerID = setTimeout( tfunc, this._timerInterval );
		},

		scrollTo: function ( x, y, duration ) {
			this._stopMScroll();
			this._didDrag = false;

			if ( !duration || this.options.scrollMethod === "translate" ) {
				this._setScrollPosition( x, y, duration );
			} else {
				this._scrollTo( x, y, duration );
			}
		},

		getScrollPosition: function () {
			return { x: -this._sx, y: -this._sy };
		},

		skipDragging: function ( value ) {
			this._skip_dragging = value;
		},

		_getScrollHierarchy: function () {
			var svh = [],
				d;

			this._$clip.parents( ".ui-scrollview-clip").each( function () {
				d = $( this ).jqmData("scrollview");
				if ( d ) {
					svh.unshift( d );
				}
			} );
			return svh;
		},

		_getAncestorByDirection: function ( dir ) {
			var svh = this._getScrollHierarchy(),
				n = svh.length,
				sv,
				svdir;

			while ( 0 < n-- ) {
				sv = svh[n];
				svdir = sv.options.direction;

				if (!svdir || svdir === dir) {
					return sv;
				}
			}
			return null;
		},

		_handleDragStart: function ( e, ex, ey ) {
			this._stopMScroll();

			this._didDrag = false;
			this._skip_dragging = false;

			var target = $( e.target ),
				self = this,
				$c = this._$clip,
				svdir = this.options.direction;

			/* should prevent the default behavior when click the button */
			this._is_button = target.is( '.ui-btn' ) ||
					target.is( '.ui-btn-text' ) ||
					target.is( '.ui-btn-inner' ) ||
					target.is( '.ui-btn-inner .ui-icon' );

			/* should prevent the default behavior when click the slider */
			if ( target.parents('.ui-slider').length || target.is('.ui-slider') ) {
				this._skip_dragging = true;
				return;
			}

			if ( target.is('textarea') ) {
				target.bind( "scroll", function () {
					self._skip_dragging = true;
					target.unbind("scroll");
				});
			}

			/*
			 * We need to prevent the default behavior to
			 * suppress accidental selection of text, etc.
			 */
			this._is_inputbox = target.is(':input') ||
					target.parents(':input').length > 0;

			if ( this._is_inputbox ) {
				target.one( "resize.scrollview", function () {
					if ( ey > $c.height() ) {
						self.scrollTo( -ex, self._sy - ey + $c.height(),
							self.options.snapbackDuration );
					}
				});
			}

			if ( this.options.eventType === "mouse" && !this._is_inputbox && !this._is_button ) {
				e.preventDefault();
			}

			this._lastX = ex;
			this._lastY = ey;
			this._startY = ey;
			this._doSnapBackX = false;
			this._doSnapBackY = false;
			this._speedX = 0;
			this._speedY = 0;
			this._directionLock = "";

			this._lastMove = 0;
			this._enableTracking();

			this._set_scrollbar_size();
		},

		_propagateDragMove: function ( sv, e, ex, ey, dir ) {
			this._hideScrollBars();
			this._hideOverflowIndicator();
			this._disableTracking();
			sv._handleDragStart( e, ex, ey );
			sv._directionLock = dir;
			sv._didDrag = this._didDrag;
		},

		_handleDragMove: function ( e, ex, ey ) {
			if ( this._skip_dragging ) {
				return;
			}

			if ( !this._dragging ) {
				return;
			}

			if ( !this._is_inputbox && !this._is_button ) {
				e.preventDefault();
			}

			var mt = this.options.moveThreshold,
				dx = ex - this._lastX,
				dy = ey - this._lastY,
				svdir = this.options.direction,
				dir = null,
				x,
				y,
				sv,
				scope,
				newX,
				newY,
				dirLock;

			this._lastMove = getCurrentTime();

			if ( !this._directionLock ) {
				x = Math.abs( dx );
				y = Math.abs( dy );

				if ( x < mt && y < mt ) {
					return false;
				}

				if ( x < y && (x / y) < 0.5 ) {
					dir = "y";
				} else if ( x > y && (y / x) < 0.5 ) {
					dir = "x";
				}

				if ( svdir && dir && svdir !== dir ) {
					/*
					 * This scrollview can't handle the direction the user
					 * is attempting to scroll. Find an ancestor scrollview
					 * that can handle the request.
					 */

					sv = this._getAncestorByDirection( dir );
					if ( sv ) {
						this._propagateDragMove( sv, e, ex, ey, dir );
						return false;
					}
				}

				this._directionLock = svdir || (dir || "none");
			}

			newX = this._sx;
			newY = this._sy;
			dirLock = this._directionLock;

			if ( dirLock !== "y" && this._hTracker ) {
				x = this._sx;
				this._speedX = dx;
				newX = x + dx;

				this._doSnapBackX = false;

				scope = ( newX > 0 || newX < this._maxX );

				if ( scope && dirLock === "x" ) {
					sv = this._getAncestorByDirection("x");
					if ( sv ) {
						this._setScrollPosition( newX > 0 ?
								0 : this._maxX, newY );
						this._propagateDragMove( sv, e, ex, ey, dir );
						return false;
					}

					newX = x + ( dx / 2 );
					this._doSnapBackX = true;
				}
			}

			if ( dirLock !== "x" && this._vTracker ) {
				if ( Math.abs( this._startY - ey ) < mt && dirLock !== "xy" ) {
					return;
				}

				y = this._sy;
				this._speedY = dy;
				newY = y + dy;

				this._doSnapBackY = false;

				scope = ( newY > 0 || newY < this._maxY );

				if ( scope && dirLock === "y" ) {
					sv = this._getAncestorByDirection("y");
					if ( sv ) {
						this._setScrollPosition( newX,
								newY > 0 ? 0 : this._maxY );
						this._propagateDragMove( sv, e, ex, ey, dir );
						return false;
					}

					newY = y + ( dy / 2 );
					this._doSnapBackY = true;
				}
			}

			if ( this.options.overshootEnable === false ) {
				this._doSnapBackX = false;
				this._doSnapBackY = false;
			}

			this._lastX = ex;
			this._lastY = ey;

			this._setScrollPosition( newX, newY );

			if ( this._didDrag === false ) {
				this._didDrag = true;
				this._showScrollBars();
				this._showOverflowIndicator();

				this._$clip.parents(".ui-scrollview-clip").each( function () {
					$( this ).scrollview( "skipDragging", true );
				} );
			}
		},

		_handleDragStop: function ( e ) {
			var self = this;

			if ( this._skip_dragging ) {
				return;
			}

			var l = this._lastMove,
				t = getCurrentTime(),
				doScroll = (l && (t - l) <= this.options.moveIntervalThreshold),
				sx = ( this._hTracker && this._speedX && doScroll ) ?
						this._speedX : ( this._doSnapBackX ? 1 : 0 ),
				sy = ( this._vTracker && this._speedY && doScroll ) ?
						this._speedY : ( this._doSnapBackY ? 1 : 0 ),
				svdir = this.options.direction,
				x,
				y;

			if ( sx || sy ) {
				if ( !this._setGestureScroll( sx, sy ) ) {
					this._startMScroll( sx, sy );
				}
			} else {
				this._hideScrollBars();
				this._hideOverflowIndicator();
			}

			this._disableTracking();

			if ( this._endEffect ) {
				setTimeout( function () {
					self._setEndEffect( "out" );
					self._hideScrollBars();
					self._hideOverflowIndicator();
				}, 300 );
			}

			return !this._didDrag;
		},

		_setGestureScroll: function ( sx, sy ) {
			var self = this,
				reset = function () {
					clearTimeout( self._gesture_timer );
					self._gesture_dir = 0;
					self._gesture_timer = undefined;
				},
				direction = {
					top: 0,
					bottom: 1,
					left: 2,
					right: 3
				};

			if ( !sy && !sx ) {
				return false;
			}

			if ( Math.abs( sx ) > Math.abs( sy ) ) {
				dir = sx > 0 ? direction.left : direction.right;
			} else {
				dir = sy > 0 ? direction.top : direction.bottom;
			}

			if ( !this._gesture_timer ) {
				this._gesture_dir = dir;

				this._gesture_timer = setTimeout( function () {
					reset();
				}, 1000 );

				return false;
			}

			if ( this._gesture_dir !== dir ) {
				reset();
				return false;
			}

			return false;
		},

		_enableTracking: function () {
			this._dragging = true;
		},

		_disableTracking: function () {
			this._dragging = false;
		},

		_showScrollBars: function ( interval ) {
			var vclass = "ui-scrollbar-visible",
				self = this;

			if ( !this.options.showScrollBars ) {
				return;
			}
			if ( this._scrollbar_showed ) {
				return;
			}

			if ( this._$vScrollBar ) {
				this._$vScrollBar.addClass( vclass );
			}
			if ( this._$hScrollBar ) {
				this._$hScrollBar.addClass( vclass );
			}

			this._scrollbar_showed = true;

			if ( interval ) {
				setTimeout( function () {
					self._hideScrollBars();
				}, interval );
			}
		},

		_hideScrollBars: function () {
			var vclass = "ui-scrollbar-visible";

			if ( !this.options.showScrollBars ) {
				return;
			}
			if ( !this._scrollbar_showed ) {
				return;
			}

			if ( this._$vScrollBar ) {
				this._$vScrollBar.removeClass( vclass );
			}
			if ( this._$hScrollBar ) {
				this._$hScrollBar.removeClass( vclass );
			}

			this._scrollbar_showed = false;
		},

		_setOverflowIndicator: function ( dir ) {
			if ( dir === 1 ) {
				this._opacity_top = "0";
				this._opacity_bottom = "0.8";
			} else if ( dir === 0 ) {
				this._opacity_top = "0.8";
				this._opacity_bottom = "0";
			} else {
				this._opacity_top = "0.5";
				this._opacity_bottom = "0.5";
			}
		},

		_showOverflowIndicator: function () {
			if ( !this.options.overflowEnable || !this._overflowAvail || this._softkeyboard ) {
				return;
			}

			this._overflow_top.animate( { opacity: this._opacity_top }, 300 );
			this._overflow_bottom.animate( { opacity: this._opacity_bottom }, 300 );

			this._overflow_showed = true;
		},

		_hideOverflowIndicator: function () {
			if ( !this.options.overflowEnable || !this._overflowAvail || this._softkeyboard ) {
				return;
			}

			if ( this._overflow_showed === false ) {
				return;
			}

			this._overflow_top.animate( { opacity: 0 }, 300 );
			this._overflow_bottom.animate( { opacity: 0 }, 300 );

			this._overflow_showed = false;
			this._setOverflowIndicator();
		},

		_add_event: function () {
			var self = this,
				$c = this._$clip,
				$v = this._$view;

			if ( this.options.eventType === "mouse" ) {
				this._dragEvt = "mousedown mousemove mouseup click mousewheel";

				this._dragCB = function ( e ) {
					switch ( e.type ) {
					case "mousedown":
						return self._handleDragStart( e,
								e.clientX, e.clientY );

					case "mousemove":
						return self._handleDragMove( e,
								e.clientX, e.clientY );

					case "mouseup":
						return self._handleDragStop( e );

					case "click":
						return !self._didDrag;

					case "mousewheel":
						var old = self.getScrollPosition();
						self.scrollTo( -old.x,
							-(old.y - e.originalEvent.wheelDelta) );
						break;
					}
				};
			} else {
				this._dragEvt = "touchstart touchmove touchend click";

				this._dragCB = function ( e ) {
					var touches = e.originalEvent.touches;

					switch ( e.type ) {
					case "touchstart":
						if ( touches.length != 1) {
							return;
						}

						return self._handleDragStart( e,
								touches[0].pageX, touches[0].pageY );

					case "touchmove":
						if ( touches.length != 1) {
							return;
						}

						return self._handleDragMove( e,
								touches[0].pageX, touches[0].pageY );

					case "touchend":
						if ( touches.length != 0) {
							return;
						}

						return self._handleDragStop( e );

					case "click":
						return !self._didDrag;
					}
				};
			}

			$v.bind( this._dragEvt, this._dragCB );

			$v.bind( "keydown", function ( e ) {
				var elem,
					elem_top,
					scroll_top = $( window ).scrollTop() - window.screenTop,
					screen_h;

				if ( e.keyCode == 9 ) {
					return false;
				}

				elem = $c.find(".ui-focus");

				if ( elem === undefined ) {
					return;
				}

				elem_top = elem.offset().top - scroll_top;
				screen_h = $c.offset().top + $c.height() - elem.height();

				if ( self._softkeyboard ) {
					screen_h -= self._softkeyboardHeight;
				}

				if ( ( elem_top < $c.offset().top ) || ( elem_top > screen_h ) ) {
					self.scrollTo( 0, self._sy -
							( elem_top - $c.offset().top - elem.height() ) );
				}

				return;
			});

			$v.bind( "keyup", function ( e ) {
				var input,
					elem,
					elem_top,
					scroll_top = $( window ).scrollTop() - window.screenTop,
					screen_h;

				if ( e.keyCode != 9 ) {
					return;
				}

				/* Tab Key */

				input = $( this ).find(":input");

				for ( i = 0; i < input.length; i++ ) {
					if ( !$( input[i] ).hasClass("ui-focus") ) {
						continue;
					}

					if ( i + 1 == input.length ) {
						elem = $( input[0] );
					} else {
						elem = $( input[i + 1] );
					}

					elem_top = elem.offset().top - scroll_top;
					screen_h = $c.offset().top + $c.height() - elem.height();

					if ( self._softkeyboard ) {
						screen_h -= self._softkeyboardHeight;
					}

					if ( ( elem_top < 0 ) || ( elem_top > screen_h ) ) {
						self.scrollTo( 0, self._sy - elem_top +
							elem.height() + $c.offset().top, 0);
					}

					elem.focus();

					break;
				}

				return false;
			});

			$c.bind( "updatelayout", function ( e ) {
				var sy,
					vh,
					view_h = self._getViewHeight();

				if ( !$c.height() || !view_h ) {
					self.scrollTo( 0, 0, 0 );
					return;
				}

				sy = $c.height() - view_h;
				vh = view_h - self._view_height;

				self._view_height = view_h;

				if ( vh == 0 || vh > $c.height() / 2 ) {
					return;
				}

				if ( sy > 0 ) {
					self.scrollTo( 0, 0, 0 );
				} else if ( self._sy - sy <= -vh ) {
					self.scrollTo( 0, self._sy,
						self.options.snapbackDuration );
				} else if ( self._sy - sy <= vh + self.options.moveThreshold ) {
					self.scrollTo( 0, sy,
						self.options.snapbackDuration );
				}
			});

			$( window ).bind( "resize", function ( e ) {
				var focused,
					view_h = self._getViewHeight();

				if ( $(".ui-page-active").get(0) !== $c.closest(".ui-page").get(0) ) {
					return;
				}

				if ( !$c.height() || !view_h ) {
					return;
				}

				focused = $c.find(".ui-focus");

				if ( focused ) {
					focused.trigger("resize.scrollview");
				}

				/* calibration - after triggered throttledresize */
				setTimeout( function () {
					if ( self._sy < $c.height() - self._getViewHeight() ) {
						self.scrollTo( 0, $c.height() - self._getViewHeight(),
							self.options.overshootDuration );
					}
				}, 260 );

				self._view_height = view_h;
			});

			$( window ).bind( "vmouseout", function ( e ) {
				var drag_stop = false;

				if ( $(".ui-page-active").get(0) !== $c.closest(".ui-page").get(0) ) {
					return;
				}

				if ( !self._dragging ) {
					return;
				}

				if ( e.pageX < 0 || e.pageX > $( window ).width() ) {
					drag_stop = true;
				}

				if ( e.pageY < 0 || e.pageY > $( window ).height() ) {
					drag_stop = true;
				}

				if ( drag_stop ) {
					self._hideScrollBars();
					self._hideOverflowIndicator();
					self._disableTracking();
				}
			});

			this._softkeyboard = false;
			this._softkeyboardHeight = 0;

			window.addEventListener( "softkeyboardchange", function ( e ) {
				if ( $(".ui-page-active").get(0) !== $c.closest(".ui-page").get(0) ) {
					return;
				}

				self._softkeyboard = ( e.state === "on" ? true : false );
				self._softkeyboardHeight = parseInt( e.height ) *
						( $( window ).width() / window.screen.availWidth );
			});

			$c.closest(".ui-page")
				.bind( "pageshow", function ( e ) {
					/* should be called after pagelayout */
					setTimeout( function () {
						self._view_height = self._getViewHeight();
						self._set_scrollbar_size();
						self._setScrollPosition( self._sx, self._sy );
						self._showScrollBars( 2000 );
					}, 0 );
				});
		},

		_add_scrollbar: function () {
			var $c = this._$clip,
				prefix = "<div class=\"ui-scrollbar ui-scrollbar-",
				suffix = "\"><div class=\"ui-scrollbar-track\"><div class=\"ui-scrollbar-thumb\"></div></div></div>";

			if ( !this.options.showScrollBars ) {
				return;
			}

			if ( this._vTracker ) {
				$c.append( prefix + "y" + suffix );
				this._$vScrollBar = $c.children(".ui-scrollbar-y");
			}
			if ( this._hTracker ) {
				$c.append( prefix + "x" + suffix );
				this._$hScrollBar = $c.children(".ui-scrollbar-x");
			}

			this._scrollbar_showed = false;
		},

		_add_scroll_jump: function () {
			var $c = this._$clip,
				self = this,
				top_btn,
				left_btn;

			if ( !this.options.scrollJump ) {
				return;
			}

			if ( this._vTracker ) {
				top_btn = $( '<div class="ui-scroll-jump-top-bg">' +
						'<div data-role="button" data-inline="true" data-icon="scrolltop" data-style="box"></div></div>' );
				$c.append( top_btn ).trigger("create");

				top_btn.bind( "vclick", function () {
					self.scrollTo( 0, 0, self.options.overshootDuration );
				} );
			}

			if ( this._hTracker ) {
				left_btn = $( '<div class="ui-scroll-jump-left-bg">' +
						'<div data-role="button" data-inline="true" data-icon="scrollleft" data-style="box"></div></div>' );
				$c.append( left_btn ).trigger("create");

				left_btn.bind( "vclick", function () {
					self.scrollTo( 0, 0, self.options.overshootDuration );
				} );
			}
		},

		_add_overflow_indicator: function () {
			if ( !this.options.overflowEnable ) {
				return;
			}

			this._overflow_top = $( '<div class="ui-overflow-indicator-top"></div>' );
			this._overflow_bottom = $( '<div class="ui-overflow-indicator-bottom"></div>' );

			this._$clip.append( this._overflow_top );
			this._$clip.append( this._overflow_bottom );

			this._opacity_top = "0.5";
			this._opacity_bottom = "0.5";
			this._overflow_showed = false;
		},

		_set_scrollbar_size: function () {
			var $c = this._$clip,
				$v = this._$view,
				cw = 0,
				vw = 0,
				ch = 0,
				vh = 0,
				thumb;

			if ( !this.options.showScrollBars ) {
				return;
			}

			if ( this._hTracker ) {
				cw = $c.width();
				vw = $v.width();
				this._maxX = cw - vw;

				if ( this._maxX > 0 ) {
					this._maxX = 0;
				}
				if ( this._$hScrollBar && vw ) {
					thumb = this._$hScrollBar.find(".ui-scrollbar-thumb");
					thumb.css( "width", (cw >= vw ? "0" :
							(Math.floor(cw / vw * 100) || 1) + "%") );
				}
			}

			if ( this._vTracker ) {
				ch = $c.height();
				vh = this._getViewHeight();
				this._maxY = ch - vh;

				if ( this._maxY > 0 || vh === 0 ) {
					this._maxY = 0;
				}
				if ( ( this._$vScrollBar && vh ) || vh === 0 ) {
					thumb = this._$vScrollBar.find(".ui-scrollbar-thumb");
					thumb.css( "height", (ch >= vh ? "0" :
							(Math.floor(ch / vh * 100) || 1) + "%") );

					this._overflowAvail = !!thumb.height();
				}
			}
		}
	});

	$.extend( MomentumTracker.prototype, {
		start: function ( pos, speed, duration, minPos, maxPos ) {
			var tstate = ( pos < minPos || pos > maxPos ) ?
					tstates.snapback : tstates.scrolling,
				pos_temp;

			this.state = ( speed !== 0 ) ? tstate : tstates.done;
			this.pos = pos;
			this.speed = speed;
			this.duration = ( this.state === tstates.snapback ) ?
					this.options.snapbackDuration : duration;
			this.minPos = minPos;
			this.maxPos = maxPos;

			this.fromPos = ( this.state === tstates.snapback ) ? this.pos : 0;
			pos_temp = ( this.pos < this.minPos ) ? this.minPos : this.maxPos;
			this.toPos = ( this.state === tstates.snapback ) ? pos_temp : 0;

			this.startTime = getCurrentTime();
		},

		reset: function () {
			this.state = tstates.done;
			this.pos = 0;
			this.speed = 0;
			this.minPos = 0;
			this.maxPos = 0;
			this.duration = 0;
			this.remained = 0;
		},

		update: function ( overshootEnable ) {
			var state = this.state,
				cur_time = getCurrentTime(),
				duration = this.duration,
				elapsed =  cur_time - this.startTime,
				dx,
				x,
				didOverShoot;

			if ( state === tstates.done ) {
				return this.pos;
			}

			elapsed = elapsed > duration ? duration : elapsed;

			this.remained = duration - elapsed;

			if ( state === tstates.scrolling || state === tstates.overshot ) {
				dx = this.speed *
					( 1 - $.easing[this.easing]( elapsed / duration,
								elapsed, 0, 1, duration ) );

				x = this.pos + dx;

				didOverShoot = ( state === tstates.scrolling ) &&
					( x < this.minPos || x > this.maxPos );

				if ( didOverShoot ) {
					x = ( x < this.minPos ) ? this.minPos : this.maxPos;
				}

				this.pos = x;

				if ( state === tstates.overshot ) {
					if ( !overshootEnable ) {
						this.state = tstates.done;
					}
					if ( elapsed >= duration ) {
						this.state = tstates.snapback;
						this.fromPos = this.pos;
						this.toPos = ( x < this.minPos ) ?
								this.minPos : this.maxPos;
						this.duration = this.options.snapbackDuration;
						this.startTime = cur_time;
						elapsed = 0;
					}
				} else if ( state === tstates.scrolling ) {
					if ( didOverShoot && overshootEnable ) {
						this.state = tstates.overshot;
						this.speed = dx / 2;
						this.duration = this.options.overshootDuration;
						this.startTime = cur_time;
					} else if ( elapsed >= duration ) {
						this.state = tstates.done;
					}
				}
			} else if ( state === tstates.snapback ) {
				if ( elapsed >= duration ) {
					this.pos = this.toPos;
					this.state = tstates.done;
				} else {
					this.pos = this.fromPos + (( this.toPos - this.fromPos ) *
						$.easing[this.easing]( elapsed / duration,
							elapsed, 0, 1, duration ));
				}
			}

			return this.pos;
		},

		done: function () {
			return this.state === tstates.done;
		},

		isMin: function () {
			return this.pos === this.minPos;
		},

		isMax: function () {
			return this.pos === this.maxPos;
		},

		isAvail: function () {
			return !( this.minPos === this.maxPos );
		},

		getRemained: function () {
			return this.remained;
		},

		getPosition: function () {
			return this.pos;
		}
	});

	$( document ).bind( 'pagecreate create', function ( e ) {
		var $page = $( e.target ),
			content_scroll = $page.find(".ui-content").jqmData("scroll");

		/* content scroll */
		if ( $.support.scrollview === undefined ) {
			$.support.scrollview = true;
		}

		if ( $.support.scrollview === true && content_scroll === undefined ) {
			content_scroll = "y";
		}

		if ( content_scroll !== "y" ) {
			content_scroll = "none";
		}

		$page.find(".ui-content").attr( "data-scroll", content_scroll );

		$page.find(":jqmData(scroll)").not(".ui-scrollview-clip").each( function () {
			if ( $( this ).hasClass("ui-scrolllistview") ) {
				$( this ).scrolllistview();
			} else {
				var st = $( this ).jqmData("scroll"),
					dir = st && ( st.search(/^[xy]/) !== -1 ) ? st : null,
					content = $(this).hasClass("ui-content"),
					opts;

				if ( st === "none" ) {
					return;
				}

				opts = {
					direction: dir || undefined,
					overflowEnable: content,
					scrollMethod: $( this ).jqmData("scroll-method") || undefined,
					scrollJump: $( this ).jqmData("scroll-jump") || undefined
				};

				$( this ).scrollview( opts );
			}
		});
	});

	$( document ).bind( 'pageshow', function ( e ) {
		var $page = $( e.target ),
			scroll = $page.find(".ui-content").jqmData("scroll");

		if ( scroll === "y" ) {
			resizePageContentHeight( e.target );
		}
	});

}( jQuery, window, document ) );

