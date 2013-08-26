//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Tizen motion path component for gallery3d
//>>label: Motion path
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

( function ( $, window, undefined ) {
	var HALF_PI = Math.PI / 2,
		DEFAULT_STEP = 0.001,
		MotionPath = {},
		vec3 = window.vec3,
		arcLength3d = function ( p0, p1 ) {
			var d = [ p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2] ],
				value = Math.sqrt( d[0] * d[0] + d[1] * d[1] + d[2] * d[2] );
			return value;
		};

	MotionPath.base = function () {};
	MotionPath.base.prototype = {
		points: [],
		step: DEFAULT_STEP,
		length: 0,
		levels: [],
		init: function ( data ) {},
		calculateLevel: function ( maxLevel ) {},
		calculateTotalLength: function () {},
		getPosition: function ( percent ) {},
		getPercent: function ( start, interval ) {},
		getAngle: function ( percent ) {}
	};

	MotionPath.bezier2d = function () {};
	MotionPath.bezier2d.prototype = $.extend( true, {}, MotionPath.base.prototype, {
		init: function ( data ) {
			this.points = data.points;
			this.step = data.step || DEFAULT_STEP;
			this.length = this.calculateTotalLength();
			this.levels = this.calculateLevel( data.maxLevel ) || [];
		},

		calculateLevel: function ( maxLevel ) {
			var totalLength = this.length,
				interval = totalLength / maxLevel,
				levels = [],
				i;

			if ( !maxLevel ) {
				return null;
			}

			for ( i = 0; i < maxLevel; i += 1 ) {
				levels[maxLevel - i] = this.getPercent( 0, interval * i );
			}

			return levels;
		},

		calculateTotalLength: function () {
			var step = this.step,
				current = this.getPosition( 0 ),
				last = current,
				length = 0,
				percent;
			for ( percent = step; percent <= 1; percent += step ) {
				current = this.getPosition( percent );
				length += arcLength3d( last, current );
				last = current;
			}
			return length;
		},

		getPosition: function ( percent ) {
			var points = this.points,
				getValue = function ( p1, c1, c2, p2, t ) {
					return Math.pow(1 - t, 3) * p1 +
						3 * t * Math.pow( 1 - t, 2 ) * c1 +
						3 * Math.pow( t, 2 ) * ( 1 - t ) * c2 +
						Math.pow( t, 3 ) * p2;
				},
				result = [
					getValue( points[0][0], points[1][0], points[2][0], points[3][0], percent ),
					getValue( points[0][2], points[1][2], points[2][2], points[3][2], percent )
				];
			return [ result[0], 0, result[1] ];
		},

		getPercent: function ( start, interval ) {
			var step = this.step,
				current = this.getPosition( start = start || 0 ),
				last = current,
				targetLength = start + interval,
				length = 0,
				percent;

			for ( percent = start + step; percent <= 1; percent += step ) {
				current = this.getPosition( percent );
				length += arcLength3d( last, current );
				if ( length >= targetLength ) {
					return percent;
				}
				last = current;
			}
			return 1;
		},

		getAngle: function ( percent ) {
			var points = this.points,
				getTangent = function ( p1, c1, c2, p2, t ) {
					return 3 * t * t * ( -p1 + 3 * c1 - 3 * c2 + p2 ) + 6 * t * ( p1 - 2 * c1 + c2 ) + 3 * ( -p1 + c1 );
				},
				tx = getTangent( points[0][0], points[1][0], points[2][0], points[3][0], percent ),
				ty = getTangent( points[0][2], points[1][2], points[2][2], points[3][2], percent );
			return Math.atan2( tx, ty ) - HALF_PI;
		}

	} );

	// clamped cubic B-spline curve
	// http://web.mit.edu/hyperbook/Patrikalakis-Maekawa-Cho/node17.html
	// http://www.cs.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/B-spline/bspline-curve-coef.html
	MotionPath.bspline = function () {};
	MotionPath.bspline.prototype = $.extend( true, {}, MotionPath.base.prototype, {
		_degree: 3,
		_numberOfControls : 0,
		_knotVectors: [],
		_numberOfKnots: 0,

		init: function ( data ) {
			this.points = data.points;
			this.step = data.step || DEFAULT_STEP;
			this._numberOfPoints = this.points.length - 1;
			this._numberOfKnots = this._numberOfPoints + this._degree + 1;

			var deltaKnot = 1 / ( this._numberOfKnots - ( 2 * this._degree ) ),
				v = deltaKnot,
				i = 0;

			while ( i <= this._numberOfKnots ) {
				if ( i <= this._degree ) {
					this._knotVectors.push( 0 );
				} else if ( i < this._numberOfKnots - this._degree + 1 ) {
					this._knotVectors.push( v );
					v += deltaKnot;
				} else {
					this._knotVectors.push( 1 );
				}
				i += 1;
			}

			this.length = this.calculateTotalLength();
			this.levels = this.calculateLevel( data.maxLevel ) || [];
		},

		_Np: function ( percent, i, degree ) {
			var knots = this._knotVectors,
				A = 0,
				B = 0,
				denominator = 0,
				N0 = function ( percent, i ) {
					return ( ( knots[i] <= percent && percent < knots[i + 1] ) ? 1 : 0 );
				};

			if ( degree === 1 ) {
				A = N0( percent, i );
				B = N0( percent, i + 1 );
			} else {
				A = this._Np( percent, i, degree - 1 );
				B = this._Np( percent, i + 1, degree - 1 );
			}

			denominator = knots[i + degree] - knots[i];
			A *= ( denominator !== 0 ) ? ( ( percent - knots[i] ) / denominator ) : 0;
			denominator = knots[i + degree + 1] - knots[i + 1];
			B *= ( denominator !== 0 ) ? ( ( knots[i + degree + 1] - percent ) / denominator ) : 0;

			return A + B;
		},

		calculateLevel: function ( maxLevel ) {
			var totalLength = this.length,
				interval = totalLength / maxLevel,
				levels = [],
				i;

			if ( !maxLevel ) {
				return null;
			}

			for ( i = 0; i < maxLevel; i += 1 ) {
				levels[maxLevel - i] = this.getPercent( 0, interval * i );
			}
			return levels;
		},

		calculateTotalLength: function () {
			var step = this.step,
				current = this.getPosition( 0 ),
				last = current,
				length = 0,
				percent;
			for ( percent = step; percent <= 1; percent += step ) {
				current = this.getPosition( percent );
				length += arcLength3d( last, current );
				last = current;
			}
			return length;
		},

		getPosition: function ( percent ) {
			var result = [], i, j, sum;
			percent = percent.toFixed( 4 );
			for ( j = 0; j < 3; j += 1 ) {
				sum = 0;
				for ( i = 0; i <= this._numberOfPoints; i += 1 ) {
					sum += this.points[i][j] * this._Np( percent, i, this._degree );
				}
				result[j] = sum;
			}

			return result;
		},

		getPercent: function ( start, interval ) {
			var step = this.step,
				current = this.getPosition( start = start || 0 ),
				last = current,
				targetLength = start + interval,
				length = 0,
				percent;

			for ( percent = start + step; percent <= 1; percent += step ) {
				current = this.getPosition( percent );
				length += arcLength3d( last, current );
				if ( length >= targetLength ) {
					return percent;
				}
				last = current;
			}
			return 1;
		},

		getAngle: function ( percent ) {
			var prev = this.getPosition( percent ),
				next = this.getPosition( percent + 0.001 ),
				dir = vec3.normalize( vec3.direction( prev, next ) ),
				cosValue = vec3.dot( dir, [1, 0, 0] );

			return Math.acos( cosValue ) + Math.PI;
		}
	} );

	$.motionpath = function ( type, data ) {
		var object = new MotionPath[type]();
		object.init( data );
		return object;
	};
} ( jQuery, window ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
