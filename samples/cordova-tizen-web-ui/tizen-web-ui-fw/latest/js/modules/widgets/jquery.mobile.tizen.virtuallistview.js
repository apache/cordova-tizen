//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows listview swapping its contents automatically
//>>label: Virtual listview
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	'../jquery.mobile.tizen.core',
	'../jquery.mobile.tizen.scrollview'
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
 *	Author: Wongi Lee <wongi11.lee@samsung.com>
 *	        Youmin Ha <youmin.ha@samsung.com>
 */

/**
 * Virtual List Widget for unlimited data.
 * To support more then 1,000 items, special list widget developed. 
 * Fast initialize and light DOM tree.
 * DB connection and works like DB cursor.
 * 
 * HTML Attributes:
 *
 *		data-role:	virtuallistview
 *		data-template : jQuery.template ID that populate into virtual list 
 *		data-row : Optional. Set number of <li> elements that are used for data handling. 
 *		
 *		ID : <UL> element that has "data-role=virtuallist" must have ID attribute.
 *
 * * APIs:
 *
 *		create ( {
 *				itemData: function ( idx ) { return json_obj; },
 *				numItemData: number or function () { return number; },
 *				cacheItemData: function ( minIdx, maxIdx ) {}
 *				} )
 *			: Create a virtuallist widget. At this moment, _create method is called.
 *			args : A collection of options
 *				itemData: A function that returns JSON object for given index. Mandatory.
 *				numItemData: Total number of itemData. Mandatory.
 *				cacheItemData: Virtuallist will ask itemData between minIdx and maxIdx.
 *				               Developers can implement this function for preparing data.
 *				               Optional.
 *
 * Events:
 *
 *		touchstart : Temporary preventDefault applied on touchstart event to avoid broken screen.
 *
 * Examples:
 *
 *		<script id="tmp-3-2-7" type="text/x-jquery-tmpl">
 *			<li class="ui-li-3-2-7">
 *				<span class="ui-li-text-main">${NAME}</span>
 *				<img src="00_winset_icon_favorite_on.png" class="ui-li-icon-sub">
 *				<span class="ui-li-text-sub">${ACTIVE}</span>
 *				<span class="ui-li-text-sub2">${FROM}</span>
 *			</li>
 *		</script>
 *
 *		<ul id="virtuallist-normal_3_2_7_ul" data-role="virtuallistview" data-template="tmp-3-2-7" data-dbtable="JSON_DATA" data-row="100">
 *		</ul>
 *
 */

/**
	@class VirtualList
	In the Web environment, it is challenging to display a large amount of data in a list, such as displaying a contact list of over 1000 list items. It takes time to display the entire list in HTML and the DOM manipulation is complex.

	The virtual list widget is used to display a list of unlimited data elements on the screen for better performance. This widget provides easy access to databases to retrieve and display data. Virtual lists are based on the jQuery.template plugin as described in the jQuery documentation for jQuery.template plugin.

	To add a virtual list widget to the application, use the following code:

		<script id="tmp-3-2-7" type="text/x-jquery-tmpl">
			<li class="ui-li-3-2-7">
				<span class="ui-li-text-main">${NAME}</span>
				<img src="00_winset_icon_favorite_on.png" class="ui-li-icon-sub"/>
				<span class="ui-li-text-sub">${ACTIVE}</span>
				<span class="ui-li-text-sub2">${FROM}</span>
			</li>
		</script>
		<ul id="vlist" data-role="virtuallistview" data-template="tmp-3-2-7" data-dbtable="JSON_DATA" data-row="100"></ul>
*/
/**
	@property {String} data-role
	Creates the virtual list view. The value must be set to virtuallistview.
	Only the &gt;ul&lt; element, which a id attribute defined, supports this option. Also, the vlLoadSuccess class attribute must be defined in the &gt;ul&lt; element to ensure that loading data from the database is complete.
*/
/**
	@property {String} data-template
	Defines the jQuery.template element ID.
	The jQuery.template must be defined. The template style can use rem units to support scalability.
*/
/**
	@property {Number} data-row
	Defines the number of virtual list child elements.
	The minimum value is 20 and the default value is 100. As the value gets higher, the loading time increases while the system performance improves. So you need to pick a value that provides the best performance without excessive loading time.
*/
/**
	@method create
	@param {function} itemData(index)
	: function itemData(index) returns the JSON object matched with the given index. The index value is between 0 and numItemData-1.
	@param {Number} numItemData
	: number numItemData or function numItemData() defines or returns a static number of items.
	@param {function} cacheItemData(minIndex, maxIndex)
	: function cacheItemData(minIndex, maxIndex) prepares the JSON data. This method is called before calling the itemData() method with index values between minIndex and maxIndex.
*/

(function ( $, undefined ) {

	/* Code for Virtual List Demo */
	var listCountPerPage = {},	/* Keeps track of the number of lists per page UID. This allows support for multiple nested list in the same page. https://github.com/jquery/jquery-mobile/issues/1617 */
		_NO_SCROLL = 0,					/* ENUM */
		_SCROLL_DOWN = 1,				/* ENUM */
		_SCROLL_UP = -1;					/* ENUM */

	$.widget( "tizen.virtuallistview", $.mobile.widget, {
		options: {
			theme: "s",
			countTheme: "s",
			headerTheme: "s",
			dividerTheme: "s",
			splitIcon: "arrow-r",
			splitTheme: "s",
			inset: false,
			id:	"",					/* Virtual list UL elemet's ID */
			childSelector: " li",	/* To support swipe list */
			dbtable: "",
			template : "",
			dbkey: false,			/* Data's unique Key */
			scrollview: false,
			row: 100,
			page_buf: 30,
			initSelector: ":jqmData(role='virtuallistview')"
		},

		_stylerMouseUp: function () {
			$( this ).addClass( "ui-btn-up-s" );
			$( this ).removeClass( "ui-btn-down-s" );
		},

		_stylerMouseDown: function () {
			$( this ).addClass( "ui-btn-down-s" );
			$( this ).removeClass( "ui-btn-up-s" );
		},

		_stylerMouseOver: function () {
			$( this ).toggleClass( "ui-btn-hover-s" );
		},

		_stylerMouseOut: function () {
			$( this ).toggleClass( "ui-btn-hover-s" );
			$( this ).addClass( "ui-btn-up-s" );
			$( this ).removeClass( "ui-btn-down-s" );
		},

		// ?
		// this		virtuallistview object
		// @param[in]	template	template name(string)
		_pushData: function ( template ) {
			var o = this.options,
				i,
				myTemplate = $( "#" + template ),	// Get template object
				// NOTE: o.row = # of rows handled at once. Default value is 100.
				lastIndex = ( o.row > this._numItemData ? this._numItemData : o.row ),	// last index of handled data
				htmlData;

			for ( i = 0; i < lastIndex; i++ ) {
				htmlData = myTemplate.tmpl( this._itemData( i ) );	// Make rows with template,
				$( o.id ).append( $( htmlData ).attr( 'id', o.itemIDPrefix + i ) );	// and append it to the vlist object
			}

			// After pushing data re-style virtuallist widget
			$( o.id ).trigger( "create" );
		},

		// Set children <li> elements' position
		//
		// this: virtuallist element
		// event: virtuallistview.options
		//		TODO: Why this arg name is 'event'? Not resonable.
		//		(this function is not called with event element as args!)
		_reposition: function ( event ) {
			var o,
				t = this,
				padding,
				margin;

			if ( event.data ) {
				o = event.data;
			} else {
				o = event;
			}
			if ( $( o.id + o.childSelector ).size() > 0 ) { // $("#vlistid li")
				// first child's top position
				// NOTE: the first element may not be '0'!!!
				t._title_h = $( o.id + o.childSelector + ':first' ).position().top;
				// first child's outer height (TODO: reuse selected items)
				t._line_h = $( o.id + o.childSelector + ':first' ).outerHeight();

				// container(vlist element)'s innerwidth
				t._container_w = $( o.id ).innerWidth();

				// get sum of container's left/right padding
				padding = parseInt( $( o.id + o.childSelector ).css( "padding-left" ), 10 )
					+ parseInt( $( o.id + o.childSelector ).css( "padding-right" ), 10 );

				// Add CSS to all <li> elements
				//	* absolute position
				//	* btn-up
				//	* mouse up/down/over/out styles
				$( o.id + ">" + o.childSelector )
					.addClass( "position_absolute" )
					.addClass( "ui-btn-up-s" )
					.bind( "mouseup", t._stylerMouseUp )
					.bind( "mousedown", t._stylerMouseDown )
					.bind( "mouseover", t._stylerMouseOver )
					.bind( "mouseout", t._stylerMouseOut );
			}

			// Set absolute top/left position of each <li>
			$( o.id + ">" + o.childSelector ).each( function ( index ) {
				margin = parseInt( $( this ).css( "margin-left" ), 10 )
					+ parseInt( $( this ).css( "margin-right" ), 10 );

				$( this ).css( "top", t._title_h + t._line_h * index + 'px' )
					.css( "width", t._container_w - padding - margin );
			} );

			// Set Max Listview Height
			$( o.id ).height( t._numItemData * t._line_h );
		},

		// Resize each listitem's width
		_resize: function ( event ) {
			var o,	// 'ul'
				t = this,
				li,
				padding,
				margin;

			if ( event.data ) {
				o = event.data;
			} else {
				o = event;
			}
			li = $( o ).children( o.childSelector )

			t._container_w = $( o ).width();

			padding = parseInt( li.css( "padding-left" ), 10 )
				+ parseInt( li.css( "padding-right" ), 10 );

			li.each( function ( index, obj ) {
				margin = parseInt( $( this ).css( "margin-left" ), 10 )
					+ parseInt( $( this ).css( "margin-right" ), 10 );
				$( this ).css( "width", t._container_w - padding - margin );
			} );
		},

		// New scrollmove function supporting scrollTo
		_scrollmove: function ( ev ) {
			var t = ev.data,	// vlist (JQM object)
				o = t.options,	// options
				prevTopBufLen = t._num_top_items,	// Previous(remembered) top buf length
				timerInterval = 100,
				i,
				_scrollView,
				_normalScroll;

			_scrollView = {
				viewTop: function ( ) {
					var sv = $( o.id ).parentsUntil( ".ui-page" ).find( ".ui-scrollview-view" ),
						svTrans = sv.css( "-webkit-transform" ),
						svTransVal = "0,0,0,0,0,0";
					if ( svTrans ) {
						svTransVal = svTrans.replace( /matrix\s*\((.*)\)/, "$1" );	// matrix(a,c,b,d,tx,ty)
					}
					return - parseInt( svTransVal.split(',')[5], 10 );
				}
			};
			_normalScroll = {
				viewTop: function ( ) {
					return $( window ).scrollTop( );	// TODO: - _line_h?
				}
			};
			// Get current view top position
			function viewTop ( ) {
				return o.scrollview ? _scrollView.viewTop() : _normalScroll.viewTop();
			}
			// log function for debug
			function log ( msg ) {
				var debug = false;
				if ( debug ) {
					console.log( ">>virtualllist: " + msg );
				}
			}

			// Timer interval function
			// @param[in]	vl	virtuallist object (JQM object)
			function timerMove ( vl, undefined ) {
				var cy,				// current y position
					cti,		// current top idx
					cbi,		// current bottom idx
					oti = vl._first_index,	// old top idx
					obi = vl._last_index,	// old botton idx
					dti,			// delta of top idx
					fromIdx,
					toIdx,	// index range to be moved
					delta,			// moveItem delta
					rowLen = vl.options.row,	// max. # of items handled at once
					bufSize,		// top/bottom buffer size. unit: # of items
					i;

				// subroutine: Move itemContents in i2 into i1
				function moveItemContents( vl, i1, i2 ) {
					// TODO: Find a efficient way to replace data!
					// Assumption: i1 and i2 has same children.
					var NODETYPE = { ELEMENT_NODE: 1, TEXT_NODE: 3 },
						c1,	// child item 1 (old)
						c2,	// child item 2 (new)
						newText,
						newImg,
						i;

					$( i1 ).find( ".ui-li-text-main", ".ui-li-text-sub", ".ui-li-text-sub2", "ui-btn-text" ).each( function ( index ) {
						c1 = $( this );
						newText = $( i2 ).find( ".ui-li-text-main", ".ui-li-text-sub", "ui-btn-text" ).eq( index ).text();

						$( c1 ).contents().filter( function () {
							return ( this.nodeType == NODETYPE.TEXT_NODE );
						} ).get( 0 ).data = newText;
					} );

					$( i1 ).find( "img" ).each( function ( imgIdx ) {
						var c1 = $( this );
						newImg = $( i2 ).find( "img" ).eq( imgIdx ).attr( "src" );

						$( c1 ).attr( "src", newImg );
					} );

					$( i1 ).removeData( );	// Clear old data
				}

				// subroutine: Move item
				function moveItem( vl, fromIdx, toIdx ) {
					var itemData,	// data from itemData()
						item,		// item element
						newItem,	// new item element
						tmpl;		// template

					log( ">> move item: " + fromIdx + " --> " + toIdx );

					// Find current item
					item = $( '#' + vl.options.itemIDPrefix + fromIdx );	// TODO: refactor ID generation!
					if ( ! item || ! item.length ) {
						return false;
					}

					// Get new item
					tmpl = $( "#" + vl.options.template );
					if ( tmpl ) {
						newItem = tmpl.tmpl( vl._itemData( toIdx ) );

						// TODO: Consider touch block while moving?

						// Move item contents
						moveItemContents( vl, item, newItem );

						// clean up temporary item
						newItem.remove();
					}

					// Move position, and set id
					item.css( 'top', toIdx * vl._line_h )
						.attr( 'id' , vl.options.itemIDPrefix + toIdx );	// TODO: refactor ID generation!

					// TODO: Apply jqmdata? check following old code;
					// $( oldItem ).removeData( );	// Clear old data
					// if (key) { $( oldItem ).data( key, $( newItem ).data( key ) ); }

					return true;
				}


				// Get current view position
				cy = viewTop();

				// Calculate bufSize: rowLen / 3
				// NOTE: Assumption: total row length = visible items * 3 (upper+visible+lower)
				bufSize = Math.ceil( rowLen / 3 );

				// Calculate current top/bottom index (to be applied)
				// top index = current position / line height
				cti = Math.floor( cy / vl._line_h ) - bufSize;	// TODO: consider buffer!
				cbi = cti + rowLen - 1;

				if ( cti < 0 ) {		// Top boundary check
					cbi += ( - cti );
					cti = 0;
				} else if ( cbi > ( vl._numItemData - 1 ) ) {		// Bottom boundary check
					cti -= ( cbi - ( vl._numItemData - 1 ) );
					cbi = ( vl._numItemData - 1 );
				}

				// Calculate dti
				dti = cti - oti;
				log( "cy=" + cy + ", oti=" + oti + ", obi=" + obi + ", cti=" + cti + ", cbi=" + cbi + ", dti=" + dti );

				// switch: dti = 0 --> timer stop condition: delta=0 or scrollstop event comes. END.
				if ( 0 == dti ) {
					// Check timer runtime
					vl.timerStillCount += 1;
					if ( vl.timerStillCount < 12 ) {	// check count ( TODO: test and adjust )
						log("dti=0 " + vl.timerStillCount + " times");
						vl.timerMoveID = setTimeout( timerMove, timerInterval, vl );	// run once more
						return;
					}

					log("dti=0 " + vl.timerStillCount + " times. End timer.");
					vl.timerStillCount = 0;
					// Stop timer
					if ( vl.timerMoveID ) {
						clearTimeout( vl.timerMoveID );
						vl.timerMoveID = null;
					}
				} else {
					// switch: dti >= # of max elements --> total replace.
					vl.timerStillCount = 0;		// Reset still counter

					if ( Math.abs( dti ) >= rowLen ) {
						fromIdx = oti;
						toIdx = obi;
						delta = dti;
						log( ">>> WHOLE CHANGE! delta=" + delta );
					} else {
						// switch: dti < # of max elements --> move t2b or b2t until new top/bottom idx is covered
						if ( dti > 0 ) {
							fromIdx = oti;
							toIdx = oti + dti - 1;
							delta = rowLen;
						} else {
							fromIdx = obi + dti + 1;	// dti < 0
							toIdx = obi;
							delta = -rowLen;
						}
						log( ">>> partial change. delta=" + delta );
					}

					// Move items
					for ( i = fromIdx; i <= toIdx; i++ ) {
						moveItem( vl, i, i + delta );		// Change data and position
					}

					// Store current top/bottom idx into vl
					vl._first_index = cti;
					vl._last_index = cbi;

					// Register timer to check again
					vl.timerMoveID = setTimeout( timerMove, timerInterval, vl );
				}
				return;	// End of function
			}

			// ==== function start ====

			t.timerStillCount = 0;	// Count do-nothing time.	For behavior tuning.

			// If a timer function is alive, clear it
			if ( t.timerMoveID ) {
				clearTimeout( t.timerMoveID );
				t.timerMoveID = null;
			}
			// run TimerMove()
			timerMove( t );
		},

		_recreate: function ( newArray ) {
			var t = this,
				o = this.options;

			$( o.id ).empty();

			t._numItemData = newArray.length;
			t._direction = _NO_SCROLL;
			t._first_index = 0;
			t._last_index = o.row - 1;

			t._pushData( o.template );

			if (o.childSelector == " ul" ) {
				$( o.id + " ul" ).swipelist();
			}

			$( o.id ).virtuallistview();

			t.refresh( true );

			t._reposition( o );
		},

		// Init virtuallistview
		// this		virtuallistview object
		_initList: function () {
			var t = this,
				o = this.options;

			/* After AJAX loading success */

			// Put initial <li> elements
			t._pushData( o.template );

			// find a parent page, and run _reposition() at 'pageshow' event
			// TODO: Consider replace parentsUntil().parent() to parent('.ui-page') ???
			$( o.id ).parentsUntil( ".ui-page" ).parent().one( "pageshow", function () {
				setTimeout( function () {
					t._reposition( o );
				}, 0);
			});

			// Bind _scrollmove() at 'scrollstart.virtuallist' event
			$( document ).bind( "scrollstart.virtuallist scrollstop.vrituallist", t, t._scrollmove );

			// Bind _resize()
			$( window ).on( "throttledresize", $( o.id ), t._resize );

			// when ul is a childselector, assume that this is also a swipelist,
			// and run swipelist constructor
			if ( o.childSelector == " ul" ) {
				$( o.id + " ul" ).swipelist();
			}

			t.refresh( true );
		},

		create: function () {
			var o = this.options;

			/* external API for AJAX callback */
			this._create.apply( this, arguments );

			// TODO: remove this line? _initList() calls reposition...
			this._reposition( o );
		},

		_create: function ( args ) {
			// Extend instance variables
			$.extend( this, {
				_itemData : function ( idx ) { return null; },
				_numItemData : 0,
				_cacheItemData : function ( minIdx, maxIdx ) { },
				_title_h : 0,
				_container_w : 0,
				_minimum_row : 100,
				_direction : _NO_SCROLL,
				_first_index : 0,
				_last_index : 0,
				_num_top_items : 0	// By scroll move, number of hidden elements.
			} );

			// local variables
			var t = this,
				o = this.options,
				$el = this.element,
				shortcutsContainer = $('<div class="ui-virtuallist"/>'),
				shortcutsList = $('<ul></ul>'),
				dividers = $el.find(':jqmData(role="virtuallistview" )'),
				lastListItem = null,
				shortcutscroll = this,
				dbtable_name,
				dbtable;


			// Add CSS classes to $el (=virtuallistview)
			$el.addClass( function ( i, orig ) {
				return orig + " ui-listview ui-virtual-list-container" + ( t.options.inset ? " ui-listview-inset ui-corner-all ui-shadow " : "" );
			});

			// keep the vlist's ID
			o.itemIDPrefix = $el.attr( "id" ) + '_';
			o.id = "#" + $el.attr( "id" );

			// when page hides, empty all child elements
			$( o.id ).bind( "pagehide", function ( e ) {
				$( o.id ).empty();
			});

			// Find if scrollview is used
			if ( $( ".ui-scrollview-clip" ).size() > 0 ) {
				o.scrollview = true;
			} else {
				o.scrollview = false;
			}

			// Calculate page buffer size
			if ( $el.data( "row" ) ) {
				o.row = $el.data( "row" );

				if ( o.row < t._minimum_row ) {
					o.row = t._minimum_row;
				}

				o.page_buf = parseInt( ( o.row / 2 ), 10 );
			}

			// Get arguments
			if ( args ) {
				if ( args.itemData && typeof args.itemData == 'function'  ) {
					t._itemData = args.itemData;
				} else {
					return;
				}
				if ( args.numItemData ) {
					if ( typeof args.numItemData == 'function' ) {
						t._numItemData = args.numItemData( );
					} else if ( typeof args.numItemData == 'number' ) {
						t._numItemData = args.numItemData;
					} else {
						return;
					}
				} else {
					return;
				}
			} else {	// No option is given
				// Legacy support: dbtable
				console.warn( "WARNING: The data interface of virtuallist is changed. \nOld data interface(data-dbtable) is still supported, but will be removed in next version. \nPlease fix your code soon!" );

				/* After DB Load complete, Init Vritual list */
				if ( $( o.id ).hasClass( "vlLoadSuccess" ) ) {
					dbtable_name = $el.jqmData('dbtable');
					dbtable = window[ dbtable_name ];

					$( o.id ).empty();

					if ( !dbtable ) {
						dbtable = { };
					}

					t._itemData = function ( idx ) {
						return dbtable[ idx ];
					};
					t._numItemData = dbtable.length;
				} else {
					return;	// Do nothing
				}
			}

			// Get template data
			if ( $el.data( "template" ) ) {
				o.template = $el.data( "template" );

				/* to support swipe list, <li> or <ul> can be main node of virtual list. */
				if ( $el.data( "swipelist" ) == true ) {
					o.childSelector = " ul";
				} else {
					o.childSelector = " li";
				}
			}

			// Set data's unique key
			// NOTE: Unnecessary?
			if ( $el.data( "dbkey" ) ) {
				o.dbkey = $el.data( "dbkey" );
			}

			t._first_index = 0;			// initial top idx of <li> element.
			t._last_index = o.row - 1;		// initial bottom idx of <li> element.
			t._initList();	// NOTE: Called at here only!
		},

		destroy : function () {
			var o = this.options;

			$( document ).unbind( "scrollstop" );

			$( window ).off( "throttledresize", this._resize );

			$( o.id ).empty();

			if ( this.timerMoveID ) {
				clearTimeout( this.timerMoveID );
				this.timerMoveID = null;
			}
		},

		_itemApply: function ( $list, item ) {
			var $countli = item.find( ".ui-li-count" );

			if ( $countli.length ) {
				item.addClass( "ui-li-has-count" );
			}

			$countli.addClass( "ui-btn-up-" + ( $list.jqmData( "counttheme" ) || this.options.countTheme ) + " ui-btn-corner-all" );

			// TODO class has to be defined in markup
			item.find( "h1, h2, h3, h4, h5, h6" ).addClass( "ui-li-heading" ).end()
				.find( "p, dl" ).addClass( "ui-li-desc" ).end()
				.find( ">img:eq(0), .ui-link-inherit>img:eq(0)" ).addClass( "ui-li-thumb" ).each( function () {
					item.addClass( $( this ).is( ".ui-li-icon" ) ? "ui-li-has-icon" : "ui-li-has-thumb" );
				}).end()
				.find( ".ui-li-aside" ).each(function () {
					var $this = $( this );
					$this.prependTo( $this.parent() ); //shift aside to front for css float
				} );
		},

		_removeCorners: function ( li, which ) {
			var top = "ui-corner-top ui-corner-tr ui-corner-tl",
				bot = "ui-corner-bottom ui-corner-br ui-corner-bl";

			li = li.add( li.find( ".ui-btn-inner, .ui-li-link-alt, .ui-li-thumb" ) );

			if ( which === "top" ) {
				li.removeClass( top );
			} else if ( which === "bottom" ) {
				li.removeClass( bot );
			} else {
				li.removeClass( top + " " + bot );
			}
		},

		_refreshCorners: function ( create ) {
			var $li,
				$visibleli,
				$topli,
				$bottomli;

			if ( this.options.inset ) {
				$li = this.element.children( "li" );
				// at create time the li are not visible yet so we need to rely on .ui-screen-hidden
				$visibleli = create ? $li.not( ".ui-screen-hidden" ) : $li.filter( ":visible" );

				this._removeCorners( $li );

				// Select the first visible li element
				$topli = $visibleli.first()
					.addClass( "ui-corner-top" );

				$topli.add( $topli.find( ".ui-btn-inner" ) )
					.find( ".ui-li-link-alt" )
						.addClass( "ui-corner-tr" )
					.end()
					.find( ".ui-li-thumb" )
						.not( ".ui-li-icon" )
						.addClass( "ui-corner-tl" );

				// Select the last visible li element
				$bottomli = $visibleli.last()
					.addClass( "ui-corner-bottom" );

				$bottomli.add( $bottomli.find( ".ui-btn-inner" ) )
					.find( ".ui-li-link-alt" )
						.addClass( "ui-corner-br" )
					.end()
					.find( ".ui-li-thumb" )
						.not( ".ui-li-icon" )
						.addClass( "ui-corner-bl" );
			}
			this.element.trigger( "updatelayout" );
		},

		// this		virtuallistview object
		refresh: function ( create ) {
			this.parentPage = this.element.closest( ".ui-page" );
			// Make sub page, and move the virtuallist into it...
			// NOTE: check this subroutine.
			this._createSubPages();

			var o = this.options,
				$list = this.element,
				self = this,
				dividertheme = $list.jqmData( "dividertheme" ) || o.dividerTheme,
				listsplittheme = $list.jqmData( "splittheme" ),
				listspliticon = $list.jqmData( "spliticon" ),
				li = $list.children( "li" ),
				counter = $.support.cssPseudoElement || !$.nodeName( $list[ 0 ], "ol" ) ? 0 : 1,
				item,
				itemClass,
				temTheme,
				a,
				last,
				splittheme,
				countParent,
				icon,
				pos,
				numli,
				itemTheme;

			// TODO: ?
			if ( counter ) {
				$list.find( ".ui-li-dec" ).remove();
			}

			for ( pos = 0, numli = li.length; pos < numli; pos++ ) {
				item = li.eq( pos );
				itemClass = "ui-li";

				// If we're creating the element, we update it regardless
				if ( create || !item.hasClass( "ui-li" ) ) {
					itemTheme = item.jqmData( "theme" ) || o.theme;
					a = item.children( "a" );

					if ( a.length ) {
						icon = item.jqmData( "icon" );

						item.buttonMarkup({
							wrapperEls: "div",
							shadow: false,
							corners: false,
							iconpos: "right",
							/* icon: a.length > 1 || icon === false ? false : icon || "arrow-r",*/
							icon: false,	/* Remove unnecessary arrow icon */
							theme: itemTheme
						});

						if ( ( icon != false ) && ( a.length == 1 ) ) {
							item.addClass( "ui-li-has-arrow" );
						}

						a.first().addClass( "ui-link-inherit" );

						if ( a.length > 1 ) {
							itemClass += " ui-li-has-alt";

							last = a.last();
							splittheme = listsplittheme || last.jqmData( "theme" ) || o.splitTheme;

							last.appendTo(item)
								.attr( "title", last.getEncodedText() )
								.addClass( "ui-li-link-alt" )
								.empty()
								.buttonMarkup({
									shadow: false,
									corners: false,
									theme: itemTheme,
									icon: false,
									iconpos: false
								})
								.find( ".ui-btn-inner" )
								.append(
									$( "<span />" ).buttonMarkup({
										shadow: true,
										corners: true,
										theme: splittheme,
										iconpos: "notext",
										icon: listspliticon || last.jqmData( "icon" ) || o.splitIcon
									})
								);
						}
					} else if ( item.jqmData( "role" ) === "list-divider" ) {

						itemClass += " ui-li-divider ui-btn ui-bar-" + dividertheme;
						item.attr( "role", "heading" );

						//reset counter when a divider heading is encountered
						if ( counter ) {
							counter = 1;
						}

					} else {
						itemClass += " ui-li-static ui-body-" + itemTheme;
					}
				}

				if ( counter && itemClass.indexOf( "ui-li-divider" ) < 0 ) {
					countParent = item.is( ".ui-li-static:first" ) ? item : item.find( ".ui-link-inherit" );

					countParent.addClass( "ui-li-jsnumbering" )
						.prepend( "<span class='ui-li-dec'>" + (counter++) + ". </span>" );
				}

				item.add( item.children( ".ui-btn-inner" ) ).addClass( itemClass );

				self._itemApply( $list, item );
			}

			this._refreshCorners( create );
		},

		//create a string for ID/subpage url creation
		_idStringEscape: function ( str ) {
			return str.replace(/\W/g , "-");
		},

		// ?
		// this		virtuallistview object
		_createSubPages: function () {
			var parentList = this.element,
				parentPage = parentList.closest( ".ui-page" ),
				parentUrl = parentPage.jqmData( "url" ),
				parentId = parentUrl || parentPage[ 0 ][ $.expando ],
				parentListId = parentList.attr( "id" ),
				o = this.options,
				dns = "data-" + $.mobile.ns,
				self = this,
				persistentFooterID = parentPage.find( ":jqmData(role='footer')" ).jqmData( "id" ),
				hasSubPages,
				newRemove;

			if ( typeof listCountPerPage[ parentId ] === "undefined" ) {
				listCountPerPage[ parentId ] = -1;
			}

			parentListId = parentListId || ++listCountPerPage[ parentId ];

			$( parentList.find( "li>ul, li>ol" ).toArray().reverse() ).each(function ( i ) {
				var self = this,
					list = $( this ),
					listId = list.attr( "id" ) || parentListId + "-" + i,
					parent = list.parent(),
					nodeEls,
					title = nodeEls.first().getEncodedText(),//url limits to first 30 chars of text
					id = ( parentUrl || "" ) + "&" + $.mobile.subPageUrlKey + "=" + listId,
					theme = list.jqmData( "theme" ) || o.theme,
					countTheme = list.jqmData( "counttheme" ) || parentList.jqmData( "counttheme" ) || o.countTheme,
					newPage,
					anchor;

				nodeEls = $( list.prevAll().toArray().reverse() );
				nodeEls = nodeEls.length ? nodeEls : $( "<span>" + $.trim( parent.contents()[ 0 ].nodeValue ) + "</span>" );

				//define hasSubPages for use in later removal
				hasSubPages = true;

				newPage = list.detach()
							.wrap( "<div " + dns + "role='page' " +	dns + "url='" + id + "' " + dns + "theme='" + theme + "' " + dns + "count-theme='" + countTheme + "'><div " + dns + "role='content'></div></div>" )
							.parent()
								.before( "<div " + dns + "role='header' " + dns + "theme='" + o.headerTheme + "'><div class='ui-title'>" + title + "</div></div>" )
								.after( persistentFooterID ? $( "<div " + dns + "role='footer' " + dns + "id='" + persistentFooterID + "'>" ) : "" )
								.parent()
								.appendTo( $.mobile.pageContainer );

				newPage.page();

				anchor = parent.find('a:first');

				if ( !anchor.length ) {
					anchor = $( "<a/>" ).html( nodeEls || title ).prependTo( parent.empty() );
				}

				anchor.attr( "href", "#" + id );

			}).virtuallistview();

			// on pagehide, remove any nested pages along with the parent page, as long as they aren't active
			// and aren't embedded
			if ( hasSubPages &&
						parentPage.is( ":jqmData(external-page='true')" ) &&
						parentPage.data( "page" ).options.domCache === false ) {

				newRemove = function ( e, ui ) {
					var nextPage = ui.nextPage, npURL;

					if ( ui.nextPage ) {
						npURL = nextPage.jqmData( "url" );
						if ( npURL.indexOf( parentUrl + "&" + $.mobile.subPageUrlKey ) !== 0 ) {
							self.childPages().remove();
							parentPage.remove();
						}
					}
				};

				// unbind the original page remove and replace with our specialized version
				parentPage
					.unbind( "pagehide.remove" )
					.bind( "pagehide.remove", newRemove );
			}
		},

		// TODO sort out a better way to track sub pages of the virtuallistview this is brittle
		childPages: function () {
			var parentUrl = this.parentPage.jqmData( "url" );

			return $( ":jqmData(url^='" +  parentUrl + "&" + $.mobile.subPageUrlKey + "')" );
		}
	});

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.virtuallistview.prototype.options.initSelector, e.target ).virtuallistview();
	});

} ( jQuery ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
