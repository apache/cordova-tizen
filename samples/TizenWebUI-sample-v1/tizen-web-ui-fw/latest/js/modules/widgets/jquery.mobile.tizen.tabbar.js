//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows buttons divided automatically on the header
//>>label: Tabbar
//>>group: Tizen:Widgets

define( [ 
	'jquery', 
	'../jquery.mobile.tizen.core',
	'./jquery.mobile.tizen.pagelayout'
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
 * jQuery Mobile Framework : "tabbar" plugin
 * Copyright (c) jQuery Project
 * Licensed under the MIT license.
 * http://jquery.org/license
 * Authors: Jinhyuk Jun <jinhyuk.jun@samsung.com>
*/

/**
 *  Tabbar can be created using data-role = "tabbar" inside footer 
 *  Framework determine which tabbar will display with tabbar attribute
 *
 * Examples:
 *         
 *     HTML markup for creating tabbar: ( 2 ~ 5 li item available )
 *     icon can be changed data-icon attribute (customized icon need)
 *         <div data-role="footer" data-position ="fixed">
 *              <div data-role="tabbar">
 *                     <ul>
 *                            <li><a href="#" class="ui-btn-active">Menu</a></li>
 *                            <li><a href="#">Save</a></li>
 *                            <li><a href="#">Share</a></li>
 *                     </ul>
 *             </div>
 *      </div>
*/

(function ( $, undefined ) {

	$.widget( "tizen.tabbar", $.mobile.widget, {
		options: {
			iconpos: "top",
			grid: null,
			defaultList : 4,
			initSelector: ":jqmData(role='tabbar')"
		},

		_create: function () {

			var $tabbar = this.element,
				$tabbtns,
				textpos,
				iconpos,
				theme = $.mobile.listview.prototype.options.theme,	/* Get current theme */
				ww = window.innerWidth || $( window ).width(),
				wh = window.innerHeight || $( window ).height(),
				tabbarDividerLeft = "<div class='ui-tabbar-divider ui-tabbar-divider-left'></div>",
				tabbarDividerRight = "<div class='ui-tabbar-divider ui-tabbar-divider-right'></div>",
				isLandscape;

			isLandscape = ww > wh && ( ww - wh );

			if ( isLandscape ) {
				$tabbar.removeClass( "ui-portrait-tabbar" ).addClass( "ui-landscape-tabbar" );
			} else {
				$tabbar.removeClass( "ui-landscape-tabbar" ).addClass( "ui-portrait-tabbar" );
			}

			if ( $tabbar.find( "a" ).length ) {
				$tabbtns = $tabbar.find( "a" );
				iconpos = $tabbtns.filter( ":jqmData(icon)" ).length ? this.options.iconpos : undefined;
				textpos = $tabbtns.html().length ? true : false;
			}

			if ( $tabbar.parents( ".ui-header" ).length && $tabbar.parents( ".ui-scrollview-view" ).length ) {
				$tabbar.find( "li" ).addClass( "tabbar-scroll-li" );
				$tabbar.find( "ul" ).addClass( "tabbar-scroll-ul" );

				/* add shadow divider */
				$( tabbarDividerLeft ).appendTo( $tabbar.parents( ".ui-scrollview-clip" ) );
				$( tabbarDividerRight ).appendTo( $tabbar.parents( ".ui-scrollview-clip" ) );

				$( ".ui-tabbar-divider-left" ).hide();
				$( ".ui-tabbar-divider-right" ).hide();

				/* add width calculation*/
				if ( $tabbar.parents( ".ui-scrollview-view" ).data("default-list") ) {
					this.options.defaultList = $tabbar.parents( ".ui-scrollview-view" ).data( "default-list" );
				}
				$tabbar.find( "li" ).css( "width", window.innerWidth / this.options.defaultList + "px" );
			} else {
				if ( $tabbar.find( "ul" ).children().length ) {
					$tabbar.addClass( "ui-navbar" )
						.find( "ul" )
						.grid( { grid: this.options.grid } );
				}
			}

			if ( $tabbar.parents( ".ui-footer" ).length  ) {
				$tabbar.find( "li" ).addClass( "ui-tab-btn-style" );
			}

			/* title tabbar */
			if ( $tabbar.siblings( ".ui-title" ).length ) {
				$tabbar.parents( ".ui-header" ).addClass( "ui-title-tabbar" );
			}

			if ( !iconpos ) {
				$tabbar.addClass( "ui-tabbar-noicons" );
			}
			if ( !textpos ) {
				$tabbar.addClass( "ui-tabbar-notext" );
			}
			if ( textpos && iconpos ) {
				$tabbar.parents( ".ui-header" ).addClass( "ui-title-tabbar-multiline" );
			}

			if ( $tabbar.find( "a" ).length ) {
				$tabbtns.buttonMarkup({
					corners:	false,
					shadow:		false,
					iconpos:	iconpos
				});
			}

			if ( $tabbar.find( ".ui-state-persist" ).length ) {
				$tabbar.addClass( "ui-tabbar-persist" );
			}

			$tabbar.delegate( "a", "vclick", function ( event ) {
                                if ( $tabbtns.parents( "ul" ).is( ".tabbar-scroll-ul" ) ) {
                                        $tabbtns.removeClass( "ui-tabbar-active" );
                                        $( event.target ).parents( "a" ).addClass( "ui-tabbar-active" );

                                } else {
					$tabbtns.not( ".ui-state-persist" ).removeClass( $.mobile.activeBtnClass );
					$( this ).addClass( $.mobile.activeBtnClass );
				}
			});

			$tabbar.addClass( "ui-tabbar");

			$( document ).bind( "pagebeforeshow", function ( event, ui ) {
				var footer_filter = $( event.target ).find( ":jqmData(role='footer')" ),
					tabbar_filter = footer_filter.find( ":jqmData(role='tabbar')" ),
					$elFooterMore = tabbar_filter.siblings( ":jqmData(icon='naviframe-more')" ),
					$elFooterBack = tabbar_filter.siblings( ".ui-btn-back" );

				footer_filter
					.css( "position", "fixed" )
					.css( "bottom", 0 )
					.css( "height", tabbar_filter.height() );
				if ( $elFooterMore.length ) {
					tabbar_filter.addClass( "ui-tabbar-margin-more" );
				}
				if ( $elFooterBack.length ) {
					tabbar_filter.addClass( "ui-tabbar-margin-back" );
				}
			});

			$tabbar.bind( "touchstart vmousedown", function ( e ) {
				var $tabbarScroll = $( e.target ).parents( ".ui-scrollview-view" );
				if ( $tabbarScroll.offset() ) {
					if ( $tabbarScroll.offset().left < 0 ) {
						$( ".ui-tabbar-divider-left" ).show();
					} else {
						$( ".ui-tabbar-divider-left" ).hide();
					}
					if ( ( $tabbarScroll.width() - $tabbarScroll.parents( ".ui-scrollview-clip" ).width() ) ==  Math.abs( $tabbarScroll.offset().left ) ) {
						$( ".ui-tabbar-divider-right" ).hide();
					} else {
						$( ".ui-tabbar-divider-right" ).show();
					}
				}
			});

			this._bindTabbarEvents();
			this._initTabbarAnimation();
		},

		_initTabbarAnimation: function () {
			var isScrollingStart = false,
				isScrollingEnd = false;
			$( document ).bind( "scrollstart.tabbar", function ( e ) {
				if ( $( e.target ).find( ".ui-tabbar" ).length ) {
					isScrollingStart = true;
					isScrollingEnd = false;
				}
			});

			$( document ).bind( "scrollstop.tabbar", function ( e ) {
				var $tabbarScrollview = $( e.target ),
					$elTabbar = $( e.target ).find( ".ui-tabbar" ),
					$elTabbarLI = $( e.target ).find( ".ui-tabbar li" ),
					$minElement = $elTabbarLI.eq( 0 ),
					minElementIndexVal,
					minElementIndex = -1;

				isScrollingEnd = true;
				if ( $elTabbar.length && isScrollingStart == true ) {
					minElementIndexVal = Math.abs( $elTabbarLI.eq( 0 ).offset().left );
					$elTabbarLI.each( function ( i ) {
						var offset	= $elTabbarLI.eq( i ).offset();

						if ( Math.abs( offset.left ) < minElementIndexVal ) {
							minElementIndexVal = Math.abs( offset.left );
							minElementIndex = i;
							$minElement = $elTabbarLI.eq( i );
						}
					});

					if ( $tabbarScrollview.length && isScrollingStart == isScrollingEnd && minElementIndex != -1) {
						isScrollingStart = false;
						$tabbarScrollview.scrollview( "scrollTo", -( window.innerWidth / $elTabbar.data( "defaultList" ) * minElementIndex ) , 0, 357);
					}
				}

				$( ".ui-tabbar-divider-left" ).hide();
				$( ".ui-tabbar-divider-right" ).hide();
			});
		},

		_bindTabbarEvents: function () {
			var $tabbar = this.element;

			$( window ).bind( "orientationchange", function ( e, ui ) {
				var ww = window.innerWidth || $( window ).width(),
					wh = window.innerHeight || $( window ).height(),
					isLandscape = ww > wh && ( ww - wh );

				if ( isLandscape ) {
					$tabbar.removeClass( "ui-portrait-tabbar" ).addClass( "ui-landscape-tabbar" );
				} else {
					$tabbar.removeClass( "ui-landscape-tabbar" ).addClass( "ui-portrait-tabbar" );
				}
			});
		},

		_setDisabled: function ( value, cnt ) {
			this.element.find( "li" ).eq( cnt ).attr( "disabled", value );
			this.element.find( "li" ).eq( cnt ).attr( "aria-disabled", value );
		},

		disable: function ( cnt ) {
			this._setDisabled( true, cnt );
			this.element.find( "li" ).eq( cnt ).addClass( "ui-disabled" );
		},

		enable: function ( cnt ) {
			this._setDisabled( false, cnt );
			this.element.find( "li" ).eq( cnt ).removeClass( "ui-disabled" );
		}
	});

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.tabbar.prototype.options.initSelector, e.target ).tabbar();
	});
}( jQuery ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
