//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Divider listitem in listview
//>>label: List divider
//>>group: Tizen:Widgets

define( [ 
	'jquery',
	"jqm/jquery.mobile.widget"
	], function ( jQuery ) {

//>>excludeEnd("jqmBuildExclude");

/* ***************************************************************************
* style : normal, check
* option :
*    - folded : decide to show divider press effect or not
*    - line : decide to draw divider line or not
*/
/**
	@class ListDivider
	The list divider widget is used as a list separator for grouping lists. List dividers can be used in Tizen as described in the jQueryMobile documentation for list dividers.<br/>
	To add a list divider widget to the application, use the following code:

		<li data-role="list-divider" data-style="check">
		<form><input type="checkbox" name="c2line-check1" /></form></li>

	The list divider can define callbacks for events as described in the jQueryMobile documentation for list events. <br/> You can use methods with the list divider as described in the jQueryMobile documentation for list methods.

	@since tizen2.0	
*/
/**
	@property {String} data-style
	Sets the style of the list divider. The style options are dialogue, check, expandable, and checkexpandable.
*/

(function ( $, undefined ) {
	$.widget( "tizen.listdivider", $.mobile.widget, {
		options: {
			initSelector: ":jqmData(role='list-divider')",
			folded : false,
			listDividerLine : true
		},

		_create: function () {

			var $listdivider = this.element,
				openStatus = true,
				expandSrc,
				listDividerLine = true,
				style = $listdivider.attr( "data-style" );

			if ( $listdivider.data("line") === false ) {
				this.options.listDividerLine = false;
			}

			if ( $listdivider.data("folded") === true ) {
				this.options.folded = true;
			}

			if ( style == undefined || style === "normal" || style === "check" ) {
				if ( this.options.folded ) {
					$listdivider.buttonMarkup();
				} else {
					$listdivider.wrapInner("<span class='ui-btn-text'></span>");
				}

				if ( this.options.listDividerLine ) {
					expandSrc = "<span class='ui-divider-normal-line'></span>";
					if ( this.options.folded ) {
						$( expandSrc ).appendTo( $listdivider.children( ".ui-btn-inner" ) );
					} else {
						$( expandSrc ).appendTo( $listdivider);
					}
				}
			}

			$listdivider.bind( "vclick", function ( event, ui ) {
			/* need to implement expand/collapse divider */
			});
		}
	});

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.listdivider.prototype.options.initSelector, e.target ).listdivider();
	});
}( jQuery ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
