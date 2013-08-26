//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows popup at any place in the page content, with various styles
//>>label: Context popup
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	'../jquery.mobile.tizen.core',
	'./jquery.mobile.tizen.popupwindow',
	'./jquery.mobile.tizen.triangle'
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
 * Authors: Gabriel Schulhof <gabriel.schulhof@intel.com>
 *			Hyunjung Kim <hjnim.kim@samsung.com>
 */

/*
 * % ContextPopup widget do not use anymore(will be deprecated, internal use only)
 */
// This widget is implemented in an extremely ugly way. It should derive from $.tizen.popupwindow, but it doesn't
// because there's a bug in jquery.ui.widget.js which was fixed in jquery-ui commit
// b9153258b0f0edbff49496ed16d2aa93bec07d95. Once a version of jquery-ui containing that commit is released
// (probably >= 1.9m5), and jQuery Mobile picks up the widget from there, this widget needs to be rewritten properly.
// The problem is that, when a widget inherits from a superclass and declares an object in its prototype identical in key
// to one in the superclass, upon calling $.widget the object is overwritten in both the prototype of the superclass and
// the prototype of the subclass. The prototype of the superclass should remain unchanged.

/**
	class ContextPopup
		The context pop-up widget shows a list of options and automatically optimizes its size within the screen. This widget is intended for a small list of options for a larger list, use the List widget. <br/>The context pop-up widget requires a target button, which must be clicked to open the context pop-up. In the default application theme, an arrow pointer is displayed at the top-left corner of the context pop-up widget when it is opened.<br/><br/> To add a context pop-up widget to the application, use the following code:

			// Target button
			<a href="#pop_3_icons" id="btn_3_icons" data-role="button" data-inline="true" data-rel="popupwindow">3 Icons</a>
			// Context pop-up
				<div class="horizontal" id="pop_3_icons" data-role="popupwindow" data-show-arrow="true">
				<ul>
					<li class="icon">
						<a href="#" data-role="button" data-icon="call"></a>
					</li>
					<li class="icon">
						<a href="#" data-role="button" data-icon="favorite"></a>
					</li>
					<li class="text">
						<a href="#">Function</a>
					</li>
				</ul>
			</div>
	The context pop-up can define callbacks for events as described in the [jQueryMobile documentation for pop-up events.][1]
	You can use methods with the context pop-up as described in the [jQueryMobile documentation for pop-up methods.][2]
	[1]: http://jquerymobile.com/demos/1.2.0-alpha.1/docs/pages/popup/events.html
	[2]: http://jquerymobile.com/demos/1.2.0-alpha.1/docs/pages/popup/methods.html

	@deprecated 2.0 verisons
*/

(function ( $, undefined ) {
	$.widget( "tizen.ctxpopup", $.tizen.widgetex, {
		options: $.extend( {}, $.tizen.popupwindow.prototype.options, {
			initSelector: ":jqmData(show-arrow)"
		} ),

		_htmlProto: {
source:

 [ "<div><div id='outer' class='ui-ctxpopup'>" ,
  "    <div id='top' class='ui-ctxpopup-row' data-role='triangle' data-location='top'></div>" ,
  "    <div class='ui-ctxpopup-row'>" ,
  "        <div id='left' class='ui-ctxpopup-cell' data-role='triangle' data-location='left'></div>" ,
  "        <div id='container' class='ui-ctxpopup-cell'></div>" ,
  "        <div id='right' class='ui-ctxpopup-cell' data-role='triangle' data-location='right'></div>" ,
  "    </div>" ,
  "    <div id='bottom' class='ui-ctxpopup-row' data-role='triangle' data-location='bottom'></div>" ,
  "</div>" ,
  "</div>" ].join("")
,			ui: {
				outer		: "#outer",
				container	: "#container", // the key has to have the name "container"
				arrow		: {
					all		: ":jqmData(role='triangle')",
					l		: "#left",
					t		: "#top",
					r		: "#right",
					b		: "#bottom"
				}
			}
		},

		_create: function () {
			console.warn("ctxpopup() was deprecated. use popup() instead.");
			if ( !this.element.data( "popupwindow" ) ) {
				this.element.popupwindow();
			}

			this.element.data( "popupwindow" )
				._ui.container
				.removeClass( "ui-popupwindow-padding" )
				.append( this._ui.outer );
			this._ui.outer.trigger( "create" ); // Creates the triangle widgets
			this._ui.container
				.addClass( "ui-popupwindow-padding" )
				.append( this.element );
		},

		_setOption: function ( key, value ) {
			$.tizen.popupwindow.prototype._setOption.apply( this.element.data( "popupwindow" ), arguments );
			this.options[key] = value;
		}
	} );

	var origOpen = $.tizen.popupwindow.prototype.open,
		orig_setOption = $.tizen.popupwindow.prototype._setOption,
		orig_placementCoords = $.tizen.popupwindow.prototype._placementCoords;

	$.tizen.popupwindow.prototype._setOption = function ( key, value ) {
		var ctxpopup = this.element.data( "ctxpopup" ),
			needsApplying = true,
			origContainer;
		if ( ctxpopup ) {
			if ( "shadow" === key || "overlayTheme" === key || "corners" === key ) {
				origContainer = this._ui.container;

				this._ui.container = ctxpopup._ui.container;
				orig_setOption.apply( this, arguments );
				this._ui.container = origContainer;
				needsApplying = false;
			}
			ctxpopup.options[key] = value;
		}

		if ( needsApplying ) {
			orig_setOption.apply(this, arguments);
		}
	};

	$.tizen.popupwindow.prototype._placementCoords = function ( x, y, cx, cy ) {
		var ctxpopup = this.element.data( "ctxpopup" ),
			self = this,
			coords = {},
			minDiff,
			minDiffIdx;

		function getCoords( arrow, x_factor, y_factor ) {
			// Unhide the arrow we want to test to take it into account
			ctxpopup._ui.arrow.all.hide();
			ctxpopup._ui.arrow[arrow].show();

			var isHorizontal = ( "b" === arrow || "t" === arrow ),
			// Names of keys used in calculations depend on whether things are horizontal or not
				coord = ( isHorizontal
						? { point: "x", size: "cx", beg: "left", outerSize: "outerWidth",  niceSize: "width", triangleSize : "height" }
						: { point: "y", size: "cy", beg: "top",  outerSize: "outerHeight", niceSize: "height", triangleSize : "width" } ),
				size = {
					cx : self._ui.container.width(),
					cy : self._ui.container.height()
				},
				halfSize = {
					cx : size.cx / 2,
					cy : size.cy / 2
				},
				desired = {
					"x" : x + halfSize.cx * x_factor,
					"y" : y + halfSize.cy * y_factor
				},
				orig = orig_placementCoords.call( self, desired.x, desired.y, size.cx, size.cy ),

			// The triangleOffset must be clamped to the range described below:
			//
			//                          +-------...
			//                          |   /\
			//                          |  /  \
			//                   ----+--+-,-----...
			//lowerDiff       -->____|  |/ <-- possible rounded corner
			//triangle size   -->    | /|
			//                   ____|/ |
			//                    ^  |\ | <-- lowest possible offset for triangle
			// actual range of    |  | \| 
			// arrow offset       |  |  | 
			// values due to      |  .  . Payload table cell looks like
			// possible rounded   |  .  . a popup window, and it may have
			// corners and arrow  |  .  . arbitrary things like borders,
			// triangle size -    |  |  | shadows, and rounded corners.
			// our clamp range    |  | /|
			//                   _v__|/ |
			//triangle size   -->    |\ | <-- highest possible offset for triangle
			//                   ____| \|
			//upperDiff       -->    |  |\ <-- possible rounded corner
			//                   ----+--+-'-----...
			//                          |  \  /
			//                          |   \/
			//                          +-------...
			//
			// We calculate lowerDiff and upperDiff by considering the offset and width of the payload (this.element)
			// versus the offset and width of the element enclosing the triangle, because the payload is inside
			// whatever decorations (such as borders, shadow, rounded corners) and thus can give a reliable indication
			// of the thickness of the combined decorations

				arrowBeg = ctxpopup._ui.arrow[arrow].offset()[coord.beg],
				arrowSize = ctxpopup._ui.arrow[arrow][coord.outerSize]( true ),
				payloadBeg = self.element.offset()[coord.beg],
				payloadSize = self.element[coord.outerSize]( true ),
				triangleSize = ctxpopup._ui.arrow[arrow][coord.triangleSize](),
				triangleOffset,
				finalposition,
				ret;
			if (isHorizontal) {
				orig.x = 0;
			} else {
				orig.y = 0;
			}
			if (arrow == 'b' && self._target_height) {
				orig.y -= self._target_height;
			}
			if (arrow == 'r' && self._target_width) {
				orig.x -= self._target_width;
			}
			triangleOffset =
				Math.max(
					triangleSize // triangle size
						+ Math.max( 0, payloadBeg - arrowBeg ), // lowerDiff
					Math.min(
							arrowSize // bottom
								- triangleSize // triangle size
								- Math.max( 0, arrowBeg + arrowSize - ( payloadBeg + payloadSize ) ), // upperDiff
							arrowSize / 2 // arrow unrestricted offset
								+ desired[coord.point]
								- orig[coord.point]
								- halfSize[coord.size]
						)
				);
					// Triangle points here
			finalposition = {
				"x": orig.x + ( isHorizontal ? triangleOffset : 0) + ("r" === arrow ? size.cx : 0),
				"y": orig.y + (!isHorizontal ? triangleOffset : 0) + ("b" === arrow ? size.cy : 0)
			};
			ret = {
				actual			: orig,
				triangleOffset	: triangleOffset,
				absDiff			: Math.abs( x - finalposition.x ) + Math.abs( y - finalposition.y )
			};

			// Hide it back
			ctxpopup._ui.arrow[arrow].hide();

			return ret;
		}

		if ( ctxpopup ) {
			// Returns:
			// {
			//    absDiff: int
			//    triangleOffset: int
			//    actual: { x: int, y: int }
			// }

			coords = {
				l : getCoords( "l", 1, 0 ),
				r : getCoords( "r", -1, 0 ),
				t : getCoords( "t", 0, 1 ),
				b : getCoords( "b", 0, -1 )
			};

			$.each( coords, function ( key, value ) {
				if ( minDiff === undefined || value.absDiff < minDiff ) {
					minDiff = value.absDiff;
					minDiffIdx = key;
				}
			} );

			// Side-effect: show the appropriate arrow and move it to the right offset
			ctxpopup._ui.arrow[minDiffIdx]
				.show()
				.triangle( "option", "offset", coords[minDiffIdx].triangleOffset );
			this.element.parents( ".ui-popupwindow" ).addClass( "ui-arrow-" + minDiffIdx );
			return coords[minDiffIdx].actual;
		}

		return orig_placementCoords.call( this, x, y, cx, cy );
	};

	$.tizen.popupwindow.prototype.open = function ( x, y, target_width, target_height ) {
		var ctxpopup = this.element.data( "ctxpopup" );

		this._target_width = target_width;
		this._target_height = target_height;

		if ( ctxpopup ) {
			this._setFade( false );
			this._setShadow( false );
			this._setCorners( false );
			this._setOverlayTheme( null );
			this._setOption( "overlayTheme", ctxpopup.options.overlayTheme );
			ctxpopup._ui.arrow.all.triangle( "option", "color", ctxpopup._ui.container.css( "background-color" ) );

			// temporary
			$( '.ui-popupwindow' ).css( 'background', 'none' );
		}

		origOpen.call( this, x, y, true );
	};

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		var ctxpopups = $( $.tizen.ctxpopup.prototype.options.initSelector, e.target );
		$.tizen.ctxpopup.prototype.enhanceWithin( e.target );
	} );
}( jQuery ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
