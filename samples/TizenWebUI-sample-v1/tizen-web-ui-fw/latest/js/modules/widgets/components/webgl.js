//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Tizen WebGL component for gallery3d
//>>label: WebGL
//>>group: Tizen:Widgets:Lib

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

( function ( $, undefined ) {
	$.webgl = {};

	$.webgl.shader = {
		_vertexShader: null,
		_fragmentShader: null,

		deleteShaders: function ( gl ) {
			gl.deleteShader( this._vertexShader );
			gl.deleteShader( this._fragmentShader );
		},

		addShaderProgram : function ( gl, vs, fs, isFile ) {
			var shaderProgram,
				vertexShaderSource = {},
				fragmentShaderSource = {};

			if ( isFile ) {
				vertexShaderSource = this.loadShaderFile( vs );
				fragmentShaderSource = this.loadShaderFile( fs );
			} else {
				vertexShaderSource.source = vs;
				fragmentShaderSource.source = fs;
			}

			this._vertexShader = this.getShader( gl, gl.VERTEX_SHADER, vertexShaderSource );
			this._fragmentShader = this.getShader( gl, gl.FRAGMENT_SHADER, fragmentShaderSource );

			shaderProgram = gl.createProgram();
			gl.attachShader( shaderProgram, this._vertexShader);
			gl.attachShader( shaderProgram, this._fragmentShader);
			gl.linkProgram( shaderProgram );

			if ( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) ) {
				window.alert( "Could not initialize Shaders!" );
			}
			return shaderProgram;
		},

		loadShaderFile : function ( path ) {
			var cache = null;
			$.ajax({
				async : false,
				url : path,
				success : function ( result ) {
					cache = {
						source: result
					};
				}
			});
			return cache;
		},

		getShader: function ( gl, type, script ) {
			var shader;

			if ( !gl || !type || !script ) {
				return null;
			}

			shader = gl.createShader( type );

			gl.shaderSource( shader, script.source );
			gl.compileShader( shader );

			if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
				window.alert( gl.getShaderInfoLog( shader ) );
				gl.deleteShader( shader );
				return null;
			}
			return shader;
		}
	};

	$.webgl.buffer = {
		attribBufferData: function ( gl, attribArray ) {
			var attribBuffer = gl.createBuffer();

			gl.bindBuffer( gl.ARRAY_BUFFER, attribBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, attribArray, gl.STATIC_DRAW );
			gl.bindBuffer( gl.ARRAY_BUFFER, null );

			return attribBuffer;
		}
	};

} ( jQuery ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
