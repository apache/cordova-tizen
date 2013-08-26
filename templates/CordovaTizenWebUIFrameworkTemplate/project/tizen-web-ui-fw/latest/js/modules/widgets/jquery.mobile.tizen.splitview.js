//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Show different HTML contents at the same time on each divided pane.
//>>label: Split view
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	'../jquery.mobile.tizen.scrollview'
	], function ( ) {

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
 *  Author: Sanghee Lee <sang-hee.lee@samsung.com>
*/

/**
 *  Splitview is a widget which can show different HTML contents at the same time on each divided pane.
 *  A user can place Splitview controls on JQuery Mobile's Content area and arrange two panes on the widget.
 *  And HTML fragments or another Splitview also can be placed on the pane.
 *  The number of panes inside of Splitview is restricted as two.
 *  If a user define only one pane in Splitview, a empty pane will be added automatically,
 *  on the other hand, if 3 or more panes are defined in Splitview, the panes after two will be ignored and removed from the DOM tree.
 *  The HTML fragments of a pane should be composed of elements describing a part of Web page (e.g. <div>...</div>).
 *  Also widgets can be included in the HTML fragments.
 *
 *  HTML Attributes:
 *
 *      data-fixed : The resizing mode of panes - fixed and flexible mode.
 *              If the value is true, the panes' sizes will be fixed, or if not, it will be flexible. (Default : false)
 *      data-divider-vertical : The direction of dividers.
 *              If the value is true, the panes will be placed in horizontal direction,
 *              or if not, it will be placed in vertical direction. (Default : "true")
 *      data-ratio : The ratio of two panes' widths or heights. (Default : [ 1/2, 1/2 ]
 *
 *  APIs:
 *
 *      pane ( id [ , element ] )
 *          : This method replaces child contents of a pane indicated by id attribute with contents of inputted element.
 *            If second argument is not specified, it will act as a getter method.
 *            The string of id has to be started with "#" which means "id" of CSS selectors.
 *      maximize ( id )
 *          : This method maximizes a pane's size indicated by id.
 *            The string of id has to be started with "#" which means "id" of CSS selectors.
 *      restore ()
 *          : This method restores all panes' sizes to the ratio prior to maximization.
 *
 *  Examples:
 *
 *      <div data-role="splitview" data-fixed="false" data-divider-vertical="true" data-ratio="0.5, 0.5">
 *          <div class="ui-pane">pane0</div>
 *          <div class="ui-pane">pane1</div>
 *      </div>
 *
 */


/**
	@class Splitview
	Splitview widget enables a user to place and arrange several panes. Each divided pane can show repective HTML contents.

	To add a Splitview widget to the application, use the following code:

		<div data-role="splitview" data-fixed="false" data-divider-vertical="true" data-ratio="0.5, 0.5">
			<div class="ui-pane">pane0</div>
			<div class="ui-pane">pane1</div>
		</div>
*/

/**
	@property {Boolean} data-fixed
	The resizing mode of panes - fixed and flexible mode.
*/

/**
	@property {Boolean} data-divider-vertical
	The direction of dividers - horizontal or vertical.
 */

/**
	@property {Array} data-ratio
	The ratio of two panes' widths or heights.
*/

/**
	@method pane
	This method replaces child contents of a pane indicated by id attribute with contents of inputted element.
	If second argument is not specified, it will act as a getter method.

		<div data-role="splitview">
			<div class="ui-pane" id="pane0">pane0</div>
			<div class="ui-pane" id="pane1">pane1</div>
		</div>
		$(".selector").splitview("pane", id, element);
*/

/**
	@method maximize
	This method maximizes a pane's size indicated by id.

		<div data-role="splitview">
			<div class="ui-pane" id="pane0">pane0</div>
			<div class="ui-pane" id="pane1">pane1</div>
		</div>
		$(".selector").splitview("maximize", id);
*/

/**
	@method restore
	This method restores all panes' sizes to the ratio prior to maximization.

		<div data-role="splitview">
			<div class="ui-pane" id="pane0">pane0</div>
			<div class="ui-pane" id="pane1">pane1</div>
		</div>
		$(".selector").splitview("restore");
*/

( function ( $, window, document, undefined ) {
	$.widget( "tizen.splitview", $.mobile.widget, {
		options : {
			fixed : false,
			dividerVertical : true,
			ratio : [],
			initSelector : ":jqmData(role='splitview')"
		},

		_create : function () {
			var self = this,
				$el = self.element,
				opt = self.options,
				$panes = $el.children( ".ui-pane" ),
				panesLength = $panes.length,
				spliters = [],
				spliterBars = [],
				ratioAttr = this.element.attr( "data-ratio" ),
				containerSize = [ 0, 0 ],
				resizeTimer = null,
				i = 0;

			if ( panesLength !== 2 ) {
				if ( panesLength < 2 ) {
					for ( i = panesLength ; i < 2 ; ++i ) {
						self._addEmptyPanes();
					}
				} else {
					$panes.slice( 2 ).remove();
				}

				$panes = $el.children( ".ui-pane" );
				panesLength = $panes.length;
			}

			spliters[ 0 ] = $( "<a href='#' class='ui-spliter' aria-label='Drag scroll, double tap and move to adjust split area'></a>" ).insertAfter( $panes[ 0 ] );
			spliterBars[ 0 ] = $( "<div class='ui-spliter-bar'></div>" ).appendTo( spliters[ 0 ] );
			$( "<div class='ui-spliter-handle'></div>" ).appendTo( spliterBars[ 0 ] );

			$.extend( this, {
				moveTarget : null,
				moveData : {},
				spliters : spliters,
				spliterBars : spliterBars,
				panes : $panes,
				containerSize : containerSize,
				touchStatus : false,
				minPaneWidth : 50,
				savedRatio : []
			});

			self._bindTouchEvents();
			self._convertRatio( ratioAttr, $panes.length );

			$el.addClass( "ui-splitview ui-direction-" + self._direction( opt.dividerVertical ) );

			self._refresh();

			$( window ).unbind( ".splitview" )
				.bind( "pagechange.splitview resize.splitview", function ( event ) {
					$( ".ui-page-active .ui-splitview" ).each( function () {
						$( this ).data( "splitview" )._refresh();
					});
				});
		},

		_addEmptyPanes : function () {
			var self = this,
				$el = self.element,
				opt = self.options,
				$panes = $el.children( ".ui-pane" ),
				scrollAttribute = ( $.support.scrollview ) ? "data-scroll='y'" : "",
				pane = $( "<div class='ui-pane' " + scrollAttribute + "></div>" );

			if ( scrollAttribute.length ) {
				pane.scrollview( { direction: "y" } );
			}

			if ( !$panes.length ) {
				$el.append( pane );
			} else {
				$panes.last().after( pane );
			}
		},

		_direction : function ( isHorizontal ) {
			return isHorizontal ? "horizontal" : "vertical";
		},

		_isStyleSpecified : function ( cssString ) {
			return ( typeof cssString !== "undefined" && cssString.length );
		},

		_getContainerSize : function ( widthString, heightString ) {
			var self = this,
				$el = self.element,
				widthSpecified = self._isStyleSpecified( widthString ),
				heightSpecified = self._isStyleSpecified( heightString );

			self.containerSize[ 0 ] = ( widthSpecified ) ? $el.outerWidth( true ) : self._parentWidth();
			self.containerSize[ 1 ] = ( heightSpecified ) ? $el.outerHeight( true ) : self._parentHeight();

			if ( !self.containerSize[ 0 ] || !self.containerSize[ 1 ] ) {
				return false;
			}

			return true;
		},

		_parentWidth : function () {
			var $parent = this.element.parent();

			if ( !$parent && typeof $parent === "undefined" && !$parent.length ) {
				return $( window ).width();
			}

			return $parent.width();
		},

		_parentHeight : function () {
			var $parent = this.element.parent(),
				heightString = "",
				heightSpecified = false,
				parentHeight = 0;

			while ( $parent && typeof $parent !== "undefined" && $parent.length ) {
				if ( typeof $parent[ 0 ].style !== "undefined" ) {
					heightString = $parent[ 0 ].style.height;
					heightSpecified = ( typeof heightString !== "undefined" && heightString.length );
					if ( heightSpecified ) {
						parentHeight = $parent.height();
						break;
					}
				}

				$parent = $parent.parent();
			}

			if ( !heightSpecified ) {
				parentHeight = $(window).height();
			}

			return parentHeight;
		},

		_convertRatio : function ( ratioParam, panesLength ) {
			var self = this,
				ratio = [],
				loop = 0,
				type = typeof ratioParam,
				ratioArray = null,
				i;

			for ( i = 0; i < panesLength; ++i ) {
				ratio.push( 0 );
			}

			switch ( type ) {
			case "number":
				if ( panesLength ) {
					ratio[ 0 ] = ratioParam;
				}
				break;

			case "string":
				ratioArray = ratioParam.split( "," );
				loop = Math.min( ratioArray.length, panesLength );
				for ( i = 0; i < loop; ++i ) {
					ratio[ i ] = parseFloat( ratioArray[ i ] );
				}
				break;

			case "object":
				if ( !$.isArray( ratioParam ) ) {
					break;
				}

				loop = Math.min( ratioParam.length, panesLength );
				for ( i = 0; i < loop; ++i ) {
					type = typeof ratioParam[ i ];
					ratio[ i ] = ( type === "string" ) ? parseFloat( ratioParam[ i ] ) :
								( type === "number" ) ? ratioParam[ i ] : 0;
				}
				break;
			}

			self.options.ratio = ratio;
			self._adjustRatio( panesLength );
		},

		_adjustRatio : function ( panesLength ) {
			var self = this,
				ratio = self.options.ratio,
				sum = 0,
				remain = 0,
				value = 0,
				subValue = 0,
				subRemain = 0,
				i;

			if ( !panesLength ) {
				self.options.ratio = [];
				return;
			}

			for ( i in ratio ) {
				sum += ratio[ i ];
			}

			if ( sum !== 1 ) {
				remain = 1 - sum;
				value = remain / panesLength;

				for ( i in ratio ) {
					if ( value >= 0 ) {
						ratio[ i ] += value;
						remain = Math.max( 0, remain - value );
					} else {
						subRemain += value;
						subValue = Math.max( subRemain, ratio[ i ] * -1 );
						ratio[ i ] = Math.max( 0, ratio[ i ] + subValue );
						remain = Math.min( 0, remain - subValue );
						subRemain -= subValue;
					}
				}

				if ( remain ) {
					if ( remain > 0 ) {
						ratio[ ratio.length - 1 ] += remain;
					} else {
						for ( i = ratio.length - 1; i >= 0; --i ) {
							subValue = Math.max( remain, ratio[ i ] * -1 );
							ratio[ i ] = Math.max( 0, ratio[ i ] + subValue );
							remain = Math.min( 0, remain - subValue );
							if ( !remain ) {
								break;
							}
						}
					}
				}

				self.options.ratio = ratio;
			}
		},

		_setOption : function ( key, value ) {
			var self = this,
				orgValue = self.options[ key ];

			if ( orgValue === value ) {
				return;
			}

			$.Widget.prototype._setOption.apply( this, arguments );

			switch ( key ) {
			case "fixed":
				self._fixed( value );
				break;

			case "dividerVertical":
				self._dividerVertical( value );
				break;

			case "ratio":
				self._ratio( value );
				break;
			}
		},

		_subtractDiffWidth : function ( width, diff ) {
			var self = this;

			if ( width <= self.minPaneWidth ) {
				return {
					width: width,
					diff: diff
				};
			}

			width += diff;
			if ( width >= self.minPaneWidth ) {
				return {
					width: width,
					diff: 0
				};
			}

			return {
				width: self.minPaneWidth,
				diff: width - self.minPaneWidth
			};
		},

		_initRatio : function ( fromFirstPane, panes, isHorizontal, availableWidth ) {
			var self = this,
				sum = 0,
				widths = [],
				diff = 0,
				panesLength = panes.length,
				ret,
				i;

			panes.each( function ( i ) {
				var pane = $( this );
				widths.push( isHorizontal ? pane.width() : pane.height() );
				sum += widths[ i ];
			});

			diff = availableWidth - sum;
			if ( !diff ) {
				return widths;
			}

			if ( diff > 0 ) {
				widths[ fromFirstPane ? 0 : panesLength - 1 ] += diff;
			} else {
				if ( fromFirstPane ) {
					for ( i = 0; i < panesLength; ++i ) {
						ret = self._subtractDiffWidth( widths[ i ], diff );
						widths[ i ] = ret.width;
						diff = ret.diff;
						if ( !diff ) {
							break;
						}
					}
				} else {
					for ( i = panesLength - 1; i >= 0; --i ) {
						diff = self._subtractDiffWidth( widths[ i ], diff );
						widths[ i ] = ret.width;
						diff = ret.diff;
						if ( !diff ) {
							break;
						}
					}
				}
			}

			sum = 0;
			for ( i in widths ) {
				sum += widths[ i ];
			}

			for ( i in self.options.ratio ) {
				self.options.ratio[ i ] = widths[ i ] / sum;
			}

			return widths;
		},

		_horizontalBoundary : function () {
			var self = this,
				$el = self.element;

			return $el.outerWidth( true ) - $el.width();
		},

		_verticalBoundary : function () {
			var self = this,
				$el = self.element;

			return $el.outerHeight( true ) - $el.height();
		},

		_boundary : function ( type ) {
			var self = this,
				$el = self.element,
				computedStyle = window.getComputedStyle( $el[ 0 ], null ),
				margin = parseFloat( computedStyle[ "margin" + type ] ),
				border = parseFloat( computedStyle[ "border" + type + "Width" ] ),
				padding = parseFloat( computedStyle[ "padding" + type ] );

			return {
				margin: margin,
				border: border,
				padding: padding
			};
		},

		_layout : function ( initRatio, fromFirstPane ) {
			var self = this,
				$el = self.element,
				opt = self.options,
				isHorizontal = opt.dividerVertical,
				$panes = self.panes,
				spliters = self.spliters,
				spliterBars = self.spliterBars,
				spliterBar = self.spliterBars.length ? $( spliterBars[ 0 ] ) : null,
				spliterWidth = !spliterBar ? 0 :
								isHorizontal ? spliterBar.outerWidth() :
												spliterBar.outerHeight(),
				spliterBarMargin = !spliterBar ? 0 :
									isHorizontal ?
										spliterBar.outerWidth( true ) - spliterBar.outerWidth() :
										spliterBar.outerHeight( true ) - spliterBar.outerHeight(),
				panesLength = $panes.length,
				currentAvailable = 0,
				spliterSize = spliterWidth * ( panesLength - 1 ),
				parentWidth = self.containerSize[ 0 ],
				parentHeight = self.containerSize[ 1 ],
				width = parentWidth - self._horizontalBoundary(),
				height = parentHeight - self._verticalBoundary(),
				innerSize = isHorizontal ? height : width,
				availableWidth = isHorizontal ? width - spliterSize :
												height - spliterSize,
				initializedWidth = [],
				widthSum = 0,
				childSplitview = null;

			initRatio = !!initRatio;
			fromFirstPane = !!fromFirstPane;

			$el.css( {
				"min-width" : width,
				"min-height" : height
			});

			if ( initRatio ) {
				initializedWidth = self._initRatio( fromFirstPane, $panes, isHorizontal, availableWidth );
			}

			currentAvailable = availableWidth;
			$panes.each( function ( i ) {
				var $pane = $( this ),
					paneWidth = initRatio ? initializedWidth[ i ] :
										Math.floor( availableWidth * self.options.ratio[i] ),
					prevPane = ( ( i ) ? $panes.eq( i - 1 ) : null ),
					posValue = 0,
					widthValue = 0,
					heightValue = 0,
					boundary = 0;

				currentAvailable -= paneWidth;
				if ( i === ( panesLength - 1 ) ) {
					if ( self.touchStatus ) {
						paneWidth = self.moveData.nextPaneWidth = availableWidth - ( self.moveData.targetPos + spliterWidth );
					} else {
						paneWidth = Math.max( Math.min( paneWidth, self.minPaneWidth ), paneWidth + currentAvailable );
					}
				}

				widthSum += paneWidth;

				if ( !prevPane ) {
					boundary = self._boundary( isHorizontal ? "Left" : "Top" );
					posValue = boundary.padding;
				} else {
					posValue = parseInt( prevPane.css( isHorizontal ? "left" : "top" ), 10 );
					posValue += isHorizontal ? prevPane.width() : prevPane.height();
					posValue += spliterWidth;
				}

				widthValue = isHorizontal ? paneWidth : innerSize;
				heightValue = isHorizontal ? innerSize : paneWidth;

				$pane.css( {
					"width" : widthValue ,
					"height" : heightValue
				} );

				$pane.css( ( isHorizontal ? "left" : "top" ), posValue );
			});

			$panes.each( function ( i ) {
				var $pane = $( this ),
					paneWidth = isHorizontal ? $pane.width() : $pane.height();

				self.options.ratio[ i ] = paneWidth / widthSum;
			});

			$.each( spliters, function ( i ) {
				var spliter = $( this ),
					prevPane = $panes.eq( i ),
					bar = spliter.children( ".ui-spliter-bar" ),
					handle = bar.children( ".ui-spliter-handle" ),
					posValue = 0;

				if ( isHorizontal ) {
					posValue = parseInt( prevPane.css( "left" ), 10 ) + prevPane.width() - spliterBarMargin;
					spliter.outerHeight( innerSize ).css( "left", posValue );
				} else {
					posValue = parseInt( prevPane.css( "top" ), 10 ) + prevPane.height() - spliterBarMargin;
					spliter.outerWidth( innerSize ).css( "top", posValue );
				}

				if ( bar.length ) {
					bar[ isHorizontal ? "outerHeight" : "outerWidth" ]( innerSize );
				}
				if ( handle.length ) {
					handle.css( isHorizontal ? "top" : "left", ( innerSize - spliterWidth ) / 2 );
				}
			});

			childSplitview = $el.find( ".ui-splitview:first" );
			if ( !childSplitview.length ) {
				return;
			}

			childSplitview = childSplitview.data( "splitview" );
			if ( childSplitview ) {
				childSplitview._refresh();
			}
		},

		_bindTouchEvents : function () {
			var self = this,
				$el = self.element,
				$panes = self.panes,
				spliters = self.spliters;

			$.each( spliters, function ( i ) {
				var spliter = $( this );
				self._bindSpliterTouchEvents.call( self, spliter );
			});
		},

		_bindSpliterTouchEvents : function ( spliter ) {
			var self = this,
				$el = self.element,
				opt = self.options,
				touchStartEvt = ( $.support.touch ? "touchstart" : "mousedown" ),
				touchMoveEvt = ( $.support.touch ? "touchmove" : "mousemove" ) + ".splitview",
				touchEndEvt = ( $.support.touch ? "touchend" : "mouseup" ) + ".splitview";

			spliter.bind( touchStartEvt, { e : spliter }, function ( event ) {
				if ( self.options.fixed ) {
					return;
				}

				var realEvent = $.support.touch ? event.originalEvent.changedTouches[0] : event,
					targetSpliter = event.data.e,
					prevPane = targetSpliter.prev(),
					nextPane = targetSpliter.next(),
					splitviewInPrev = prevPane.find( ".ui-splitview:first" ),
					splitviewInNext = nextPane.find( ".ui-splitview:first" ),
					isHorizontal = opt.dividerVertical,
					spliterWidth = isHorizontal ?
									$( self.spliterBars[0] ).outerWidth() :
									$( self.spliterBars[0] ).outerHeight();

				self.moveTarget = targetSpliter;
				self.moveData = {
					spliterWidth : spliterWidth || 0,
					prevPane : prevPane,
					nextPane : nextPane,
					splitviewInPrev : splitviewInPrev,
					splitviewInNext : splitviewInNext,
					prevPanePos : parseInt( prevPane.css( isHorizontal ? "left" : "top" ), 10 ) || 0,
					prevPaneWidth : parseInt( prevPane.css( isHorizontal ? "width" : "height" ), 10 ) || 0,
					nextPanePos : parseInt( nextPane.css( isHorizontal ? "left" : "top" ), 10 ) || 0,
					nextPaneWidth : parseInt( nextPane.css( isHorizontal ? "width" : "height" ), 10 ) || 0,
					targetPos : parseInt( targetSpliter.css( isHorizontal ? "left" : "top" ), 10 ) || 0,
					pagePos : isHorizontal ? realEvent.pageX : realEvent.pageY
				};

				targetSpliter.addClass( "ui-spliter-active" );

				$el.bind( touchMoveEvt, function ( event ) {
					if ( !self.touchStatus ) {
						return;
					}
					event.stopPropagation();
					self._drag( $.support.touch ? event.originalEvent.changedTouches[0] : event );
				}).bind( touchEndEvt, function ( event ) {
					event.stopPropagation();
					self._stop( $.support.touch ? event.originalEvent.changedTouches[0] : event );
					self.touchStatus = false;
					$el.unbind( ".splitview" );
					$( document ).unbind( ".splitview" );
				});

				$( document ).bind( touchMoveEvt + " " + touchEndEvt, function () {
					$el.trigger( touchEndEvt );
				});

				event.preventDefault();
				self.touchStatus = true;
			});
		},

		_drag : function ( e ) {
			if ( !this.moveData || typeof this.moveData === "undefined" ) {
				return;
			}

			var self = this,
				$el = self.element,
				opt = self.options,
				isHorizontal = opt.dividerVertical,
				moveData = self.moveData,
				moveTarget = self.moveTarget,
				prevPane = moveData.prevPane,
				nextPane = moveData.nextPane,
				splitviewInPrev = moveData.splitviewInPrev,
				splitviewInNext = moveData.splitviewInNext,
				spliterWidth = moveData.spliterWidth,
				movement = null,
				targetPos = null,
				nextPanePos = null,
				prevPaneWidth = null,
				nextPaneWidth = null,
				pagePos = isHorizontal ? e.pageX : e.pageY,
				splitview = null;

			movement = pagePos - moveData.pagePos;
			if ( movement > 0 ) {
				movement = Math.min( Math.max( moveData.nextPaneWidth - self.minPaneWidth, 0 ), movement );
			} else {
				movement = Math.max( Math.max( moveData.prevPaneWidth - self.minPaneWidth, 0 ) * -1, movement );
			}

			nextPanePos = moveData.nextPanePos + movement;
			prevPaneWidth = Math.max( moveData.prevPaneWidth + movement, 0 );
			nextPaneWidth = Math.max( moveData.nextPaneWidth - movement, 0 );
			targetPos = moveData.targetPos + movement;

			moveTarget.css( isHorizontal ? { left : targetPos } : { top : targetPos } );
			prevPane.css( isHorizontal ? { width : prevPaneWidth } : { height : prevPaneWidth } );
			nextPane.css( isHorizontal ? { width : nextPaneWidth, left : nextPanePos } :
											{ height : nextPaneWidth, top : nextPanePos } );

			if ( splitviewInPrev.length ) {
				splitview = splitviewInPrev.data( "splitview" );
				splitview._refresh( true, false );
			}

			if ( splitviewInNext.length ) {
				splitview = splitviewInNext.data( "splitview" );
				splitview._refresh( true, true );
			}
		},

		_stop : function ( e ) {
			if ( !this.moveData || !this.moveTarget ) {
				return;
			}

			var self = this,
				$el = self.element,
				opt = self.options,
				$panes = self.panes,
				panesLength = $panes.length,
				isHorizontal = opt.dividerVertical,
				moveData = self.moveData,
				moveTarget = self.moveTarget,
				prevPane = moveData.prevPane,
				nextPane = moveData.nextPane,
				splitviewInPrev = moveData.splitviewInPrev,
				splitviewInNext = moveData.splitviewInNext,
				spliterWidth = moveData.spliterWidth,
				spliterSize = spliterWidth * ( panesLength - 1 ),
				movement = null,
				targetPos = null,
				nextPanePos = null,
				prevPaneWidth = null,
				nextPaneWidth = null,
				displayStyle = $el.css( "display" ),
				parentWidth = self.containerSize[ 0 ],
				parentHeight = self.containerSize[ 1 ],
				width = parentWidth - self._horizontalBoundary(),
				height = parentHeight - self._verticalBoundary(),
				availableWidth = isHorizontal ?
									( width - spliterSize ) :
									( height - spliterSize ),
				sum = 0;

			moveTarget.removeClass( "ui-spliter-active" );

			// ratio calculation
			$panes.each( function ( i ) {
				var $pane = $( this ),
					paneWidth = isHorizontal ? $pane.width() : $pane.height();

				sum += paneWidth;
			});

			$panes.each( function ( i ) {
				var $pane = $( this ),
					paneWidth = isHorizontal ? $pane.width() : $pane.height();

				self.options.ratio[ i ] = paneWidth / sum;
			});

			self.moveData = null;
		},

		_fixed : function ( isFix ) {
			var self = this,
				spliters = self.spliters;

			$.each( spliters, function ( i ) {
				var $spliter = $( this );

				if ( isFix ) {
					$spliter.addClass( "ui-fixed" );
				} else {
					$spliter.removeClass( "ui-fixed" );
				}
			});

			self._layout();
		},

		_dividerVertical : function ( isDividerVertical ) {
			var self = this,
				$el = self.element,
				isHorizontal = isDividerVertical,
				$panes = null,
				$spliters = null,
				$bar = null,
				$handle = null;

			$panes = $el.children( ".ui-pane" );
			$spliters = $el.children( ".ui-spliter" );
			$bar = $spliters.children( ".ui-spliter-bar" );
			$handle = $bar.children( ".ui-spliter-handle" );

			$el.removeClass( "ui-direction-vertical" );
			$el.removeClass( "ui-direction-horizontal" );
			$el.addClass( "ui-splitview ui-direction-" + self._direction( isHorizontal ) );

			$panes.css( {
				"left" : "",
				"top" : "",
				"width" : "",
				"height" : ""
			});

			$spliters.css( {
				"left" : "",
				"top" : "",
				"width" : "",
				"height" : ""
			});

			$bar.css( {
				"width" : "",
				"height" : ""
			});

			$handle.css( {
				"left" : "",
				"top" : ""
			});

			if ( self._getContainerSize( $el[ 0 ].style.width, $el[ 0 ].style.height ) ) {
				self._layout();
			}
		},

		_ratio : function ( ratioParam ) {
			var self = this,
				$el = self.element,
				$panes = $el.children( ".ui-pane" ),
				panesLength = $panes.length;

			self._convertRatio( ratioParam, panesLength );
			self._layout();
		},

		_refresh : function ( initRatio, fromFirstPane ) {
			var self = this,
				$el = self.element;

			initRatio = !!initRatio;
			fromFirstPane = !!fromFirstPane;

			if ( self._getContainerSize( $el[ 0 ].style.width, $el[ 0 ].style.height ) ) {
				self._layout( initRatio, fromFirstPane );
			}
		},

		pane : function ( id, element ) {
			if ( typeof id !== "string" ) {
				return null;
			}

			var self = this,
				$el = self.element,
				$targetPane = $el.children( id ),
				$targetView = null,
				elementParent = null;

			if ( !$targetPane.hasClass( "ui-pane" ) ) {
				return null;
			}

			// getter
			if ( !element ) {
				return $targetPane.contents();
			}

			// setter
			if ( $targetPane.hasClass( "ui-scrollview-clip" ) ) {
				$targetPane.scrollview( "scrollTo", 0, 0, 0 );

				$targetView = $targetPane.children( ".ui-scrollview-view" );
				if ( !$targetView.length ) {
					return null;
				}
			} else {
				$targetView = $targetPane;
			}

			elementParent = element.parent();
			if ( elementParent.length && elementParent[ 0 ] === $targetView[ 0 ] ) {
				return;
			}

			$targetView.empty().append( element ).trigger( "create" );
			$targetView.fadeIn( 'fast' );
		},

		maximize : function ( id ) {
			if ( typeof id !== "string" ) {
				return;
			}

			var self = this,
				$el = self.element,
				$panes = self.panes,
				$targetPane = $el.children( id );

			if ( !$targetPane.hasClass( "ui-pane" ) ) {
				return;
			}

			self.savedRatio = self.options.ratio.slice();

			self.options.ratio = [];
			$panes.each( function ( i ) {
				self.options.ratio.push( ( this === $targetPane[ 0 ] ) ? 1 : 0 );
			});

			self._layout();
		},

		restore : function () {
			var self = this;

			if ( !self.savedRatio.length ) {
				return;
			}

			self.options.ratio = self.savedRatio.slice();
			self._adjustRatio( self.panes.length );

			self._layout();
		}
	});

	$( document ).bind( "pagecreate create", function ( e ) {
		$.tizen.splitview.prototype.enhanceWithin( e.target );
	});
} ( jQuery, window, document ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
