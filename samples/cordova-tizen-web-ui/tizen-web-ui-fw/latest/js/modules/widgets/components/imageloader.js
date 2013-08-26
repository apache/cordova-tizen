//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Tizen image loader component for gallery3d
//>>label: Image loader
//>>group: Tizen:Widgets:Components

define( [ 
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
 * Authors: Hyunsook Park <hyunsook.park@samsung.com>
 *			Wonseop Kim <wonseop.kim@samsung.com>
*/

( function ( $, window, document, undefined ) {
	var _canvas = document.createElement( 'canvas' ),
		_context = _canvas.getContext( '2d' );

	function fileSystemErrorMessage( e ) {
		var FileError = window.FileError,
			msg = '';
		switch ( e.code ) {
		case FileError.QUOTA_EXCEEDED_ERR:
			msg = 'QUOTA_EXCEEDED_ERR';
			break;
		case FileError.NOT_FOUND_ERR:
			msg = 'NOT_FOUND_ERR';
			break;
		case FileError.SECURITY_ERR:
			msg = 'SECURITY_ERR';
			break;
		case FileError.INVALID_MODIFICATION_ERR:
			msg = 'INVALID_MODIFICATION_ERR';
			break;
		case FileError.INVALID_STATE_ERR:
			msg = 'INVALID_STATE_ERR';
			break;
		default:
			msg = 'Unknown Error';
			break;
		}
		return msg;
	}

	function getInternalURLFromURL( url ) {
		var internalURL = url.replace( /\//gi, "_" );
		return internalURL;
	}

	function resize( imagewidth, imageheight, thumbwidth, thumbheight, fit ) {
		var w = 0, h = 0, x = 0, y = 0,
			widthratio = imagewidth / thumbwidth,
			heightratio = imageheight / thumbheight,
			maxratio = Math.max( widthratio, heightratio );

		if ( fit ) {
			w = thumbwidth;
			h = thumbheight;
		} else {
			if ( maxratio > 1 ) {
				w = imagewidth / maxratio;
				h = imageheight / maxratio;
			} else {
				w = imagewidth;
				h = imageheight;
			}
			x = ( thumbwidth - w ) / 2;
			y = ( thumbheight - h ) / 2;
		}

		return { w: w, h: h, x: x, y: y };
	}

	function getThumbnail( img, thumbwidth, thumbheight, fit ) {
		var dimensions, url;
		_canvas.width = thumbwidth;
		_canvas.height = thumbheight;
		dimensions = resize( img.width, img.height, thumbwidth, thumbheight, fit );
		_context.fillStyle = "#000000";
		_context.fillRect ( 0, 0, thumbwidth, thumbheight );
		_context.drawImage( img, dimensions.x, dimensions.y, dimensions.w, dimensions.h );
		url = _canvas.toDataURL();
		return url;
	}

	$.imageloader = {
		_grantedBytes: 1024 * 1024,
		getThumbnail: function ( url, _callback ) {
			var internalURL, canvasDataURI;
			function errorHandler( e ) {
				var msg = fileSystemErrorMessage( e );
				if ( _callback ) {
					_callback( ( msg === "NOT_FOUND_ERR" ) ? msg : null );
				}
			}

			internalURL = getInternalURLFromURL( url );
			try {
				canvasDataURI = localStorage.getItem( internalURL );
				if ( _callback ) {
					_callback( ( canvasDataURI === null ) ? "NOT_FOUND_ERR" : canvasDataURI );
				}
			} catch ( e ) {
				if ( _callback ) {
					_callback( ( e.type === "non_object_property_load" ) ? "NOT_FOUND_ERR" : null );
				}
			}
		},

		setThumbnail: function ( url, _callback, thumbWidth, thumbHeight, fit ) {
			var image, internalURL, canvasDataURI;
			function errorHandler( e ) {
				var msg = fileSystemErrorMessage( e );
				if ( _callback ) {
					_callback( ( msg === "NOT_FOUND_ERR" ) ? msg : null );
				}
			}

			thumbWidth = thumbWidth || 128;
			thumbHeight = thumbHeight || 128;
			fit = fit || true;
			image = new Image();
			image.onload = function () {
				internalURL = getInternalURLFromURL( url );
				canvasDataURI = getThumbnail( this, thumbWidth, thumbHeight, fit );
				try {
					localStorage.setItem( internalURL, canvasDataURI );
					if ( _callback ) {
						_callback( canvasDataURI );
					}
				} catch ( e ) {
					if ( _callback ) {
						_callback( ( e.type === "non_object_property_load" ) ? "NOT_FOUND_ERR" : null );
					}
				}
			};
			image.src = url;
		},

		removeThumbnail: function ( url ) {
			var internalURL;
			function errorHandler( e ) {
				fileSystemErrorMessage( e );
			}

			internalURL = getInternalURLFromURL( url );
			try {
				localStorage.removeItem( internalURL );
			} catch ( e ) {
				throw e;
			}
		}
	};

} ( jQuery, window, document ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
