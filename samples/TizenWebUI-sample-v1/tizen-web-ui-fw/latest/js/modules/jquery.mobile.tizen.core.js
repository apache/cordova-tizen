//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Tizen core library
//>>label: Tizen core
//>>group: Tizen:Core

define( [ 
	'jquery',
	'jqm/jquery.mobile.core',
	'./jquery.mobile.tizen.configure',
	'./util/ensurens'
	], function ( jQuery ) {

//>>excludeEnd("jqmBuildExclude");

/*
 * jQuery Mobile Widget @VERSION
 *
 * TODO: remove unnecessary codes....
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
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
 * Authors: Kalyan Kondapally <kalyan.kondapally@intel.com>
 */

ensureNS("jQuery.mobile.tizen");

(function () {
jQuery.extend(jQuery.mobile.tizen, {
	disableSelection: function (element) {
		this.enableSelection(
			$(element).find('*').not( 'input, [type="text"], textarea' ),
			'none'
		);
		return true;
	},

	enableSelection: function (element, value) {
		var val;
		switch ( value ) {
			case 'text' :
			case 'auto' :
			case 'none' :
				val = value;
			break;
			default :
				val = 'auto';
			break;
		}
		return $(element).css( {
			'user-select': val,
			'-moz-user-select': val,
			'-webkit-user-select': val,
			'-o-user-select': val,
			'-ms-transform': val
		} );
    },

    disableContextMenu: function(element) {
	var self = this;
	$(element).find('*').each( function() {
		if( ( $(this).get(0).tagName !== 'INPUT' &&
			$(this).attr("type") !== 'text' ) &&
			$(this).get(0).tagName !== 'TEXTAREA' ) {
			self._disableContextMenu( this );
		}
	} );
    },

    _disableContextMenu: function(element) {

	$(element).each( function() {
		$(this).bind("contextmenu", function( event ) {
			return false;
		} );
	} );
    },

    enableContextMenu: function(element) {
	$(element).each( function() {
		$(this).unbind( "contextmenu" );
	} );
    },

    // Get document-relative mouse coordinates from a given event
    // From: http://www.quirksmode.org/js/events_properties.html#position
    documentRelativeCoordsFromEvent: function(ev) {
        var e = ev ? ev : window.event,
            client = { x: e.clientX, y: e.clientY },
            page   = { x: e.pageX,   y: e.pageY   },
            posx = 0,
            posy = 0;

        // Grab useful coordinates from touch events
        if (e.type.match(/^touch/)) {
            page = {
                x: e.originalEvent.targetTouches[0].pageX,
                y: e.originalEvent.targetTouches[0].pageY
            };
            client = {
                x: e.originalEvent.targetTouches[0].clientX,
                y: e.originalEvent.targetTouches[0].clientY
            };
        }

        if (page.x || page.y) {
            posx = page.x;
            posy = page.y;
        }
        else
        if (client.x || client.y) {
            posx = client.x + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = client.y + document.body.scrollTop  + document.documentElement.scrollTop;
        }

        return { x: posx, y: posy };
    },

	// TODO : offsetX, offsetY. touch events don't have offsetX and offsetY. support for touch devices.
    // check algorithm...
    targetRelativeCoordsFromEvent: function(e) {
        var coords = { x: e.offsetX, y: e.offsetY };

        if (coords.x === undefined || isNaN(coords.x) ||
            coords.y === undefined || isNaN(coords.y)) {
            var offset = $(e.target).offset();
            //coords = documentRelativeCoordsFromEvent(e);	// Old code. Must be checked again.
            coords = $.mobile.tizen.documentRelativeCoordsFromEvent(e);
            coords.x -= offset.left;
            coords.y -= offset.top;
        }

        return coords;
    }
});

})();

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
