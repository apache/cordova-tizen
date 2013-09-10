//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Loader doing theme loading, viewport setting, globalize loading, etc.
//>>label: Loader
//>>group: Tizen:Core

define( [ 
	'jquery',
	'libs/globalize',
	"jqm/jquery.mobile.init",

	// used by theme.js
	"jqm/widgets/loader",
	"jqm/widgets/listview",
	"jqm/widgets/collapsible",
	"jqm/widgets/forms/button",

	"jqm/widgets/page.sections",

	'./jquery.mobile.tizen.configure',
	'./jquery.mobile.tizen.core',
	'widgets/jquery.mobile.tizen.pagelayout'
	], function ( jQuery, Globalize ) {

//>>excludeEnd("jqmBuildExclude");

/**
 * @class core
 * loader.js
 *
 * Youmin Ha <youmin.ha@samsung.com>
 *
 *
 */
/*
	Web UI scaling concept in Tizen Web UI

Generally, web applications must be designed to be showed acceptable on various size and resolution of screens, and web winsets have to be scaled well.  Tizen Web UI Framework supports various viewport settings, and Tizen Web UI widgets are designed to be scalable on various screen sizes.  In order to make web applications scalable on many devices which have different screen size, it is necessary to understand how mobile web browsers deal with screen resolution, and how Tizen Web UI Framework supports scaling for web applications.


* Viewport on mobile web browser

Viewport is an area showing web content on the browser.  Unlike desktop browsers, mobile browsers support logical viewport seting, which means that application can set viewport width/height and zoom level by itself.
The very important thing that to be remembered is that the viewport resolution in pixel is 'Logical', not physical.  For example, if the viewport width is set to 480 on a mobile device having 720px screen width, the viewport width is considered to 480px logically. All elements put on right side from 480px horizontal position will not be shown on the viewport.
Most mobile browsers set viewport with given content attribute with <meta name="viewport" content="..."> tag in <head> section in the application source html, whereas desktop browsers ignore the tag.
Detailed usage of viewport meta tag is found in here: http://www.w3.org/TR/mwabp/#bp-viewport


* Viewport setting by application developers

When developers write <meta name="viewport" content="..."> in the <head> section of the web application HTML file, Tizen Web UI Framework does not add another viewport meta tag, nor modify developer-defined viewport.


* Automatic viewport setting by Tizen Web UI Framework

If developers do not give a viewport meta tag, Tizen Web UI Framework automatically add a viewport meta tag with default viewport setting.


* Portrait/landscape mode


* Tizen Web UI widgets scaling


 */
( function ($, Globalize, window, undefined) {

	var tizen = {
		libFileName : "tizen-web-ui-fw(.custom|.full)?(.min)?.js",

		frameworkData : {
			rootDir: '/usr/share/tizen-web-ui-fw',
			version: '0.2',
			theme: "tizen-black",
			viewportWidth: "device-width",
			viewportScale: false,

			defaultFontSize: 22,
			minified: false,
			deviceCapa: { inputKeyBack: true, inputKeyMenu: true },
			debug: false
		},

		log : {
			debug : function ( msg ) {
				if ( tizen.frameworkData.debug ) {
					console.log( msg );
				}
			},
			warn : function ( msg ) {
				console.warn( msg );
			},
			error : function ( msg ) {
				console.error( msg );
			},
			alert : function ( msg ) {
				window.alert( msg );
			}
		},

		util : {

			loadScriptSync : function ( scriptPath, successCB, errorCB ) {
				$.ajax( {
					url: scriptPath,
					dataType: 'script',
					async: false,
					crossDomain: false,
					success: successCB,
					error: function ( jqXHR, textStatus, errorThrown ) {
						if ( errorCB ) {
							errorCB( jqXHR, textStatus, errorThrown );
						} else {
							var ignoreStatusList = [ 404 ],  // 404: not found
								errmsg = ( 'Error while loading ' + scriptPath + '\n' + jqXHR.status + ':' + jqXHR.statusText );
							if ( -1 == $.inArray( jqXHR.status, ignoreStatusList ) ) {
								tizen.log.alert( errmsg );
							} else {
								tizen.log.warn( errmsg );
							}
						}
					}
				} );
			},
			isMobileBrowser: function ( ) {
				var mobileIdx = window.navigator.appVersion.indexOf("Mobile"),
					isMobile = -1 < mobileIdx;
				return isMobile;
			}
		},

		css : {
			cacheBust: ( document.location.href.match( /debug=true/ ) ) ?
					'?cacheBust=' + ( new Date( ) ).getTime( ) :
					'',
			addElementToHead : function ( elem ) {
				var head = document.getElementsByTagName( 'head' )[0];
				if ( head ) {
					$( head ).prepend( elem );
				}
			},
			makeLink : function ( href ) {
				var cssLink = document.createElement( 'link' );
				cssLink.setAttribute( 'rel', 'stylesheet' );
				cssLink.setAttribute( 'href', href );
				cssLink.setAttribute( 'name', 'tizen-theme' );
				return cssLink;
			},
			load: function ( path ) {
				var head = document.getElementsByTagName( 'head' )[0],
					cssLinks = head.getElementsByTagName( 'link' ),
					idx,
					l = null;
				// Find css link element
				for ( idx = 0; idx < cssLinks.length; idx++ ) {
					if ( cssLinks[idx].getAttribute( 'rel' ) != "stylesheet" ) {
						continue;
					}
					if ( cssLinks[idx].getAttribute( 'name' ) == "tizen-theme"
							|| cssLinks[idx].getAttribute( 'href' ) == path ) {
						l = cssLinks[idx];
						break;
					}
				}
				if ( l ) {	// Found the link element!
					if ( l.getAttribute( 'href' ) == path ) {
						tizen.log.debug( "Theme is already loaded. Skip theme loading in the framework." );
					} else {
						l.setAttribute( 'href', path );
					}
				} else {
					this.addElementToHead( this.makeLink( path ) );
				}
			}
		},

		getParams: function ( ) {
			/* Get data-* params from <script> tag, and set tizen.frameworkData.* values
			 * Returns true if proper <script> tag is found, or false if not.
			 */
			// Find current <script> tag element
			var scriptElems = document.getElementsByTagName( 'script' ),
				val = null,
				foundScriptTag = false,
				idx,
				elem,
				src,
				tokens,
				version_idx;
/*
			function getTizenTheme( ) {
				var t = navigator.theme ? navigator.theme.split( ':' )[0] : null;
				if ( t ) {
					t = t.replace('-hd', '');
					if ( ! t.match( /^tizen-/ ) ) {
						t = 'tizen-' + t;
					}
				}
				return t;
			}
*/
			for ( idx in scriptElems ) {
				elem = scriptElems[idx];
				src = elem.src ? elem.getAttribute( 'src' ) : undefined;
				if (src && src.match( this.libFileName )) {
					// Set framework data, only when they are given.
					tokens = src.split(/[\/\\]/);
					version_idx = -3;
					this.frameworkData.rootDir = ( elem.getAttribute( 'data-framework-root' )
						|| tokens.slice( 0, tokens.length + version_idx ).join( '/' )
						|| this.frameworkData.rootDir ).replace( /^file:(\/\/)?/, '' );
					this.frameworkData.version = elem.getAttribute( 'data-framework-version' )
						|| tokens[ tokens.length + version_idx ]
						|| this.frameworkData.version;
					this.frameworkData.theme = elem.getAttribute( 'data-framework-theme' )
						//|| getTizenTheme( )
						|| this.frameworkData.theme;
					this.frameworkData.viewportWidth = elem.getAttribute( 'data-framework-viewport-width' )
						|| this.frameworkData.viewportWidth;
					this.frameworkData.viewportScale =
						"true" === elem.getAttribute( 'data-framework-viewport-scale' ) ? true
						: this.frameworkData.viewportScale;
					this.frameworkData.minified = src.search(/\.min\.js$/) > -1 ? true : false;
					this.frameworkData.debug = "true" === elem.getAttribute( 'data-framework-debug' ) ? true
						: this.frameworkData.debug;
					foundScriptTag = true;
					break;
				}
			}
			return foundScriptTag;
		},

		loadTheme: function ( theme ) {
			var themePath,
			cssPath,
			jsPath;

			if ( ! theme ) {
				theme = tizen.frameworkData.theme;
			}
			
			themePath = tizen.frameworkData.rootDir + '/' + tizen.frameworkData.version + '/themes/' + theme;
			
			jsPath = themePath + '/theme.js';
	
			if ( tizen.frameworkData.minified ) {
				cssPath = themePath + '/tizen-web-ui-fw-theme.min.css';
			} else {
				cssPath = themePath + '/tizen-web-ui-fw-theme.css';
			}
			tizen.css.load( cssPath );
			tizen.util.loadScriptSync( jsPath );
		},

		/** Load Globalize culture file, and set default culture.
		 *  @param[in]  language  (optional) Language code. ex) en-US, en, ko-KR, ko
		 *                        If language is not given, read language from html 'lang' attribute, 
		 *                        or from system setting.
		 *  @param[in]  cultureDic (optional) Dictionary having language code->
		 */
		loadGlobalizeCulture: function ( language, cultureDic ) {
			var self = this,
				cFPath,
				lang,
				mockJSXHR;

			function getLang ( language ) {
				var lang = language
						|| $( 'html' ).attr( 'lang' )
						|| window.navigator.language.split( '.' )[0]	// Webkit, Safari + workaround for Tizen
						|| window.navigator.userLanguage	// IE
						|| 'en',
					countryCode = null,
					countryCodeIdx = lang.lastIndexOf('-'),
					ignoreCodes = ['Cyrl', 'Latn', 'Mong'];	// Not country code!
				if ( countryCodeIdx != -1 ) {	// Found country code!
					countryCode = lang.substr( countryCodeIdx + 1 );
					if ( ignoreCodes.join( '-' ).indexOf( countryCode ) < 0 ) {
						// countryCode is not found from ignoreCodes.
						// Make countryCode to uppercase.
						lang = [ lang.substr( 0, countryCodeIdx ), countryCode.toUpperCase( ) ].join( '-' );
					}
				}
				// NOTE: 'en' to 'en-US', because globalize has no 'en' culture file.
				lang = lang == 'en' ? 'en-US' : lang;
				return lang;
			}

			function getNeutralLang ( lang ) {
				var neutralLangIdx = lang.lastIndexOf( '-' ),
					neutralLang;
				if ( neutralLangIdx != -1 ) {
					neutralLang = lang.substr( 0, neutralLangIdx );
				}
				return neutralLang;
			}

			function getCultureFilePath ( lang, cFDic ) {
				var cFPath = null;	// error value

				if ( "string" != typeof lang ) {
					return null;
				}
				if ( cFDic && cFDic[lang] ) {
					cFPath = cFDic[lang];
				} else {
					// Default Globalize culture file path
					cFPath = [
						self.frameworkData.rootDir,
						self.frameworkData.version,
						'js',
						'cultures',
						['globalize.culture.', lang, '.js'].join( '' )
					].join( '/' );
				}
				return cFPath;
			}

			function printLoadError( cFPath, jqXHR ) {
				tizen.log.error( "Error " + jqXHR.status + ": " + jqXHR.statusText
						+ "::Culture file (" + cFPath + ") is failed to load.");
			}

			function loadCultureFile ( cFPath, errCB ) {
				function _successCB ( ) {
					tizen.log.debug( "Culture file (" + cFPath + ") is loaded successfully." );
				}
				function _errCB ( jqXHR, textStatus, err ) {
					if ( errCB ) {
						errCB( jqXHR, textStatus, err );
					} else {
						printLoadError( cFPath, jqXHR );
					}
				}

				if ( ! cFPath ) {	// Invalid cFPath -> Regard it as '404 Not Found' error.
					mockJSXHR = {
						status: 404,
						statusText: "Not Found"
					};
					_errCB( mockJSXHR, null, null );
				} else {
					$.ajax( {
						url: cFPath,
						dataType: 'script',
						cache: true,
						async: false,
						success: _successCB,
						error: _errCB
					} );
				}
			}

			lang = getLang( language );
			cFPath = getCultureFilePath( lang, cultureDic );
			loadCultureFile( cFPath,
				function ( jqXHR, textStatus, err ) {
					if ( jqXHR.status == 404 ) {
						// If culture file is not found, try once more with neutral lang.
						var nLang = getNeutralLang( lang ),
							ncFPath = getCultureFilePath( nLang, cultureDic );
						loadCultureFile( ncFPath, null );
					} else {
						printLoadError( cFPath, jqXHR );
					}
				} );

			return lang;
		},
		setGlobalize: function ( ) {
			var lang = this.loadGlobalizeCulture( );

			// Set culture
			// NOTE: It is not needed to set with neutral lang.
			//       Globalize automatically deals with it.
			Globalize.culture( lang );
		},
		/**
		 * Load custom globalize culture file
		 * Find current system language, and load appropriate culture file from given colture file list.
		 *
		 * @param[in]	cultureDic	collection of 'language':'culture file path' key-val pair.
		 * @example
		 * var myCultures = {
		 *	"en"    : "culture/en.js",
		 *	"fr"    : "culture/fr.js",
		 *	"ko-KR" : "culture/ko-KR.js"
		 * };
		 * loadCultomGlobalizeCulture( myCultures );
		 *
		 * ex) culture/fr.js
		 * -------------------------------
		 * Globalize.addCultureInfo( "fr", {
		 *   messages: {
		 *     "hello" : "bonjour",
		 *     "translate" : "traduire"
		 *   }
		 * } );
		 * -------------------------------
		 */
		loadCustomGlobalizeCulture: function ( cultureDic ) {
			tizen.loadGlobalizeCulture( null, cultureDic );
		},

		/** Set viewport meta tag for mobile devices.
		 *
		 * @param[in]	viewportWidth	viewport width. "device-width" is OK.
		 */
		setViewport: function ( viewportWidth ) {
			var meta = null,
				head,
				content;

			// Do nothing if viewport setting code is already in the code.
			$( "meta[name=viewport]" ).each( function ( ) {
				meta = this;
				return;
			});
			if ( meta ) {	// Found custom viewport!
				content = $( meta ).prop( "content" );
				viewportWidth = content.replace( /.*width=(device-width|\d+)\s*,?.*$/gi, "$1" );
				tizen.log.debug( "Viewport is set to '" + viewportWidth + "' in a meta tag. Framework skips viewport setting." );
			} else {
				// Create a meta tag
				meta = document.createElement( "meta" );
				if ( meta ) {
					meta.name = "viewport";
					content = "width=" + viewportWidth + ", user-scalable=no";
					if ( ! isNaN( viewportWidth ) ) {
						// Fix scale to 1.0, if viewport width is set to fixed value.
						// NOTE: Works wrong in Tizen browser!
						//content = [ content, ", initial-scale=1.0, maximum-scale=1.0" ].join( "" );
					}
					meta.content = content;
					tizen.log.debug( content );
					head = document.getElementsByTagName( 'head' ).item( 0 );
					head.insertBefore( meta, head.firstChild );
				}
			}
			return viewportWidth;
		},

		/**	Read body's font-size, scale it, and reset it.
		 *  param[in]	desired font-size / base font-size.
		 */
		scaleBaseFontSize: function ( themeDefaultFontSize, ratio ) {
			tizen.log.debug( "themedefaultfont size: " + themeDefaultFontSize + ", ratio: " + ratio );
			var scaledFontSize = Math.max( Math.floor( themeDefaultFontSize * ratio ), 4 );

			$( 'html' ).css( { 'font-size': scaledFontSize + "px" } );
			tizen.log.debug( 'html:font size is set to ' + scaledFontSize );
			$( document ).ready( function ( ) {
				$( '.ui-mobile' ).children( 'body' ).css( { 'font-size': scaledFontSize + "px" } );
			} );
		},

		setScaling: function ( ) {
			var viewportWidth = this.frameworkData.viewportWidth,
				themeDefaultFontSize = this.frameworkData.defaultFontSize, // comes from theme.js
				ratio = 1;

			// Keep original font size
			$( 'body' ).attr( 'data-tizen-theme-default-font-size', themeDefaultFontSize );

			if ( !tizen.util.isMobileBrowser() ) {
				return;
			}

			// Legacy support: tizen.frameworkData.viewportScale
			if ( this.frameworkData.viewportScale == true ) {
				viewportWidth = "screen-width";
			}

			// screen-width support
			if ( "screen-width" == viewportWidth ) {
				if ( window.self == window.top ) {
					// Top frame: for target. Use window.outerWidth.
					viewportWidth = window.outerWidth;
				} else {
					// iframe: for web simulator. Use clientWidth.
					viewportWidth = document.documentElement.clientWidth;
				}
			}

			// set viewport meta tag
			viewportWidth = this.setViewport( viewportWidth );	// If custom viewport setting exists, get viewport width

			if ( viewportWidth == "device-width" ) {
				// Do nothing!
			} else {	// fixed width!
				ratio = parseFloat( viewportWidth / this.frameworkData.defaultViewportWidth );
				this.scaleBaseFontSize( themeDefaultFontSize, ratio );
			}
		}
	};

	function export2TizenNS ( $, tizen ) {
		if ( !$.tizen ) {
			$.tizen = { };
		}

		$.tizen.frameworkData = tizen.frameworkData;
		$.tizen.loadCustomGlobalizeCulture = tizen.loadCustomGlobalizeCulture;
		$.tizen.loadTheme = tizen.loadTheme;

		$.tizen.__tizen__ = tizen;	// for unit-test
	}

	export2TizenNS( $, tizen );

	tizen.getParams( );
	tizen.loadTheme( );
	tizen.setScaling( );	// Run after loadTheme(), for the default font size.
	tizen.setGlobalize( );
	// Turn off JQM's auto initialization option.
	// NOTE: This job must be done before domready.
	$.mobile.autoInitializePage = false;

	$(document).ready( function ( ) {
		$.mobile.initializePage( );
	});

} ( jQuery, Globalize, window ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
