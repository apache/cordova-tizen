//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows slider bar to input number by dragging
//>>label: Slider
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	'../jquery.mobile.tizen.core'
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
 * Authors: Max Waterman <max.waterman@intel.com>
 * Authors: Minkyu Kang <mk7.kang@samsung.com>
 */

/**
 * tizenslider modifies the JQuery Mobile slider and is created in the same way.
 *
 * See the JQuery Mobile slider widget for more information :
 *     http://jquerymobile.com/demos/1.0a4.1/docs/forms/forms-slider.html
 *
 * The JQuery Mobile slider option:
 *     theme: specify the theme using the 'data-theme' attribute
 *
 * Options:
 *     theme: string; the theme to use if none is specified using the 'data-theme' attribute
 *            default: 'c'
 *     popup: boolean; controls whether the popup is displayed or not
 *                   specify if the popup is enabled using the 'data-popup' attribute
 *                   set from javascript using .tizenslider('option','popup',newValue)
 *
 * Events:
 *     changed: triggers when the value is changed (rather than when the handle is moved)
 *
 * Examples:
 *
 *     <a href="#" id="popupEnabler" data-role="button" data-inline="true">Enable popup</a>
 *     <a href="#" id="popupDisabler" data-role="button" data-inline="true">Disable popup</a>
 *     <div data-role="fieldcontain">
 *         <input id="mySlider" data-theme='a' data-popup='false' type="range" name="slider" value="7" min="0" max="9" />
 *     </div>
 *     <div data-role="fieldcontain">
 *         <input id="mySlider2" type="range" name="slider" value="77" min="0" max="777" />
 *     </div>
 *
 *     // disable popup from javascript
 *     $('#mySlider').tizenslider('option','popup',false);
 *
 *     // from buttons
 *     $('#popupEnabler').bind('vclick', function() {
 *         $('#mySlider').tizenslider('option','popup',true);
 *     });
 *     $('#popupDisabler').bind('vclick', function() {
 *         $('#mySlider').tizenslider('option','popup',false);
 *     });
 */

/**
	@class Slider
	The slider widget shows a control on the screen that you can use to change values by dragging a handle on a horizontal scale. Sliders can be used in Tizen as described in the jQueryMobile documentation for sliders.

	To add a slider widget to the application, use the following code:

		<input data-popup='false' type="range" name="slider" value="5" min="0" max="10" data-icon="text" data-text-left="Min" data-text-right="Max" />

	The slider can define callbacks for events as described in the jQueryMobile documentation for slider events.
	You can use methods with the slider as described in the jQueryMobile documentation for slider methods.
*/
/**
	@property {String} data-icon
	Defines the icon style for the slider ends. The icon options are bright, volume, and text.
	The default value is text.
*/
/**
	@property {Boolean} data-popup
	Enables or disables a pop-up showing the current value while the handle is dragged.
	The default value is true.
*/
/**
	@property {String} data-text-left
	Defines the text displayed on the left side of the slider.
	The data-icon option must be set to text.
*/
/**
	@property {String} data-text-right
	Defines the text displayed on the right side of the slider.
	The data-icon option must be set to text.
*/

(function ($, window, undefined) {
	$.widget("tizen.tizenslider", $.mobile.widget, {
		options: {
			popup: true
		},

		popup: null,
		handle: null,
		handleText: null,

		_create: function () {
			this.currentValue = null;
			this.popupVisible = false;

			var self = this,
				inputElement = $( this.element ),
				slider,
				popupEnabledAttr,
				icon,
				text_right,
				text_left,
				text_length,
				elem_left,
				elem_right,
				margin_left,
				margin_right,
				_closePopup;

			// apply jqm slider
			inputElement.slider();

			// hide the slider input element proper
			inputElement.hide();

			self.popup = $('<div class="ui-slider-popup"></div>');

			// set the popup according to the html attribute
			popupEnabledAttr = inputElement.jqmData('popup');
			if ( popupEnabledAttr !== undefined ) {
				self.options.popup = ( popupEnabledAttr == true );
			}

			// get the actual slider added by jqm
			slider = inputElement.next('.ui-slider');

			icon = inputElement.attr('data-icon');

			// wrap the background
			slider.wrap('<div class="ui-slider-container"></div>');

			// get the handle
			self.handle = slider.find('.ui-slider-handle');

			// remove the rounded corners from the slider and its children
			slider.removeClass('ui-btn-corner-all');
			slider.find('*').removeClass('ui-btn-corner-all');

			// add icon
			switch ( icon ) {
			case 'bright':
			case 'volume':
				elem_left = $('<div class="ui-slider-left-' + icon + '"></div>');
				elem_right = $('<div class="ui-slider-right-' + icon + '"></div>');

				slider.before( elem_left );
				slider.after( elem_right );

				margin_left = elem_left.width() + 16;
				margin_right = elem_right.width() + 16;
				break;

			case 'text':
				text_left = ( inputElement.attr('data-text-left') === undefined ) ? '' :
						inputElement.attr('data-text-left').substring( 0, 3 );
				text_right = ( inputElement.attr('data-text-right') === undefined ) ? '' :
						inputElement.attr('data-text-right').substring( 0, 3 );

				text_length = Math.max( text_left.length, text_right.length ) + 1;

				margin_left = text_length + "rem";
				margin_right = text_length + "rem";

				elem_left = $('<div class="ui-slider-left-text" style="left:' +
					-( text_length ) + 'rem; width:' + text_length + 'rem;">' +
					'<span style="position:relative;top:0.4em;">' +
					text_left +
					'</span></div>');
				elem_right = $('<div class="ui-slider-right-text" style="right:' +
					-( text_length ) + 'rem; width:' + text_length + 'rem;">' +
					'<span style="position:relative;top:0.4em;">' +
					text_right +
					'</span></div>');

				slider.before( elem_left );
				slider.after( elem_right );
				break;
			}

			if ( icon ) {
				slider.parent('.ui-slider-container').css({
					"margin-left": margin_left,
					"margin-right": margin_right
				});
			}

			// add a popup element (hidden initially)
			slider.parents(".ui-page").append( self.popup );
			self.popup.hide();

			// get the element where value can be displayed
			self.handleText = slider.find('.ui-btn-text');

			// set initial value
			self.updateSlider();

			_closePopup = function () {
				slider.trigger( 'vmouseup' );
			};

			// bind to changes in the slider's value to update handle text
			this.element.on('change', function () {
				// 2013.05.31 heeju.joo
				// for "refresh" method, (ex. $("input").val(5).slider("refresh"))
				// conditional statement has been added ( DCM-1735 )
				// if this function just call two functions like else statement,
				// popup and handle displayed in the wrong position because when the variable popupVisible is false, updateSlider() does not call popupPosition().
				if ( !self.popupVisible ) {
					// it is trick to cheat self.updateSlider()
					self.popupVisible = true;
					// updateSlider make the position of handle right
					self.updateSlider();
					// for other method, popupVisible variable need to have original value.
					self.popupVisible = false;
				} else {
					self.updateSlider();
					self.showPopup();
					$.mobile.$document.on( 'vmouseup.slider', _closePopup );
				}
			});

			this.element.on( 'slidestart', function ( event ) {
				self.updateSlider();
				self.showPopup();
				$.mobile.$document.on( 'vmouseup.slider', _closePopup );
			});

			// bind clicks on the handle to show the popup
			self.handle.on('vmousedown', function () {
				self.handle.addClass( "ui-slider-handle-press" );
				self.showPopup();
				$.mobile.$document.on( 'vmouseup.slider', _closePopup );
			});

			slider.on( 'vmousedown', function () {
				self.updateSlider();
				self.handle.addClass( "ui-slider-handle-press" );
				self.showPopup();
				$.mobile.$document.on( 'vmouseup.slider', _closePopup );
			}).on( 'vmouseup', function () {
				self.hidePopup();
				self.handle.removeClass( "ui-slider-handle-press" );
				$.mobile.$document.off('vmouseup.slider');
			});

			$.extend( this, {
				_globalHandler: [
					{
						src: $( window ),
						handler: {
							orientationchange: _closePopup,
						}
					}
				]
			});

			$.each( this._globalHandler, function ( idx, value ) {
				value.src.bind( value.handler );
			});

		},

		// position the popup
		positionPopup: function () {
			var dstOffset = this.handle.offset();

			this.popup.offset({
				left: dstOffset.left + ( this.handle.width() - this.popup.width() ) / 2,
				top: dstOffset.top - this.popup.height()
			});
		},

		// show value on the handle and in popup
		updateSlider: function () {
			var font_size,
				font_length,
				font_top,
				padding_size,
				newValue,
				get_value_length = function ( v ) {
					var val = Math.abs( v ),
						len;

					if ( val > 999 ) {
						len = 4;
					} else if ( val > 99 ) {
						len = 3;
					} else if ( val > 9 ) {
						len = 2;
					} else {
						len = 1;
					}

					if ( v < 0 ) {
						len++;
					}

					return len;
				};

			// remove the title attribute from the handle (which is
			// responsible for the annoying tooltip); NB we have
			// to do it here as the jqm slider sets it every time
			// the slider's value changes :(
			this.handle.removeAttr('title');

			newValue = parseInt(this.element.val(), 10);

			font_length = get_value_length( newValue );

			if ( this.popupVisible ) {
				this.positionPopup();

				switch ( font_length ) {
				case 1:
				case 2:
					font_size = '1.5rem';
					padding_size = '0.15rem';
					break;
				case 3:
					font_size = '1rem';
					padding_size = '0.5rem';
					break;
				default:
					font_size = '0.8rem';
					padding_size = '0.5rem';
					break;
				}

				this.popup.css({
					"font-size": font_size,
					"padding-top": padding_size
				});
			}

			if ( newValue === this.currentValue ) {
				return;
			}

			switch ( font_length ) {
			case 1:
				font_size = '0.95rem';
				font_top = '0';
				break;
			case 2:
				font_size = '0.85rem';
				font_top = '-0.01rem';
				break;
			case 3:
				font_size = '0.65rem';
				font_top = '-0.1rem';
				break;
			default:
				font_size = '0.45rem';
				font_top = '-0.15rem';
				break;
			}

			if ( font_size != this.handleText.css('font-size') ) {
				this.handleText.css({
					'font-size': font_size,
					'top': font_top,
					'position': 'relative'
				});
			}

			this.currentValue = newValue;
			this.handleText.text( newValue );
			this.popup.html( newValue );

			this.element.trigger( 'update', newValue );
		},

		// show the popup
		showPopup: function () {
			if ( !this.options.popup || this.popupVisible ) {
				return;
			}

			this.popup.show();
			this.popupVisible = true;
		},

		// hide the popup
		hidePopup: function () {
			if ( !this.options.popup || !this.popupVisible ) {
				return;
			}

			this.popup.hide();
			this.popupVisible = false;
		},

		_setOption: function (key, value) {
			var needToChange = ( value !== this.options[key] );

			if ( !needToChange ) {
				return;
			}

			switch ( key ) {
			case 'popup':
				this.options.popup = value;

				if ( this.options.popup) {
					this.updateSlider();
				} else {
					this.hidePopup();
				}

				break;
			}
		}
	});

	// stop jqm from initialising sliders
	$( document ).on( "pagebeforecreate", function ( e ) {
		if ( $.data( window, "jqmSliderInitSelector" ) === undefined ) {
			$.data( window, "jqmSliderInitSelector",
				$.mobile.slider.prototype.options.initSelector );
			$.mobile.slider.prototype.options.initSelector = null;
		}
	});

	// initialise sliders with our own slider
	$( document ).on( "pagecreate create", function ( e ) {
		var jqmSliderInitSelector = $.data( window, "jqmSliderInitSelector" );
		$( e.target ).find(jqmSliderInitSelector).each(function () {
			var $this = $( this );
			if ( $this.is("select") ) {
				$this.slider();
			} else {
				$this.tizenslider();
			}
		});
	});

}( jQuery, this ));

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
