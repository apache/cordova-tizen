//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Set a layout of pages
//>>label: Pagelayout
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	'../jquery.mobile.tizen.core',
	'../jquery.mobile.tizen.scrollview',
	"jqm/widgets/page",
	"jqm/widgets/page.sections",
	"jqm/widgets/popup",
	"jqm/jquery.mobile.zoom"
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
 *	Author: Jinhyuk Jun <jinhyuk.jun@samsung.com>
 */

(function ( $, undefined ) {

	$.widget( "mobile.pagelayout", $.mobile.widget, {
		options: {
			visibleOnPageShow: true,
			disablePageZoom: true,
			transition: "slide", //can be none, fade, slide (slide maps to slideup or slidedown)
			fullscreen: false,
			tapToggle: true,
			tapToggleBlacklist: "a, input, select, textarea, .ui-header-fixed, .ui-footer-fixed",
			hideDuringFocus: "input, textarea, select",
			updatePagePadding: true,
			// Browser detection! Weeee, here we go...
			// Unfortunately, position:fixed is costly, not to mention probably impossible, to feature-detect accurately.
			// Some tests exist, but they currently return false results in critical devices and browsers, which could lead to a broken experience.
			// Testing fixed positioning is also pretty obtrusive to page load, requiring injected elements and scrolling the window
			// The following function serves to rule out some popular browsers with known fixed-positioning issues
			// This is a plugin option like any other, so feel free to improve or overwrite it
			supportBlacklist: function () {
				var w = window,
					ua = navigator.userAgent,
					platform = navigator.platform,
					// Rendering engine is Webkit, and capture major version
					wkmatch = ua.match( /AppleWebKit\/([0-9]+)/ ),
					wkversion = !!wkmatch && wkmatch[ 1 ],
					ffmatch = ua.match( /Fennec\/([0-9]+)/ ),
					ffversion = !!ffmatch && ffmatch[ 1 ],
					operammobilematch = ua.match( /Opera Mobi\/([0-9]+)/ ),
					omversion = !!operammobilematch && operammobilematch[ 1 ];

				if (
					// iOS 4.3 and older : Platform is iPhone/Pad/Touch and Webkit version is less than 534 (ios5)
					( ( platform.indexOf( "iPhone" ) > -1 || platform.indexOf( "iPad" ) > -1  || platform.indexOf( "iPod" ) > -1 ) && wkversion && wkversion < 534 ) ||
						// Opera Mini
						( w.operamini && ({}).toString.call( w.operamini ) === "[object OperaMini]" ) ||
						( operammobilematch && omversion < 7458 ) ||
						//Android lte 2.1: Platform is Android and Webkit version is less than 533 (Android 2.2)
						( ua.indexOf( "Android" ) > -1 && wkversion && wkversion < 533 ) ||
						// Firefox Mobile before 6.0 -
						( ffversion && ffversion < 6 ) ||
						// WebOS less than 3
						( window.palmGetResource !== undefined && wkversion && wkversion < 534 ) ||
						// MeeGo
						( ua.indexOf( "MeeGo" ) > -1 && ua.indexOf( "NokiaBrowser/8.5.0" ) > -1 )
				) {
					return true;
				}

				return false;
			},
			initSelector: ":jqmData(role='content')"
		},

		_create: function () {

			var self = this,
				o = self.options,
				$el = self.element;

			// Feature detecting support for
			if ( o.supportBlacklist() ) {
				self.destroy();
				return;
			}

			self._addFixedClass();
			self._addTransitionClass();
			self._bindPageEvents();

			// only content
			self._bindContentControlEvents();

			// Store back-button, to show again
			self._backBtnQueue = [];
		},

		/* add minimum fixed css style to bar(header/footer) and content
		*  it need to update when core source modified(jquery.mobile.page.section.js)
		*  modified from core source cuz initSelector different */
		_addFixedClass: function () {
			var self = this,
				o = self.options,
				$el = self.element,
				$elHeader = $el.siblings( ":jqmData(role='header')" ),
				$elFooter = $el.siblings( ":jqmData(role='footer')" ),
				$elPage = $el.closest(".ui-page");

			$elHeader.addClass( "ui-header-fixed" );
			$elFooter.addClass( "ui-footer-fixed" );

			// "fullscreen" overlay positioning
			if ( o.fullscreen ) {
				$elHeader.addClass( "ui-header-fullscreen" );
				$elFooter.addClass( "ui-footer-fullscreen" );
				$elPage
					.addClass( "ui-page-header-fullscreen" )
					.addClass( "ui-page-footer-fullscreen" );
			} else {
			// If not fullscreen, add class to page to set top or bottom padding
				$elPage.addClass( "ui-page-header-fixed" )
					.addClass( "ui-page-footer-fixed" );
			}
		},

		/* original core source(jquery.mobile.fixedToolbar.js)
		* never changed */
		_addTransitionClass: function () {
			var tclass = this.options.transition;

			if ( tclass && tclass !== "none" ) {
				// use appropriate slide for header or footer
				if ( tclass === "slide" ) {
					tclass = this.element.is( ".ui-header" ) ? "slidedown" : "slideup";
				}

				this.element.addClass( tclass );
			}
		},


		/* Set default page positon
		* 1. add title style to header
		* 2. Set default header/footer position */
		setHeaderFooter: function ( thisPage ) {
			var $elPage = $( thisPage ),
				$elHeader = $elPage.find( ":jqmData(role='header')" ).length ? $elPage.find( ":jqmData(role='header')") : $elPage.siblings( ":jqmData(role='header')"),
				$elContent = $elPage.find( ".ui-content" ),
				$elFooter = $elPage.find( ":jqmData(role='footer')" ),
				$elFooterGroup = $elFooter.find( ":jqmData(role='fieldcontain')" ),
				$elFooterControlGroup = $elFooter.find( ".ui-controlgroup" );

			// divide content mode scrollview and non-scrollview
			if ( !$elPage.is( ".ui-dialog" ) ) {
				if ( $elHeader.jqmData("position") == "fixed" || ( $.support.scrollview && $.tizen.frameworkData.theme.match(/tizen/) ) ) {
					$elHeader
						.css( "position", "fixed" )
						.css( "top", "0px" );
				} else if ( !$.support.scrollview && $elHeader.jqmData("position") != "fixed" ) {
					$elHeader.css( "position", "relative" );
				}
			}

			/* set Title style */
			if ( $elHeader.find("span.ui-title-text-sub").length ) {
				$elHeader.addClass( "ui-title-multiline");
			}

			if ( $elFooterGroup.find( "div" ).is( ".ui-controlgroup-label" ) ) {
				$elFooterGroup.find( "div.ui-controlgroup-label" ).remove();
			}

			if ( $elFooterControlGroup.length ) {
				var anchorPer = 100 / $elFooterControlGroup.find( "a" ).length;
				$elFooterControlGroup.find( "a" ).each( function ( i ) {
					$elFooterControlGroup.find( "a" ).eq( i ).width( anchorPer + "%" );
				});
			}
		},

		_bindPageEvents: function () {
			var self = this,
				o = self.options,
				$el = self.element,
				$elCurrentFooter;

			//page event bindings
			// Fixed toolbars require page zoom to be disabled, otherwise usability issues crop up
			// This method is meant to disable zoom while a fixed-positioned toolbar page is visible
			$el.closest( ".ui-page" )
				.bind( "pagebeforeshow", function ( event ) {
					var thisPage = this;
					if ( o.disablePageZoom ) {
						$.mobile.zoom.disable( true );
					}
					if ( !o.visibleOnPageShow ) {
						self.hide( true );
					}
					self.setHeaderFooter( thisPage );
					self._setContentMinHeight( thisPage );
					self._updateHeaderArea( thisPage );
					self._updateFooterArea( thisPage );
				} )
				.bind( "webkitAnimationStart animationstart updatelayout", function ( e, data ) {
					var thisPage = this;
					if ( o.updatePagePadding ) {
						self.updatePagePadding(thisPage);
						self.updatePageLayout( thisPage, data);
					}
				})

				.bind( "pageshow", function ( event ) {
					var thisPage = this;
					self._setContentMinHeight( thisPage );
					self.updatePagePadding( thisPage );
					self._updateHeaderArea( thisPage );
					self._updateFooterArea( thisPage );

					// check device api : HW key existance
					// TODO: remove these functions, because the HW key is mandatory.
					if ( false ) {
						self._bindHWkeyOnSWBtn();
						self._setHWKeyLayout( thisPage );
					}
					self._setHWKeySupport( thisPage );
					//self._setMenuPopupLayout( thisPage );

					if ( o.updatePagePadding ) {
						$( window ).bind( "throttledresize." + self.widgetName, function () {
							self.updatePagePadding(thisPage);
							self.updatePageLayout( thisPage, true);
							self._updateHeaderArea( thisPage );
							self._updateFooterArea( thisPage );
							self._setContentMinHeight( thisPage );
						});
					}
				})

				.bind( "pagebeforehide", function ( e, ui ) {
					self._unsetHWKeySupport( );
					if ( o.disablePageZoom ) {
						$.mobile.zoom.enable( true );
					}
					if ( o.updatePagePadding ) {
						$( window ).unbind( "throttledresize." + self.widgetName );
					}
				});

			window.addEventListener( "softkeyboardchange", function ( e ) {
				var $elDownBtn = $( "<div class='ui-btn-footer-down'></div>" ),
					$elPage = $( ".ui-page-active" ),
					backBtn,
					backBtnPosition = "footer";
				// N_SE-42987 : If self._backBtnQueue.length has value is not 0, this means .ui-btn-back button is still hidden.
				//		So, condition that check self._backBtnQueue value add.
				if ( $elPage.data( "addBackBtn" ) || self._backBtnQueue.length ) {
					$elPage.data( "addBackBtn" ) == "header" ? backBtnPosition = "header" : backBtnPosition = "footer";

					if ( e.state == "on" ) {
						if ( !$elPage.find( ".ui-" + backBtnPosition + " .ui-btn-footer-down" ).length ) {
							$elDownBtn.buttonMarkup( { icon: "down" } ).appendTo( $elPage.find( ".ui-" + backBtnPosition ) );
						}

						// N_SE-32900: If an app moves a page when the pop is shown, the .ui-page-active page
						//             is changed.
						//             In this case, the '.ui-page-active .ui-btn-back' selector indicates a
						//             new page's one, and the old page's .ui-btn-back button is still hidden.
						//             So, the current back button is remembered to be shown at the
						//             softkeyboardchange.off event.
						if ( true ) {
							backBtn = $( ".ui-page-active .ui-btn-back" );
							backBtn.hide();
							self._backBtnQueue.push( backBtn );	// Store hidden backBtn
						}
					} else if ( e.state == "off" ) {
						if ( true ) {
							self._backBtnQueue.forEach( function ( b ) {
								b.show();	// Show each backBtn,
							} );
							self._backBtnQueue.length = 0;	// and clear queue.
						}
						$( ".ui-btn-footer-down" ).remove();
					}
				}
			});
		},

		_bindContentControlEvents: function () {
			var self = this,
				o = self.options,
				$el = self.element;

			$el.closest( ".ui-page" )
				.bind( "pagebeforeshow", function ( event ) {

				});
		},

		_HWKeyHandler: function ( ev ) {
			var $openedpopup = $.mobile.popup.active,
				$page,
				$focused;
			// NOTE: The 'tizenhwkey' event is passed only document -> window objects.
			//       Other DOM elements does not receive 'tizenhwkey' event.

			// menu key
			if( ev.originalEvent.keyName == "menu" ) {
				// Blur focused element to turn off SIP(IME)
				$page = $( ev.data ); 	// page object, passed by _setHWKeySupport()
				$focused = $page.find( ".ui-focus" );
				if( $focused[0] ) {	// Focused element is found
					$focused.blur();
					// NOTE: If a popup is opened and focused element exists in it,
					//       do not close that popup.
					//       'false' is returned here, hence popup close routine is not run.
					return false;
				}
				// Close opened popup
				if( $openedpopup ) {
					$openedpopup.close();
					return false;
				}
			}
			// back key
			else if( ev.originalEvent.keyName == "back" ) {
				// Close opened popup
				if( $openedpopup ) {
					$openedpopup.close();
					return false;
				}
			}
			return true;	// Otherwise, propagate tizenhwkey event to window object
		},

		_setHWKeySupport: function( thisPage ) {
			$( document ).on( "tizenhwkey", thisPage, this._HWKeyHandler );
		},

		_unsetHWKeySupport: function () {
			$( document ).off( "tizenhwkey", this._HWKeyHandler );
		},

		_bindHWkeyOnSWBtn: function () {
			// if HW key not exist
			// return true
			// else
			$( document ).on( "tizenhwkey", function( e ) {
				var openedpopup = $.mobile.popup.active,
					$elPage = $( ".ui-page-active" ),
					$elFooter = $elPage.find( ":jqmData(role='footer')" ),
					$elMoreKey = $elFooter.children(":jqmData(icon='naviframe-more')"),
					morePopup;

				if ( $( ".ui-page-active .ui-footer" ).hasClass( "ui-footer-force-btn-show" ) ) {
					return true;
				}

				if ( e.originalEvent.keyName === "back" ) {
					// need to change back button
					if( openedpopup ) {
						openedpopup.close();
						return false;
					}
					//Click trigger
					 $( ".ui-page-active .ui-footer .ui-btn-back" ).trigger( "click" );
					return false;
				} else if ( e.originalEvent.keyName === "menu" ) {
					// if more button was clicked, all kinds of popups will be closed
					if ( openedpopup ) {
						openedpopup.close();
						return false;
					}

					// need to change more key trigger
					if ( $elMoreKey.get(0) ) {
						$elMoreKey.trigger( "click" );
					}
					return false;
				}
			} );

		},

		_setContentMinHeight : function ( thisPage ) {
			var $elPage = $( thisPage ),
				$elHeader = $elPage.find( ":jqmData(role='header')" ),
				$elFooter = $elPage.find( ":jqmData(role='footer')" ),
				$elContent = $elPage.find( ":jqmData(role='content')" ),
				footerHeight,
				resultMinHeight,
				dpr = 1,
				layoutInnerHeight = window.innerHeight;

			if ( !$.support.scrollview || ($.support.scrollview && $elContent.jqmData("scroll") === "none") ) {
					dpr = window.outerWidth / window.innerWidth;
					layoutInnerHeight = Math.floor( window.outerHeight / dpr );
			} else {
				layoutInnerHeight = window.innerHeight;
			}

			if ( $elFooter.css( "display" ) === "none" ) {
				footerHeight = 0;
			} else {
				footerHeight = $elFooter.height();
			}
			resultMinHeight = layoutInnerHeight - $elHeader.height() - footerHeight;

			if ( $.support.scrollview && $elContent.jqmData("scroll") !== "none" ) {
				$elContent.css( "min-height", resultMinHeight - parseFloat( $elContent.css("padding-top") ) - parseFloat( $elContent.css("padding-bottom") ) + "px" );
				$elContent.children( ".ui-scrollview-view" ).css( "min-height", $elContent.css( "min-height" ) );
			}
		},

		_updateHeaderArea : function ( thisPage ) {
			var $elPage = $( thisPage ),
				$elHeader = $elPage.find( ":jqmData(role='header')" ).length ? $elPage.find( ":jqmData(role='header')") : $elPage.siblings( ":jqmData(role='header')"),
				$headerBtn = $elHeader.children("a,[data-"+$.mobile.ns+"role=button]"),
				headerBtnWidth = $headerBtn.width() + parseInt( $headerBtn.css("padding-left") ) + parseInt( $headerBtn.css("padding-right") ),
				headerBtnNum = $headerBtn.length,
				$headerSrc = $elHeader.children("img"),
				headerSrcNum = $headerSrc.length,
				headerSrcWidth = $headerSrc.width() + parseInt( $headerSrc.css("margin-left") ),
				h1width;

			if ( !$elPage.is( ".ui-dialog" ) ) {
				h1width = window.innerWidth - parseInt( $elHeader.find( "h1" ).css( "margin-left" ), 10 ) * 2 - headerBtnWidth * headerBtnNum - headerSrcWidth * headerSrcNum;
				$elHeader.find( "h1" ).css( "width", h1width );
				$elHeader.find( '.ui-title-text-sub' ).css( "width", h1width );
			}
			/* add half width for default space between text and button, and img tag area is too narrow, so multiply three for img width*/
		},

		_updateFooterArea : function ( thisPage ) {
			var $elPage = $( thisPage ),
				$elFooter = $elPage.find( ".ui-footer" ),
				$elMoreKey = $elFooter.children( ":jqmData(icon='naviframe-more')" ),
				$elBackKey = $elFooter.children( ".ui-btn-back, .ui-btn-footer-down" ),
				footerBtn = $elFooter.children( "div.ui-btn, a.ui-btn" ),
				btnLength = footerBtn.length,
				btnWidth = window.innerWidth,
				realBtnIndex = 0,
				idx, moreWidth = 0;

			if ( !btnLength ) {
				return;
			}

			if ( $elMoreKey.length ) {
				moreWidth = $elMoreKey.width();
				btnWidth -= moreWidth;
			}

			if ( $elBackKey.length ) {
				btnWidth -= $elBackKey.width();
				$elBackKey.addClass( "ui-footer-btn-border" );
			}

			btnWidth /= btnLength - $elMoreKey.length - $elBackKey.length;

			for ( idx = 0; idx < btnLength; idx++ ) {
				if ( footerBtn.eq( idx ).hasClass( "ui-btn-back" ) ) {
					continue;
				}
				if ( footerBtn.eq( idx ).is( ":jqmData(icon='naviframe-more')" ) ){
					continue;
				}
				footerBtn.eq( idx )
					.addClass( "ui-footer-btn-border" )
					.width( btnWidth )
					.css( "position", "absolute" )
					.css( "left", realBtnIndex * btnWidth + moreWidth );
				realBtnIndex++;
			}
			$elFooter.find( ".ui-footer-btn-border" ).eq( 0 ).removeClass( "ui-footer-btn-border" );
		},

		_setHWKeyLayout : function ( thisPage ) {
			var $elPage = $( thisPage ),
				$elFooter = $elPage.find( ":jqmData(role='footer')" ),
				$elBackKey = $elFooter.children( ".ui-btn-back" ),
				$elMoreKey = $elFooter.children(":jqmData(icon='naviframe-more')"),
				$elTabBar = $elFooter.children( ".ui-tabbar" ),
				$elControlGroup = $elFooter.children( ".ui-controlgroup" );
				//cntMore = 0,
			
				// Check HW Key option
			if ( $elFooter.hasClass("ui-footer-force-btn-show") ) {
				return true;
			}

			/*
			if ( $elMoreKey.length ) {
				cntMore = $elMoreKey.length + 1;
			} else {
				cntMore = 0;
			}

			// need to add device api to check HW key exist
			// Case 1 : footer - BackKey/MoreKey/Button - hide BackKey/MoreKey
			if ( $elFooter.children().length - $elBackKey.length - cntMore > 0 ) {
				$elBackKey.hide();
				$elMoreKey.hide();
			// Case 2 : footer - BackKey/MoreKey - more, back hide depend on OSP
			} else {
				$elBackKey.hide();
				$elMoreKey.hide();
			}
			*/

			if( $elMoreKey ) {
				$elMoreKey.hide();
			}
			if( $elBackKey ) {
				$elBackKey.hide();
			}
			if( $elTabBar ) {
				$elTabBar.removeClass( "ui-tabbar-margin-more ui-tabbar-margin-back" );
			}
			if ( $elControlGroup ) {
				$elControlGroup.removeClass( "ui-controlgroup-padding-more ui-controlgroup-padding-back" );
			}
			// Case 3 : no footer - do nothing

			return true;
		},
		_setMenuPopupLayout: function ( thisPage ) {
			var $page = $( thisPage ),
				$footer = $page.find( ":jqmData(role='footer')" ),
				moreKey = $page.find( ":jqmData(icon='naviframe-more')" )[0],
				//cntMore = 0,
				$morePopup;

			if( moreKey && moreKey.hash ) {	// moreKey.hash = #morePopupID (from <a href="">)
				$morePopup =  $( moreKey.hash );
				$morePopup.addClass ( "ui-ctxpopup-optionmenu" );
			}
		 },

		_visible: true,

		// This will set the content element's top or bottom padding equal to the toolbar's height
		updatePagePadding: function ( tbPage ) {
			var $el = this.element,
				header = $el.siblings( ".ui-header" ).length,
				footer = $el.siblings( ".ui-footer" ).length;

			// This behavior only applies to "fixed", not "fullscreen"
			if ( this.options.fullscreen ) {
				return;
			}

			tbPage = tbPage || $el.closest( ".ui-page" );

			if ( $el.siblings( ".ui-header" ).jqmData("position") == "fixed" || ($.support.scrollview && $el.jqmData("scroll") !== "none" )) {
				$( tbPage ).css( "padding-top", ( header ? $el.siblings( ".ui-header" ).outerHeight() : 0 ) );
			}
			$( tbPage ).css( "padding-bottom", (( footer && $el.siblings( ".ui-footer" ).css( "display" ) !== "none" ) ? $el.siblings( ".ui-footer" ).outerHeight() : 0 ) );
		},

		/* 1. Calculate and update content height   */
		updatePageLayout: function ( thisPage, receiveType ) {
			var $elFooter,
				$elPage = $( thisPage ),
				$elHeader = $elPage.find( ":jqmData(role='header')" ),
				$elContent = $elPage.find( ":jqmData(role='content')" ),
				resultContentHeight = 0,
				resultFooterHeight = 0,
				resultHeaderHeight = 0,
				layoutInnerHeight = window.innerHeight,
				dpr = 1;

			if ( $elPage.length ) {
				$elFooter = $elPage.find( ":jqmData(role='footer')" );
			} else {
				$elFooter = $( document ).find( ":jqmData(role='footer')" ).eq( 0 );
			}

			// calculate footer height
			resultFooterHeight = ( $elFooter.css( "display" ) == "none" || $elFooter.length == 0 ) ? 0 : $elFooter.height();
			resultHeaderHeight = ( $elHeader.css( "display" ) == "none" || $elHeader.length == 0 ) ? 0 : $elHeader.height();

			if (resultFooterHeight != 0 ) {
				$elFooter.css( "bottom", 0 );
			}

			if ( !$.support.scrollview || ($.support.scrollview && $elContent.jqmData("scroll") === "none") ) {
				dpr = window.outerWidth / window.innerWidth;
				layoutInnerHeight = Math.floor( window.outerHeight / dpr );
			} else {
				//#N_SE-43092: window.innerHeight returns incorrect size
				layoutInnerHeight = $.mobile.$window.height();
			}

			resultContentHeight = layoutInnerHeight - resultFooterHeight - resultHeaderHeight;

			if ( $.support.scrollview && $elContent.jqmData("scroll") !== "none" ) {
				$elContent.height( resultContentHeight -
						parseFloat( $elContent.css("padding-top") ) -
						parseFloat( $elContent.css("padding-bottom") ) );
			}

			// External call page( "refresh") - in case title changed
			if ( receiveType ) {
				$elPage
					.css( "min-height", resultContentHeight )
					.css( "padding-top", resultHeaderHeight )
					.css( "padding-bottom", resultFooterHeight );
			}
		},

		show: function ( notransition ) {
			/* blank function: deprecated */
		},

		hide: function ( notransition ) {
			/* blank function: deprecated */
		},

		toggle: function () {
			this[ this._visible ? "hide" : "show" ]();
		},

		destroy: function () {
			this.element.removeClass( "ui-header-fixed ui-footer-fixed ui-header-fullscreen ui-footer-fullscreen in out fade slidedown slideup ui-fixed-hidden" );
			this.element.closest( ".ui-page" ).removeClass( "ui-page-header-fixed ui-page-footer-fixed ui-page-header-fullscreen ui-page-footer-fullscreen" );
		},

		refresh: function () {
			var $elPage = $( ".ui-page-active" );
			this.setHeaderFooter( $elPage );
			this._updateHeaderArea( $elPage );
		}
	});

	//auto self-init widgets
	$( document )
		.bind( "pagecreate create", function ( e ) {
			// DEPRECATED in 1.1: support for data-fullscreen=true|false on the page element.
			// This line ensures it still works, but we recommend moving the attribute to the toolbars themselves.
			if ( $( e.target ).jqmData( "fullscreen" ) ) {
				$( $.mobile.pagelayout.prototype.options.initSelector, e.target ).not( ":jqmData(fullscreen)" ).jqmData( "fullscreen", true );
			}
			$.mobile.pagelayout.prototype.enhanceWithin( e.target );
		})
		.bind( "pagebeforeshow", function ( event, ui ) {
			var footer_filter = $( event.target ).find( ":jqmData(role='footer')" ),
				controlgroup_filter = footer_filter.find( ":jqmData(role='controlgroup')" ),
				$elFooterMore = controlgroup_filter.siblings( ":jqmData(icon='naviframe-more')" ),
				$elFooterBack = controlgroup_filter.siblings( ".ui-btn-back" );

			if ( $elFooterMore.length ) {
				controlgroup_filter.addClass( "ui-controlgroup-padding-more" );
			}
			if ( $elFooterBack.length ) {
				controlgroup_filter.addClass( "ui-controlgroup-padding-back" );
			}
		});

}( jQuery ));

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
