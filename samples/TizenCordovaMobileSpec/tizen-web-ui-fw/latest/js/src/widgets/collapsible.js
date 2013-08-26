(function( $, undefined ) {

$.widget( "mobile.collapsible", $.mobile.widget, {
	options: {
		expandCueText: " Expandable list, tap to open list",
		collapseCueText: " Expandable list, tap to close list",
		collapsed: true,
		heading: "h1,h2,h3,h4,h5,h6,legend",
		theme: null,
		contentTheme: null,
		inset: true,
		mini: false,
		initSelector: ":jqmData(role='collapsible')"
	},
	_create: function() {

		var $el = this.element,
			o = this.options,
			collapsible = $el.addClass( "ui-collapsible" ),
			collapsibleHeading = $el.children( o.heading ).first(),
			collapsedIcon = $.mobile.getAttrFixed( $el[0], "data-" + $.mobile.ns + "collapsed-icon" ) || o.collapsedIcon,
			expandedIcon = $.mobile.getAttrFixed( $el[0], "data-" + $.mobile.ns + "expanded-icon" ) || o.expandedIcon,
			collapsibleContent = collapsible.wrapInner( "<div class='ui-collapsible-content'></div>" ).children( ".ui-collapsible-content" ),
			collapsibleSet = $el.closest( ":jqmData(role='collapsible-set')" ).addClass( "ui-collapsible-set" );

		// Replace collapsibleHeading if it's a legend
		if ( collapsibleHeading.is( "legend" ) ) {
			collapsibleHeading = $( "<div role='heading'>"+ collapsibleHeading.html() +"</div>" ).insertBefore( collapsibleHeading );
			collapsibleHeading.next().remove();
		}

		// If we are in a collapsible set
		if ( collapsibleSet.length ) {
			// Inherit the theme from collapsible-set
			if ( !o.theme ) {
				o.theme = $.mobile.getAttrFixed( collapsibleSet[0], "data-" + $.mobile.ns + "theme" ) || $.mobile.getInheritedTheme( collapsibleSet, "c" );
			}
			// Inherit the content-theme from collapsible-set
			if ( !o.contentTheme ) {
				o.contentTheme = $.mobile.getAttrFixed( collapsibleSet[0], "data-" + $.mobile.ns + "content-theme" );
			}

			// Get the preference for collapsed icon in the set
			if ( !o.collapsedIcon ) {
				o.collapsedIcon = $.mobile.getAttrFixed( collapsibleSet[0], "data-" + $.mobile.ns + "collapsed-icon" );
			}
			// Get the preference for expanded icon in the set
			if ( !o.expandedIcon ) {
				o.expandedIcon = $.mobile.getAttrFixed( collapsibleSet[0], "data-" + $.mobile.ns + "expanded-icon" );
			}
			// Gets the preference icon position in the set
			if ( !o.iconPos ) {
				o.iconPos = $.mobile.getAttrFixed( collapsibleSet[0], "data-" + $.mobile.ns + "iconpos" );
			}
			// Inherit the preference for inset from collapsible-set or set the default value to ensure equalty within a set
			if ( $.mobile.getAttrFixed( collapsibleSet[0], "data-" + $.mobile.ns + "inset" ) !== undefined ) {
				o.inset = $.mobile.getAttrFixed( collapsibleSet[0], "data-" + $.mobile.ns + "inset" );
			} else {
				o.inset = true;
			}
			// Gets the preference for mini in the set
			if ( !o.mini ) {
				o.mini = $.mobile.getAttrFixed( collapsibleSet[0], "data-" + $.mobile.ns + "mini" );
			}
		} else {
			// get inherited theme if not a set and no theme has been set
			if ( !o.theme ) {
				o.theme = $.mobile.getInheritedTheme( $el, "c" );
			}
		}
		
		if ( !!o.inset ) {
			collapsible.addClass( "ui-collapsible-inset" );
		}
		
		collapsibleContent.addClass( ( o.contentTheme ) ? ( "ui-body-" + o.contentTheme ) : "");

		collapsedIcon = $.mobile.getAttrFixed( $el[0], "data-" + $.mobile.ns + "collapsed-icon" ) || o.collapsedIcon || "plus";
		expandedIcon = $.mobile.getAttrFixed( $el[0], "data-" + $.mobile.ns + "expanded-icon" ) || o.expandedIcon || "minus";

		collapsibleHeading
			//drop heading in before content
			.insertBefore( collapsibleContent )
			//modify markup & attributes
			.addClass( "ui-collapsible-heading" )
			.append( "<span class='ui-collapsible-heading-status'></span>" )
			.wrapInner( "<a href='#' class='ui-collapsible-heading-toggle'></a>" )
			.find( "a" )
				.first()
				.buttonMarkup({
					shadow: false,
					corners: false,
					iconpos: $.mobile.getAttrFixed( $el[0], "data-" + $.mobile.ns + "iconpos" ) || o.iconPos || "left",
					icon: collapsedIcon,
					mini: o.mini,
					theme: o.theme
				})
				.attr( "role", "");

		if ( !!o.inset ) {				
			collapsibleHeading
				.find( "a" ).first().add( ".ui-btn-inner", $el )
					.addClass( "ui-corner-top ui-corner-bottom" );
		}

		//events
		collapsible
			.bind( "expand collapse", function( event ) {
				if ( !event.isDefaultPrevented() ) {
					var $this = $( this ),
						isCollapse = ( event.type === "collapse" ),
						contentTheme = o.contentTheme;

					event.preventDefault();

					// Custom event callback
					if ( o.customEventHandler ) { o.customEventHandler.call( this, isCollapse ) };

					collapsibleHeading
						.toggleClass( "ui-collapsible-heading-collapsed", isCollapse )
						.find( ".ui-collapsible-heading-status" )
							.text( isCollapse ? o.expandCueText : o.collapseCueText )
						.end()
						.find( ".ui-icon" )
							.toggleClass( "ui-icon-" + expandedIcon, !isCollapse )
							// logic or cause same icon for expanded/collapsed state would remove the ui-icon-class
							.toggleClass( "ui-icon-" + collapsedIcon, ( isCollapse || expandedIcon === collapsedIcon ) )
						.end()
						.find( "a" ).first().removeClass( $.mobile.activeBtnClass );

					$this.toggleClass( "ui-collapsible-collapsed", isCollapse );
					collapsibleContent.toggleClass( "ui-collapsible-content-collapsed", isCollapse ).attr( "aria-hidden", isCollapse );
					collapsibleContent.children( "li" ).not( "ui-collapsible-content" ).attr( "tabindex", isCollapse ? "" : "0" );

					if ( contentTheme && !!o.inset && ( !collapsibleSet.length || collapsible.jqmData( "collapsible-last" ) ) ) {
						collapsibleHeading
							.find( "a" ).first().add( collapsibleHeading.find( ".ui-btn-inner" ) )
							.toggleClass( "ui-corner-bottom", isCollapse );
						collapsibleContent.toggleClass( "ui-corner-bottom", !isCollapse );
					}
					collapsibleContent.trigger( "updatelayout" );
				}
			})
			.trigger( o.collapsed ? "collapse" : "expand" );

		collapsibleHeading
			.bind( "tap", function( event ) {
				collapsibleHeading.find( "a" ).first().addClass( $.mobile.activeBtnClass );
			})
			.bind( "click", function( event ) {

				var type = collapsibleHeading.is( ".ui-collapsible-heading-collapsed" ) ? "expand" : "collapse";

				collapsible.trigger( type );

				event.preventDefault();
				event.stopPropagation();
			});
	}
});

//delegate auto self-init widgets
$.delegateSelfInitWithSingleSelector( $.mobile.collapsible );

})( jQuery );
