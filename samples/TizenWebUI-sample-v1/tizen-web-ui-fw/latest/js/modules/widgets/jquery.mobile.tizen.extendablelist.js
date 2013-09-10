//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Listview which can be extended more and more
//>>label: Extendable list
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	'../jquery.mobile.tizen.scrollview',
	'libs/jquery.tmpl'
	], function ( jQuery ) {

//>>excludeEnd("jqmBuildExclude");

/****************************************************************************
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
*/

/**
 *	Extendable List Widget for unlimited data.
 *	To support more then 1,000 items, special list widget developed.
 *	Fast initialize and append some element into the DOM tree repeatedly.
 *	DB connection and works like DB cursor.
 *
 * HTML Attributes:
 *
 *		data-role:	extendablelist
 *		data-template : jQuery.template ID that populate into extendable list. A button : a <DIV> element with "data-role : button" should be included on data-template.
 *		data-dbtable : DB Table name. It used as window[DB NAME]. Loaded data should be converted as window object.
 *		data-extenditems : Number of elements to extend at once.
 *		
 *		ID : <UL> element that has "data-role=extendablelist" must have ID attribute.
 *		Class : <UL> element that has "data-role=extendablelist" should have "vlLoadSuccess" class to guaranty DB loading is completed.
 *		tmp_load_more : Template ID for "load more" message and button.
 *
 *
 *APIs:
 *		create ( {
 *				itemData: function ( idx ) { return json_obj; },
 *				numItemData: number or function () { return number; },
 *				cacheItemData: function ( minIdx, maxIdx ) {}
 *				} )
 *			: Create a extendable list widget. At this moment, _create method is called.
 *			args : A collection of options
 *				itemData: A function that returns JSON object for given index. Mandatory.
 *				numItemData: Total number of itemData. Mandatory.
 *				cacheItemData: Extendable list will ask itemData between minIdx and maxIdx.
 *				    Developers can implement this function for preparing data.
 *				    Optional.
 *
 *Examples:
 *
 *		<script id="tmp-3-1-1" type="text/x-jquery-tmpl">
 *			<li class="ui-li-3-1-1"><span class="ui-li-text-main">${NAME}</span></li>
 *		</script>
 *
 *		<script id="tmp_load_more" type="text/x-jquery-tmpl"> 
 *			<li class="ui-li-3-1-1" style="text-align:center; margin:0 auto">
 *				<div data-role="button">Load ${NUM_MORE_ITEMS} more items</div>
 *			</li>
 *		</script>
 *	
 *		<ul id = "extendable_list_main" data-role="extendablelist" data-extenditems="50" data-template="tmp-3-1-1">
 *		</ul>
 *
 */

/**
	@class Extendablelist
	In the Web environment, it is challenging to display a large amount of data in a list, such as displaying a contact list of over 1000 list items. It takes time to display the entire list in HTML and the DOM manipulation is complex.
	The extendable list widget is used to display a list of unlimited data elements on the screen for better performance. The list is extended if you click the button at the bottom of the list to load more data elements. Extendable lists are based on the jQuery.template plugin as described in the jQuery documentation for jQuery.template plugin.<br/>
	To add a extendable list widget to the application, use the following code:

			<script id="tmp-3-1-1" type="text/x-jquery-tmpl">
				<li class="ui-li-3-1-1"><span class="ui-li-text-main">${NAME}</span></li>
			</script>
			<script id="tmp_load_more" type="text/x-jquery-tmpl">
				<li class="ui-li-3-1-1" style="text-align:center; margin:0 auto">
				<div data-role="button">Load ${NUM_MORE_ITEMS} more items</div>
				</li>
			</script>
			<ul id="extendable_list_main" data-role="extendablelist" data-extenditems="50" data-template="tmp-3-1-1">
			</ul>
*/
/**
	@property {String} data-role
	Creates the extendable list view. The value must be set to extendablelist. Only the &lt;ul&gt; element, which a id attribute defined, supports this option. Also, the elLoadSuccess class attribute must be defined in the &lt;ul&gt; element to ensure that loading data from the database is complete.
*/
/**
	@property {String} data-template
	Specifies the jQuery.template element ID. The jQuery.template must be defined. The template style can use rem units to support scalability. For using the button at the bottom of the list to load more data elements, there must be list view template with the button. The attribute ID must be tmp_load_more.
*/
/**
	@property {Integer} data-extenditems
	Defines the number of data elements to be extended at a time.
*/
( function ( $, undefined ) {

	//Keeps track of the number of lists per page UID
	//This allows support for multiple nested list in the same page
	//https://github.com/jquery/jquery-mobile/issues/1617
	var listCountPerPage = {};

	$.widget( "tizen.extendablelist", $.mobile.widget, {
		options: {
			theme: "s",
			countTheme: "c",
			headerTheme: "b",
			dividerTheme: "b",
			splitIcon: "arrow-r",
			splitTheme: "b",
			inset: false,
			id:	"",						/* Extendable list UL elemet's ID */
			extenditems: 50,			/* Number of append items */
			childSelector: " li",		/* To support swipe list */
			dbtable: "",
			template : "",				/* Template for each list item */
			loadmore : "tmp_load_more",	/* Template for "Load more" message */
			scrollview: false,
			initSelector: ":jqmData(role='extendablelist')"
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

		_pushData: function ( template ) {
			var o = this.options,
				t = this,
				i = 0,
				myTemplate = $( "#" + template ),
				loadMoreItems = ( o.extenditems > t._numItemData - t._lastIndex ? t._numItemData - t.lastIndex : o.extenditems ),
				htmlData;

			for (i = 0; i < loadMoreItems; i++ ) {
				htmlData = myTemplate.tmpl( t._itemData( i ) );
				$( o.id ).append( $( htmlData ).attr( 'id', 'li_' + i ) );

				/* Add style */
				$( o.id + ">" + o.childSelector )
					.addClass( "ui-btn-up-s" )
					.bind( "mouseup", t._stylerMouseUp )
					.bind( "mousedown", t._stylerMouseDown )
					.bind( "mouseover", t._stylerMouseOver )
					.bind( "mouseout", t._stylerMouseOut );

				t._lastIndex += 1;
			}

			/* After push data, re-style extendable list widget */
			$( o.id ).trigger( "create" );
		},

		_loadmore: function ( event ) {
			var t = event.data,	// <li> element
				o = t.options,
				i = 0,
				myTemplate = $( "#" + o.template ),
				loadMoreItems = ( o.extenditems > t._numItemData - t._lastIndex ? t._numItemData - t._lastIndex : o.extenditems ),
				htmlData,
				more_items_to_load,
				num_next_load_items;

			/* Remove load more message */
			$( "#load_more_message" ).remove();

			/* Append More Items */
			for ( i = 0; i < loadMoreItems; i++ ) {
				htmlData = myTemplate.tmpl( t._itemData( t._lastIndex ) );
				$( o.id ).append( $( htmlData ).attr( 'id', 'li_' + t._lastIndex ) );
				t._lastIndex += 1;
			}

			/* Append "Load more" message on the last of list */
			if ( t._numItemData > t._lastIndex ) {
				myTemplate = $( "#" + o.loadmore );
				more_items_to_load = t._numItemData - t._lastIndex;
				num_next_load_items = ( o.extenditems <= more_items_to_load ) ? o.extenditems : more_items_to_load;
				htmlData = myTemplate.tmpl( { NUM_MORE_ITEMS : num_next_load_items } );
				// Button minimum height(37px)
				$( o.id ).append( $( htmlData ).attr( 'id', "load_more_message" ).css( 'min-height' , "37px") );
			}

			$( o.id ).trigger( "create" );
			$( o.id ).extendablelist( "refresh" );
		},

		recreate: function ( newArray ) {
			this._create( {
				itemData: function ( idx ) { return newArray[ idx ]; },
				numItemData: newArray.length
			} );
		},

		_initList: function (args ) {
			var t = this,
				o = this.options,
				myTemplate,
				more_items_to_load,
				num_next_load_items,
				htmlData;

			/* Make Gen list by template */
			if ( t._lastIndex <= 0 ) {
				t._pushData( o.template );

				/* Append "Load more" message on the last of list */
				if ( t._numItemData > t._lastIndex ) {
					myTemplate = $( "#" + o.loadmore );
					more_items_to_load = t._numItemData - t._lastIndex;
					num_next_load_items = ( o.extenditems <= more_items_to_load) ? o.extenditems : more_items_to_load;
					htmlData = myTemplate.tmpl( { NUM_MORE_ITEMS : num_next_load_items } );
					// Button minimum height(37px)
					$( o.id ).append( $( htmlData ).attr( 'id', "load_more_message" ).css( 'min-height' , "37px") );

					$( "#load_more_message" ).live( "click", t, t._loadmore );
				} else {
					/* No more items to load */
					$( "#load_more_message" ).die();
					$( "#load_more_message" ).remove();
				}
			}

			if ( o.childSelector == " ul" ) {
				$( o.id + " ul" ).swipelist();
			}

			$( o.id ).trigger( "create" );

			t.refresh( true );
		},

		create: function () {
			var o = this.options;

			/* external API for AJAX callback */
			this._create.apply( this, arguments );
		},

		_create: function ( args ) {
			var t = this,
				o = this.options,
				$el = this.element,
				dbtable_name;


			t.destroy();

			$.extend(this, {
				_itemData: function ( idx ) { return null; },
				_numItemData: 0,
				_cacheItemData: function ( minIdx, maxIdx ) { },
				_lastIndex: 0
			});


			// create listview markup
			t.element.addClass( function ( i, orig ) {
				return orig + " ui-listview ui-extendable-list-container" + ( t.options.inset ? " ui-listview-inset ui-corner-all ui-shadow " : "" );
			});

			o.id = "#" + $el.attr( "id" );

			if ( $el.data( "extenditems" ) ) {
				o.extenditems = parseInt( $el.data( "extenditems" ), 10 );
			}

			$( o.id ).bind( "pagehide", function (e) {
				$( o.id ).empty();
			});

			/* Scroll view */
			if ( $( ".ui-scrollview-clip" ).size() > 0) {
				o.scrollview = true;
			} else {
				o.scrollview = false;
			}

			if ( args ) {
				if ( !t._loadData( args ) ) {
					return;
				}
			} else {
				// Legacy support: dbtable
				console.warn("WARNING: The data interface of extendable list is changed. \nOld data interface(data-dbtable) is still supported, but will be removed in next version. \nPlease fix your code soon!");

				if ( $( o.id ).hasClass( "elLoadSuccess" ) ) {
					dbtable_name = $el.jqmData('dbtable');
					o.dbtable = window[ dbtable_name ];
					if ( !(o.dbtable) ) {
						o.dbtable = { };
					}
					t._itemData = function ( idx ) {
						return o.dbtable[ idx ];
					};
					t._numItemData = o.dbtable.length;

				} else {
					console.warn("No elLoadSuccess class");
					return;
				}
			}

			if ( $el.data( "template" ) ) {
				o.template = $el.data( "template" );

				/* to support swipe list, <li> or <ul> can be main node of extendable list. */
				if ( $el.data( "swipelist" ) == true ) {
					o.childSelector = " ul";
				} else {
					o.shildSelector = " li";
				}
			}
			t._initList( args );
		},

		_loadData : function ( args ) {
			var self = this;

			if ( args.itemData && typeof args.itemData == 'function'  ) {
				self._itemData = args.itemData;
			} else {
				return false;
			}
			if ( args.numItemData ) {
				if ( typeof args.numItemData == 'function' ) {
					self._numItemData = args.numItemData( );
				} else if ( typeof args.numItemData == 'number' ) {
					self._numItemData = args.numItemData;
				} else {
					return false;
				}
			} else {
				return false;
			}
			return true;
		},


		destroy : function () {
			var o = this.options,
				eOTAL_ITEMS = 0,
				last_index = 0;

			$( o.id ).empty();

			$( "#load_more_message" ).die();
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
				.find( ">img:eq(0), .ui-link-inherit>img:eq(0)" ).addClass( "ui-li-thumb" ).each(function () {
					item.addClass( $( this ).is( ".ui-li-icon" ) ? "ui-li-has-icon" : "ui-li-has-thumb" );
				}).end()
				.find( ".ui-li-aside" ).each(function () {
					var $this = $( this );
					$this.prependTo( $this.parent() ); //shift aside to front for css float
				});
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

		refresh: function ( create ) {
			this.parentPage = this.element.closest( ".ui-page" );
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
				itemTheme,
				a,
				last,
				splittheme,
				countParent,
				icon,
				pos,
				numli;

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
									$( "<span />" ).buttonMarkup( {
										shadow : true,
										corners : true,
										theme : splittheme,
										iconpos : "notext",
										icon : listspliticon || last.jqmData( "icon" ) || o.splitIcon
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
				nodeEls = nodeEls.length ? nodeEls : $( "<span>" + $.trim(parent.contents()[ 0 ].nodeValue) + "</span>" );

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

			}).extendablelist();

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
					.bind( "pagehide.remove", newRemove);
			}
		},

		// TODO sort out a better way to track sub pages of the extendable listview this is brittle
		childPages: function () {
			var parentUrl = this.parentPage.jqmData( "url" );

			return $( ":jqmData(url^='" +  parentUrl + "&" + $.mobile.subPageUrlKey + "')" );
		}
	});

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.extendablelist.prototype.options.initSelector, e.target ).extendablelist();
	});

}( jQuery ));

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
