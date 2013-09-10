//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Make namespace for modules
//>>label: Ensurens
//>>group: Tizen:Utilities

define( [ 
	], function ( ) {

//>>excludeEnd("jqmBuildExclude");

/*
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
 */

// Ensure that the given namespace is defined. If not, define it to be an empty object.
// This is kinda like the mkdir -p command.
(function (window) {
		window.ensureNS = (function () {
		var internalCache = {};
		return function ensureNS (ns) { // name just for debugging purposes
			var nsArr = ns.split(".").reverse(),
				nsSoFar = "",
				buffer = "",
				leaf = "",
				l = nsArr.length;
			while(--l >= 0) {
				leaf = nsArr[l];
				nsSoFar = nsSoFar + (nsSoFar.length > 0 ? "." : "") + leaf;
				if (!internalCache[nsSoFar]) {
					internalCache[nsSoFar] = true;
					buffer += "!window." + nsSoFar + ' && (window.' + nsSoFar + " = {});\n";
				}
			}
			buffer.length && (new Function(buffer))();
		};
	})();
})(this);

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
