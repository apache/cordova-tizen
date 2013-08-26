//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows date and time, and make them able to be changed by user
//>>label: Datetime picker
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	"libs/globalize",
	'./jquery.mobile.tizen.widgetex',
	'./jquery.mobile.tizen.popupwindow.ctxpopup',
	], function ( jQuery, Globalize) {

//>>excludeEnd("jqmBuildExclude");

/*global Globalize:false, range:false, regexp:false*/
/*
 * jQuery Mobile Widget @VERSION
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
 *
 * Authors: Salvatore Iovene <salvatore.iovene@intel.com>
 *			Daehyon Jung <darrenh.jung@samsung.com>
 */

/**
 * datetimepicker is a widget that lets the user select a date and/or a 
 * time. If you'd prefer use as auto-initialization of form elements, 
 * use input elements with type=date/time/datetime within form tag
 * as same as other form elements.
 * 
 * HTML Attributes:
 * 
 *	data-role: 'datetimepicker'
 *	data-format: date format string. e.g) "MMM dd yyyy, HH:mm"
 *	type: 'date', 'datetime', 'time'
 *	value: pre-set value. only accepts ISO date string. e.g) "2012-05-04", "2012-05-04T01:02:03+09:00" 
 *	data-date: any date/time string "new Date()" accepts.
 *
 * Options:
 *	type: 'date', 'datetime', 'time'
 *	format: see data-format in HTML Attributes.
 *	value: see value in HTML Attributes.
 *	date: preset value as JavaScript Date Object representation.
 *
 * APIs:
 *	value( datestring )
 *		: Set date/time to 'datestring'.
 *	value()
 *		: Get current selected date/time as W3C DTF style string.
 *	getValue() - replaced with 'value()'
 *		: same as value()
 *	setValue( datestring ) - replaced with 'value(datestring)'
 *		: same as value( datestring )
 *	changeTypeFormat( type, format ) - deprecated
 *		: Change Type and Format options. use datetimepicker( "option", "format" ) instead
 *
 * Events:
 *	date-changed: Raised when date/time was changed. Date-changed event will be deprecated
 *
 * Examples:
 *	<ul data-role="listview">
 *		<li class="ui-li-3-2-2">
 *			<span class="ui-li-text-main">
 *				<input type="datetime" name="demo-date" id="demo-date" 
 *					data-format="MMM dd yyyy hh:mm tt"/>
 *			</span>
 *			<span class="ui-li-text-sub">
 *				Date/Time Picker - <span id="selected-date1"><em>(select a date first)</em></span>
 *			</span>
 *		</li>
 *		<li class="ui-li-3-2-2">
 *			<span class="ui-li-text-main">
 *				<input type="date" name="demo-date2" id="demo-date2"/>
 *			</span>
 *			<span class="ui-li-text-sub">
 *				Date Picker  - <span id="selected-date2"><em>(select a date first)</em></span>
 *			</span>
 *		</li>
 *		<li class="ui-li-3-2-2">
 *			<span class="ui-li-text-main">
 *				<input type="time" name="demo-date3" id="demo-date3"/>
 *			</span>
 *			<span class="ui-li-text-sub">
 *				Time Picker - <span id="selected-date3"><em>(select a date first)</em></span>
 *			</span>
 *		</li>
 *	</ul>
 * How to get a return value:
 * ==========================
 * Bind to the 'date-changed' event, e.g.:
 *    $("#myDatetimepicker").bind("change", function() {
 *			// your code
 *    });
 */

/**
	@class DateTimePicker
	The picker widgets show a control that you can use to enter date and time values. <br/> To add a date time picker widget to the application, use the following code:

			<li class="ui-li-dialogue ui-datetime">
				<div class="ui-datetime-text-main">
					<input type="datetime" data-format="MMM dd yyyy hh:mm:ss" name="demo-date" id="demo-date" />
				</div>
				<div class="ui-li-text-sub">Date/Time Picker
					<span id="selected-date1"><em>(select a date first)</em></span>
				</div>
			</li>
*/


( function ( $, window, undefined ) {
	$.widget( "tizen.datetimepicker", $.tizen.widgetex, {

		options: {
			type: null, // date, time, datetime applicable
			format: null,
			date: null,
			initSelector: "input[type='date'], input[type='datetime'], input[type='time'], :jqmData(role='datetimepicker')"
		},

		container : null,

		_calendar: function () {
			return Globalize.culture().calendars.standard;
		},

		_value: {
			attr: "data-" + ( $.mobile.ns || "" ) + "date",
			signal: "date-changed"
		},

		_daysInMonth: [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ],

		_isLeapYear: function ( year ) {
			return year % 4 ? 0 : ( year % 100 ? 1 : ( year % 400 ? 0 : 1 ) );
		},

		_makeTwoDigits: function ( val ) {
			var ret = val.toString(10);
			if ( val < 10 ) {
				ret = "0" + ret;
			}
			return ret;
		},

		_setType: function ( type ) {
			//datetime, date, time
			switch (type) {
			case 'datetime':
			case 'date':
			case 'time':
				this.options.type = type;
				break;
			default:
				this.options.type = 'datetime';
				break;
			}

			this.element.attr( "data-" + ( $.mobile.ns ? $.mobile.ns + "-" : "" ) + "type", this.options.type );
			return this.options.type;
		},

		_setFormat: function ( format ) {
			if ( this.options.format != format ) {
				this.options.format = format;
			} else {
				return;
			}

			this.ui.children().remove();

			var token = this._parsePattern( format ),
				div = document.createElement('div'),
				pat,
				tpl,
				tpl2,
				period,
				btn,
				obj = this;

			while ( token.length > 0 ) {
				pat = token.shift();
				tpl = '<span class="ui-btn-picker ui-datefield-%1"' +
					'data-role="button" data-inline="true" data-pat="' + pat + '">%2</span>';
				tpl2= '<span class="ui-datefield-%1" data-pat="' + pat + '">%2</span>';
				switch ( pat ) {
				case 'H': //0 1 2 3 ... 21 22 23
				case 'HH': //00 01 02 ... 21 22 23
				case 'h': //0 1 2 3 ... 11 12
				case 'hh': //00 01 02 ... 11 12
					$(div).append( tpl.replace('%1', 'hour') );
					break;
				case 'mm': //00 01 ... 59
				case 'm': //0 1 2 ... 59
					if ( this.options.type == 'date' ) {
						$(div).append( tpl.replace('%1', 'month') );
					} else {
						$(div).append( tpl.replace('%1', 'min') );
					}
					break;
				case 'ss':
				case 's':
					$(div).append( tpl.replace('%1', 'sec') );
					break;
				case 'd': // day of month 5
				case 'dd': // day of month(leading zero) 05
					$(div).append( tpl.replace('%1', 'day') );
					break;
				case 'M': // Month of year 9
				case 'MM': // Month of year(leading zero) 09
				case 'MMM':
				case 'MMMM':
					$(div).append( tpl.replace('%1', 'month') );
					break;
				case 'yy':	// year two digit
				case 'yyyy': // year four digit
					$(div).append( tpl.replace('%1', 'year') );
					break;
				case 't': //AM / PM indicator(first letter) A, P
					// add button
				case 'tt': //AM / PM indicator AM/PM
					// add button
					btn = '<a href="#" class="ui-datefield-period"' +
						' data-role="button" data-inline="true">period</a>';
					$(div).append( btn );
					break;
				case 'g':
				case 'gg':
					$(div).append( tpl.replace('%1', 'era').replace('%2', this._calendar().eras.name) );
					break;
				case '\t':
					$(div).append( tpl2.replace('%1', 'tab')
							.replace('%2', "<div class='ui-divider-1st'>&nbsp;</div>" +
								"<div class='ui-divider-2nd'>&nbsp;</div>") );
					break;
				default : // string or any non-clickable object
					$(div).append( tpl2.replace('%1', 'seperator').replace('%2', pat.split(/[\-\/]/).join("") ) );
					break;
				}
			}

			this.ui.append( div );
			if ( this.options.date ) {
				this._setDate( this.options.date );
			}

			this.ui.find('.ui-btn-picker').buttonMarkup();
			this.ui.find('.ui-datefield-period').buttonMarkup().bind( 'vclick', function ( e ) {
				obj._switchAmPm( obj );
				return false;
			});

			this.element.attr( "data-" + ( $.mobile.ns ? $.mobile.ns + "-" : "" ) + "format", this.options.format );
			return this.options.format;
		},

		_setDate: function ( newdate ) {
			if ( typeof ( newdate ) == "string" ) {
				newdate = new Date( newdate );
			}

			var fields = $('span,a', this.ui),
				type,
				fn,
				$field,
				btn,
				i;

			function getMonth() {
				return newdate.getMonth() + 1;
			}

			for ( i = 0; i < fields.length; i++ ) {
				$field = $(fields[i]);
				type = $field.attr("class").match(/ui-datefield-([\w]*)/);
				if ( !type ) {
					type = "";
				}
				switch ( type[1] ) {
				case 'hour':
					fn = newdate.getHours;
					break;
				case 'min':
					fn = newdate.getMinutes;
					break;
				case 'sec':
					fn = newdate.getSeconds;
					break;
				case 'year':
					fn = newdate.getFullYear;
					break;
				case 'month':
					fn = getMonth;
					break;
				case 'day':
					fn = newdate.getDate;
					break;
				case 'period':
					fn = newdate.getHours() < 12 ? this._calendar().AM[0] : this._calendar().PM[0];
					btn = $field.find( '.ui-btn-text' );
					if ( btn.length == 0 ) {
						$field.text(fn);
					} else if ( btn.text() != fn ) {
						btn.text( fn );
					}
					fn = null;
					break;
				default:
					fn = null;
					break;
				}
				if ( fn ) {
					this._updateField( $field, fn.call( newdate ) );
				}
			}

			this.options.date = newdate;

			this._setValue( newdate );

			this.element.attr( "data-" + ( $.mobile.ns ? $.mobile.ns + "-" : "" ) + "date", this.options.date );
			return this.options.date;
		},

		destroy: function () {
			if ( this.ui ) {
				this.ui.remove();
			}

			if ( this.element ) {
				this.element.show();
			}
		},

		value: function ( val ) {
			function timeStr( t, obj ) {
				return obj._makeTwoDigits( t.getHours() ) + ':' +
					obj._makeTwoDigits( t.getMinutes() ) + ':' +
					obj._makeTwoDigits( t.getSeconds() );
			}

			function dateStr( d, obj ) {
				return ( ( d.getFullYear() % 10000 ) + 10000 ).toString().substr(1) + '-' +
					obj._makeTwoDigits( d.getMonth() + 1 ) + '-' +
					obj._makeTwoDigits( d.getDate() );
			}

			var rvalue = null;
			if ( val ) {
				rvalue = this._setDate( val );
			} else {
				switch ( this.options.type ) {
				case 'time':
					rvalue = timeStr( this.options.date, this );
					break;
				case 'date':
					rvalue = dateStr( this.options.date, this );
					break;
				default:
					rvalue = dateStr( this.options.date, this ) + 'T' + timeStr( this.options.date, this );
					break;
				}
			}
			return rvalue;
		},

		setValue: function ( newdate ) {
			console.warn( "setValue was deprecated. use datetimepicker('option', 'date', value) instead." );
			return this.value( newdate );
		},

		/**
		 * return W3C DTF string
		 */
		getValue: function () {
			console.warn("getValue() was deprecated. use datetimepicker('value') instead.");
			return this.value();
		},

		_updateField: function ( target, value ) {
			if ( !target || target.length == 0 ) {
				return;
			}

			if ( value == 0 ) {
				value = "0";
			}

			var pat = target.jqmData( 'pat' ),
				hour,
				text,
				self = this;

			switch ( pat ) {
			case 'H':
			case 'HH':
			case 'h':
			case 'hh':
				hour = value;
				if ( pat.charAt(0) == 'h' ) {
					if ( hour > 12 ) {
						hour -= 12;
					} else if ( hour == 0 ) {
						hour = 12;
					}
				}
				hour = this._makeTwoDigits( hour );
				text = hour;
				break;
			case 'm':
			case 'M':
			case 'd':
			case 's':
				text = value;
				break;
			case 'mm':
			case 'dd':
			case 'MM':
			case 'ss':
				text = this._makeTwoDigits( value );
				break;
			case 'MMM':
				text = this._calendar().months.namesAbbr[ value - 1];
				break;
			case 'MMMM':
				text = this._calendar().months.names[ value - 1 ];
				break;
			case 'yy':
				text = this._makeTwoDigits( value % 100 );
				break;
			case 'yyyy':
				if ( value < 10 ) {
					value = '000' + value;
				} else if ( value < 100 ) {
					value = '00' + value;
				} else if ( value < 1000 ) {
					value = '0' + value;
				}
				text = value;
				break;
			}

			// to avoid reflow where its value isn't out-dated
			if ( target.text() != text ) {
				if ( target.hasClass("ui-datefield-selected") ) {
					target.addClass("out");
					this._new_value = text;

					target.animationComplete( function () {
						target.text( self._new_value);
						target.addClass("in")
							.removeClass("out");

						target.animationComplete( function () {
							target.removeClass("in").
								removeClass("ui-datefield-selected");
						});
					});
				} else {
					target.text( text );
				}
			}
		},

		_switchAmPm: function ( obj ) {
			if ( this._calendar().AM != null ) {
				var date = new Date( this.options.date ),
					text,
					change = 1000 * 60 * 60 * 12;
				if ( date.getHours() > 11 ) {
					change = -change;
				}
				date.setTime( date.getTime() + change );
				this._setDate( date );
			}
		},

		_parsePattern: function ( pattern ) {
			var regex = /\/|\s|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|f|gg|g|\'[\w\W]*\'$|[\w\W]/g,
				matches,
				i;

			matches = pattern.match( regex );

			for ( i = 0; i < matches.length; i++ ) {
				if ( matches[i].charAt(0) == "'" ) {
					matches[i] = matches[i].substr( 1, matches[i].length - 2 );
				}
			}

			return matches;
		},

		changeTypeFormat: function ( type, format ) {
			console.warn('changeTypeFormat() was deprecated. use datetimepicker("option", "type"|"format", value) instead');
			if ( type ) {
				this._setType( type );
			}

			if ( format ) {
				this._setFormat( format );
			}
		},

		_create: function () {
			var obj = this;

			if ( this.element.is( "input" ) ) {
				( function ( obj ) {
					var type, value, format;

					type = obj.element.get(0).getAttribute( "type" );
					obj.options.type = type;

					value = obj.element.get(0).getAttribute( "value" );
					if ( value ) {
						obj.options.date = new Date( value );
					}
				}( this ) );
			}

			if ( !this.options.format ) {
				switch ( this.options.type ) {
				case 'datetime':
					this.options.format = this._calendar().patterns.d + "\t" + this._calendar().patterns.t;
					break;
				case 'date':
					this.options.format = this._calendar().patterns.d;
					break;
				case 'time':
					this.options.format = this._calendar().patterns.t;
					break;
				}
			}

			if ( !this.options.date ) {
				this.options.date = new Date();
			}

			this.element.hide();
			this.ui = $('<div class="ui-datefield"></div>');
			$(this.element).after( this.ui );

			this._popup_open = false;
			this.ui.bind('vclick', function ( e ) {
				obj._showDataSelector( obj, this, e.target );
			});

			$.extend( this, {
				_globalHandlers: [
					{
						src: $( window ),
						handler: {
							orientationchange: $.proxy( this, "_orientationHandler" )
						}
					}
				]
			});

			$.each( this._globalHandlers, function( idx, value ) {
				value.src.bind( value.handler );
			});
		},
		_orientationHandler: function() {
			var self = this;
			if( self._popup_open ) {
				self._popup_open = false;
				self.container.popupwindow( 'close' );
			}
			return false;
		},
		_populateDataSelector: function ( field, pat ) {
			var values,
				numItems,
				current,
				data,
				range = window.range,
				local,
				yearlb,
				yearhb,
				day;

			switch ( field ) {
			case 'hour':
				if ( pat == 'H' || pat == 'HH' ) {
					// twentyfour
					values = range( 0, 23 );
					data = range( 0, 23 );
					current = this.options.date.getHours();
				} else {
					values = range( 1, 12 );
					current = this.options.date.getHours() - 1;//11
					if ( current >= 11 ) {
						current = current - 12;
						data = range( 13, 23 );
						data.push( 12 ); // consider 12:00 am as 00:00
					} else {
						data = range( 1, 11 );
						data.push( 0 );
					}
					if ( current < 0 ) {
						current = 11; // 12:00 or 00:00
					}
				}
				if ( pat.length == 2 ) {
					// two digit
					values = values.map( this._makeTwoDigits );
				}
				numItems = values.length;
				break;
			case 'min':
			case 'sec':
				values = range( 0, 59 );
				if ( pat.length == 2 ) {
					values = values.map( this._makeTwoDigits );
				}
				data = range( 0, 59 );
				current = ( field == 'min' ? this.options.date.getMinutes() : this.options.date.getSeconds() );
				numItems = values.length;
				break;
			case 'year':
				yearlb = 1900;
				yearhb = 2100;
				data = range( yearlb, yearhb );
				current = this.options.date.getFullYear() - yearlb;
				values = range( yearlb, yearhb );
				numItems = values.length;
				break;
			case 'month':
				switch ( pat.length ) {
				case 1:
					values = range( 1, 12 );
					break;
				case 2:
					values = range( 1, 12 ).map( this._makeTwoDigits );
					break;
				case 3:
					values = this._calendar().months.namesAbbr.slice();
					break;
				case 4:
					values = this._calendar().months.names.slice();
					break;
				}
				if ( values.length == 13 ) { // @TODO Lunar calendar support
					if ( values[12] == "" ) { // to remove lunar calendar reserved space
						values.pop();
					}
				}
				data = range( 1, values.length );
				current = this.options.date.getMonth();
				numItems = values.length;
				break;
			case 'day':
				day = this._daysInMonth[ this.options.date.getMonth() ];
				if ( day == 28 ) {
					day += this._isLeapYear( this.options.date.getFullYear() );
				}
				values = range( 1, day );
				if ( pat.length == 2 ) {
					values = values.map( this._makeTwoDigits );
				}
				data = range( 1, day );
				current = this.options.date.getDate() - 1;
				numItems = day;
				break;
			}

			return {
				values: values,
				data: data,
				numItems: numItems,
				current: current
			};

		},

		_showDataSelector: function ( obj, ui, target ) {
			target = $(target);

			var attr = target.attr("class"),
				field = attr ? attr.match(/ui-datefield-([\w]*)/) : undefined,
				pat,
				data,
				values,
				numItems,
				current,
				valuesData,
				html,
				datans,
				$ul,
				$div,
				$ctx,
				$li,
				i,
				newLeft = 10,
				self = this;

			if ( !attr ) {
				return;
			}
			if ( !field ) {
				return;
			}
			if ( this._popup_open ) {
				return;
			}

			target.not('.ui-datefield-seperator').addClass('ui-datefield-selected');

			pat = target.jqmData('pat');
			data = obj._populateDataSelector.call( obj, field[1], pat );

			values = data.values;
			numItems = data.numItems;
			current = data.current;
			valuesData = data.data;

			if ( values ) {
				datans = "data-" + ($.mobile.ns ? ($.mobile.ns + '-') : "") + 'val="';
				for ( i = 0; i < values.length; i++ ) {
					html += '<li><a class="ui-link" ' + datans + valuesData[i] + '">' + values[i] + '</a></li>';
				}

				$ul = $("<ul></ul>");
				$div = $('<div class="ui-datetimepicker-selector" data-transition="fade" data-fade="false"></div>');
				$div.append( $ul ).appendTo( ui );
				$ctx = $div.ctxpopup();
				$ctx.parents('.ui-popupwindow').addClass('ui-datetimepicker');
				$li = $(html);
				$( $li[current] ).addClass("current");
				$div.jqmData( "list", $li );
				$div.circularview();
				if( !obj._reflow ) {
					obj._reflow = function() {
						$div.circularview( "reflow" );
						$div.circularview( 'centerTo', '.current', 0 );
					}
					$(window).bind( "resize" , obj._reflow );
				}
				if( !obj._close ) {
					obj._close = function() {
						$div.trigger( "popupafterclose" );
					}
					$(window).bind( "navigate", obj._close );
				}
				$ctx.popupwindow( 'open',
						target.offset().left + ( target.width() / 2 ) - window.pageXOffset ,
						target.offset().top + target.height() - window.pageYOffset, target.width(), target.height() );

				this.container = $ctx;
				this._popup_open = true;

				$div.bind('popupafterclose', function ( e ) {
					if ( obj._reflow ) {
						$(window).unbind( "resize", obj._reflow );
						obj._reflow = null;
					}

					if ( obj._close ) {
						$(window).unbind( "navigate", obj._close );
						obj._close = null;
					}

					if ( !( target.hasClass("in") || target.hasClass("out") ) ) {
						target.removeClass("ui-datefield-selected");
					}

					$div.unbind( 'popupafterclose' );
					$ul.unbind( 'vclick' );
					$(obj).unbind( 'update' );
					$ctx.popupwindow( 'destroy' );
					$div.remove();

					self._popup_open = false;
				});

				$(obj).bind( 'update', function ( e, val ) {
					var date = new Date( this.options.date ),
						month,
						date_calibration = function () {
							date.setDate( 1 );
							date.setDate( date.getDate() - 1 );
						};

					switch ( field[1] ) {
					case 'min':
						date.setMinutes( val );
						break;
					case 'hour':
						date.setHours( val );
						break;
					case 'sec':
						date.setSeconds( val );
						break;
					case 'year':
						month = date.getMonth();
						date.setFullYear( val );

						if ( date.getMonth() != month ) {
							date_calibration();
						}
						break;
					case 'month':
						date.setMonth( val - 1 );

						if ( date.getMonth() == val ) {
							date_calibration();
						}
						break;
					case 'day':
						date.setDate( val );
						break;
					}

					obj._setDate( date );

					$ctx.popupwindow( 'close' );
				});

				$ul.bind( 'click', function ( e ) {
					if ( $(e.target).is('a') ) {
						$ul.find(".current").removeClass("current");
						$(e.target).parent().addClass('current');
						var val = $(e.target).jqmData("val");
						$(obj).trigger( 'update', val ); // close popup, unselect field
					}
				});

				$div.circularview( 'centerTo', '.current', 500 );
				$div.bind( 'scrollend' , function ( e ) {
					if ( !obj._reflow ) {
						obj._reflow = function () {
							$div.circularview("reflow");
						};
						$(window).bind("resize", obj._reflow);
					}
				});
			}
			return ui;
		}

	});

	$(document).bind("pagecreate create", function ( e ) {
		$($.tizen.datetimepicker.prototype.options.initSelector, e.target)
			.not(":jqmData(role='none'), :jqmData(role='nojs')")
			.datetimepicker();
	});

} ( jQuery, this ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
