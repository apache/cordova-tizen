//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows background listitem by swiping left/right on a listitem
//>>label: Swipe list
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	'../jquery.mobile.tizen.core',
	"jqm/jquery.mobile.widget"
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
 * Authors: Kalyan Kondapally <kalyan.kondapally@intel.com>,
 *          Elliot Smith <elliot.smith@intel.com>
 *          Hyunjung Kim <hjnim.kim@samsung.com>
 */

// Widget which turns a html element into a "swipe":
// i.e. each list item has a sliding "cover" which can be swiped
// to the right (to reveal buttons underneath) or left (to
// cover the buttons again). Clicking on a button under a swipe
// also moves the cover back to the left.
//
// In this case, the cover is over a grid of buttons;
// but it is should also be possible to use other types of markup under the
// list items.
//
// WARNING: This doesn't work well inside a scrollview widget, as
// the touch events currently interfere with each other badly (e.g.
// a swipe will work but cause a scroll as well).
//
// Theme: default is to use the theme on the target element,
// theme passed in options, parent theme, or 'c' if none of the above.
// If list items are themed individually, the cover will pick up the
// theme of the list item which is its parent.
//

/**
	@class Swipe
	The swipe widget shows a view on the screen where the items can be swiped vertically to show a menu.
	To add a swipe widget to the application, use the following code:

		<ul data-role="listview">
			<li data-role="swipe">
				<div data-role="swipe-cover">
					<div data-role="button" data-inline="true">OK</div>
					<div data-role="button" data-inline="true">Cancel</div>
				</div>
				<div data-role="swipe-item-cover">
					<p>This is a swipe item cover.<br>
						This will be swiped out when swipe event comes.</p>
				</div>
			</li>
		</ul>

	You can use methods with the swipe as described in the jQueryMobile documentation for view methods.
*/
/**
	@property {String} data-role
	Creates a swipe using the HTML unordered view (&gt;ul&lt;) element.
	The default value is swipe.

	Creates a swipe item cover using an HTML $gt;div$lt; element. This cover can be swiped to show the content beneath it.
	The default value is swipe-item-cover.
*/
/**
	@method open
	uncover swipe item
*/
/**
	@method close
	cover swipe item
*/
/**
	@method opened
	return coveritem status( coverd or uncovred )
*/
/**
	@event animationstart
	The swipe can define a callback for the animationstart event, which is fired after a item is swipe and the swipe animation is start:
*/
/**
	@event animationend
	The swipe can define a callback for the animationend event, which is fired after a item is swiped and the swipe animation is complete:

		<ul data-role="listview">
		<li data-role="swipe">
				<div data-role="swipe-cover">
					<div data-role="button" data-inline="true">OK</div>
					<div data-role="button" data-inline="true">Cancel</div>
				</div>
				<div data-role="swipe-item-cover" id="foo">
				<p>This is a swipe item cover.<br>
						This will be swiped out when swipe event comes.</p>
				</div>
			</li>
		</ul>
		$("#foo").bind("animationend", function (ev)
		{
			Console.log("Swipe cover's animation is complete.");
		});
*/
(function ($) {

	$.widget("tizen.swipe", $.mobile.widget, {
		options: {
			theme: null
		},

		_create: function () {
			// use the theme set on the element, set in options,
			// the parent theme, or 'c' (in that order of preference)
			var theme = this.element.jqmData('theme') ||
				this.options.theme ||
				this.element.parent().jqmData('theme') ||
				's';

			this.options.theme = theme;
			this._isopen = false;
			this.refresh();
		},

		refresh: function () {
			this._cleanupDom();

			var self = this,
				defaultCoverTheme,
				covers,
				coverTheme,
				item,
				itemHasThemeClass;

			defaultCoverTheme = 'ui-body-' + this.options.theme;

			if ( !this.element.parent().hasClass('ui-listview') ) {
				this.element.parent().listview();
			}
			this.element.addClass('ui-swipe');

			// get the item covers
			covers = this.element.find(':jqmData(role="swipe-item-cover")');
			item = this.element.find(':jqmData(role="swipe-item")');

			this._covers = covers;
			this._item = item;
			item.addClass('ui-swipe-item');
			coverTheme = defaultCoverTheme;
			itemHasThemeClass = item.parent().attr('class')
					.match(/ui\-body\-[a-z]|ui\-bar\-[a-z]/);

			covers.each( function () {
				var cover = $( this );

				if ( itemHasThemeClass ) {
					coverTheme = itemHasThemeClass[0];
				}

				cover.addClass('ui-swipe-item-cover');
				cover.addClass( coverTheme );

				if ( cover.has('.ui-swipe-item-cover-inner').length === 0 ) {
					cover.wrapInner( $('<span/>').addClass('ui-swipe-item-cover-inner') );
				}

				if ( !( cover.data('animateRight') && cover.data('animateLeft') ) ) {
					cover.data('animateRight', function () {
						self._animateCover( cover, 110, item );
					});

					cover.data('animateLeft', function () {
						self._animateCover( cover, 0, item );
					});
				}

				// bind to synthetic events
				item.bind( 'swipeleft', cover.data('animateLeft') );
				cover.bind( 'swiperight', cover.data('animateRight') );
				item.find( '.ui-btn' ).bind( 'vclick', cover.data('animateLeft') );
			} );

		},

		_cleanupDom: function () {
			var self = this,
				defaultCoverTheme,
				cover,
				coverTheme = defaultCoverTheme,
				item,
				itemClass,
				itemHasThemeClass,
				text,
				wrapper;

			defaultCoverTheme = 'ui-body-' + this.options.theme;

			this.element.removeClass('ui-swipe');

			// get the item covers
			cover = this.element.find(':jqmData(role="swipe-item-cover")');
			item = this.element.find(':jqmData(role="swipe-item")');

			item.removeClass('ui-swipe-item');
			cover.removeClass('ui-swipe-item-cover');

			itemClass = item.attr('class');
			itemHasThemeClass = itemClass &&
				itemClass.match(/ui\-body\-[a-z]|ui\-bar\-[a-z]/);

			if ( itemHasThemeClass ) {
				coverTheme = itemHasThemeClass[0];
			}

			cover.removeClass(coverTheme);

			// remove wrapper HTML
			wrapper = cover.find('.ui-swipe-item-cover-inner');
			wrapper.children().unwrap();
			text = wrapper.text();

			if ( text ) {
				cover.append( text );
				wrapper.remove();
			}

			// unbind swipe events
			if ( cover.data('animateRight') && cover.data('animateLeft') ) {
				cover.unbind( 'swiperight', cover.data('animateRight') );
				item.unbind( 'swipeleft', cover.data('animateLeft') );

				// unbind clicks on buttons inside the item
				item.find('.ui-btn').unbind( 'vclick', cover.data('animateLeft') );

				cover.data( 'animateRight', null );
				cover.data( 'animateLeft', null );
			}
		},

		// NB I tried to use CSS animations for this, but the performance
		// and appearance was terrible on Android 2.2 browser;
		// so I reverted to jQuery animations
		//
		// once the cover animation is done, the cover emits an
		// animationComplete event
		_animateCover: function ( cover, leftPercentage, item ) {
			var self = this,
				animationOptions = {
					easing: 'linear',
					duration: 'normal',
					queue: true,
					complete: function () {
						cover.trigger('animationend');
					}
				};

			$( this.element.parent() )
				.find(":jqmData(role='swipe')")
				.each(
					function () {
						if ( this !== self.element.get(0) &&
								$( this ).swipe("opened") ) {
							$( this ).swipe("close");
						}
					}
				);

			if ( leftPercentage == 110 ) {
				this._isopen = true;
			} else {
				this._isopen = false;
			}

			cover.stop();
			cover.clearQueue();
			cover.trigger('animationstart');
			cover.clearQueue().animate( { left: leftPercentage + '%' }, animationOptions );
			if ( leftPercentage == 0 ) {
				item.clearQueue().animate({ opacity: 0 }, "slow");
			} else {
				item.clearQueue().animate({ opacity: 1 }, "slow");
			}

		},

		destroy: function () {
			this._cleanupDom();
		},

		open: function () {
			var self = this;

			$( self._covers ).each( function () {
				var cover = $( this );
				self._animateCover( cover, 110, self._item);
			} );
		},

		opened: function () {
			return this._isopen;
		},

		close: function () {
			var self = this;

			$( self._covers ).each( function () {
				var cover = $( this );
				self._animateCover( cover, 0, self._item);
			} );
		}

	});

	$( document ).bind("pagecreate", function ( e ) {
		$( e.target ).find(":jqmData(role='swipe')").swipe();
	});

}( jQuery ));

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
