
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
					if ( o.updatePagePadding ) {
						$( window ).bind( "throttledresize." + self.widgetName, function () {
							self.updatePagePadding(thisPage);

							self.updatePageLayout( thisPage, false);
							self._updateHeaderArea( thisPage );
							self._setContentMinHeight( thisPage );
						});
					}
				})

				.bind( "pagebeforehide", function ( e, ui ) {
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

				if ( $elPage.data( "addBackBtn" ) ) {
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
						backBtn = $( ".ui-page-active .ui-btn-back" );
						backBtn.hide();
						self._backBtnQueue.push( backBtn );	// Store hidden backBtn
					} else if ( e.state == "off" ) {
						self._backBtnQueue.forEach( function ( b ) {
							b.show();	// Show each backBtn,
						} );
						self._backBtnQueue.length = 0;	// and clear queue.

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

		_setContentMinHeight : function ( thisPage ) {
			var $elPage = $( thisPage ),
				$elHeader = $elPage.find( ":jqmData(role='header')" ),
				$elFooter = $elPage.find( ":jqmData(role='footer')" ),
				$elContent = $elPage.find( ":jqmData(role='content')" ),
				resultMinHeight,
				dpr = 1,
				layoutInnerHeight = window.innerHeight;

                        if ( !$.support.scrollview || ($.support.scrollview && $elContent.jqmData("scroll") === "none") ) {
                                dpr = window.outerWidth / window.innerWidth;
                                layoutInnerHeight = Math.floor( window.outerHeight / dpr );
                        } else {
				layoutInnerHeight = window.innerHeight;
			}

			resultMinHeight = layoutInnerHeight - $elHeader.height() - $elFooter.height();

                        if ( $.support.scrollview && $elContent.jqmData("scroll") !== "none" ) {
				$elContent.css( "min-height", resultMinHeight - parseFloat( $elContent.css("padding-top") ) - parseFloat( $elContent.css("padding-bottom") ) + "px" );
				$elContent.children( ".ui-scrollview-view" ).css( "min-height", $elContent.css( "min-height" ) );
			}
		},

		_updateHeaderArea : function ( thisPage ) {
			var $elPage = $( thisPage ),
				$elHeader = $elPage.find( ":jqmData(role='header')" ).length ? $elPage.find( ":jqmData(role='header')") : $elPage.siblings( ":jqmData(role='header')"),
				headerBtnNum = $elHeader.children("a").length,
				headerSrcNum = $elHeader.children("img").length;

			if ( !$elPage.is( ".ui-dialog" ) ) {
				$elHeader.find( "h1" ).css( "width", window.innerWidth - parseInt( $elHeader.find( "h1" ).css( "margin-left" ), 10 ) * 2 - $elHeader.children( "a" ).width() * headerBtnNum - $elHeader.children( "a" ).width() / 4 - $elHeader.children( "img" ).width() * headerSrcNum * 4 );
			}
			/* add half width for default space between text and button, and img tag area is too narrow, so multiply three for img width*/
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
			$( tbPage ).css( "padding-bottom", ( footer ? $el.siblings( ".ui-footer" ).outerHeight() : 0 ) );
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
				layoutInnerHeight = window.innerHeight;
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
		});

}( jQuery ));

