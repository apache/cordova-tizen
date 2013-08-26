//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Theming and layout of headers, footers, and content areas
//>>label: Page Sections
//>>group: Core

define( [ "jquery", "../jquery.mobile.core", "./page" ], function( jQuery ) {
//>>excludeEnd("jqmBuildExclude");
(function( $, undefined ) {

$.mobile.page.prototype.options.backBtnText  = "Back";
$.mobile.page.prototype.options.addBackBtn   = false;
$.mobile.page.prototype.options.backBtnTheme = null;
$.mobile.page.prototype.options.headerTheme  = "a";
$.mobile.page.prototype.options.footerTheme  = "a";
$.mobile.page.prototype.options.contentTheme = null;

// NOTE bind used to force this binding to run before the buttonMarkup binding
//      which expects .ui-footer top be applied in its gigantic selector
// TODO remove the buttonMarkup giant selector and move it to the various modules
//      on which it depends
$.mobile.$document.bind( "pagecreate", function( e ) {
	var $page = $( e.target ),
		o = $page.data( "page" ).options,
		prefix = "data-"+$.mobile.ns,
		pageRole = $page[0].getAttribute( prefix + "role" ) || undefined,
		pageTheme = o.theme;

	$( ":jqmData(role='header'), :jqmData(role='footer'), :jqmData(role='content')", $page )
		.jqmEnhanceable()
		.each(function() {

		var $this = $( this ),
			role = $this[0].getAttribute( prefix + "role" ) || undefined,
			theme = $this[0].getAttribute( prefix + "theme" ) || undefined,
			contentTheme = theme || o.contentTheme || ( pageRole === "dialog" && pageTheme ),
			$headeranchors,
			leftbtn,
			rightbtn,
			$dest = $page.find( ".ui-footer" ),
			backBtn;

		$this.addClass( "ui-" + role );

		//apply theming and markup modifications to page,header,content,footer
		if ( role === "header" || role === "footer" ) {

			var thisTheme = theme || ( role === "header" ? o.headerTheme : o.footerTheme ) || pageTheme;

			$this
				//add theme class
				.addClass( "ui-bar-" + thisTheme )
				// Add ARIA role
				.attr( "role", role === "header" ? "banner" : "contentinfo" );

			if ( role === "header") {
				// Right,left buttons
				$headeranchors	= $this.children( "a, div.naviframe-button, a.naviframe-button, button" );
				leftbtn	= $headeranchors.hasClass( "ui-btn-left" );
				rightbtn = $headeranchors.hasClass( "ui-btn-right" );

				leftbtn = leftbtn || $headeranchors.eq( 0 ).not( ".ui-btn-right" ).addClass( "ui-btn-left" ).length;

				rightbtn = rightbtn || $headeranchors.eq( 1 ).addClass( "ui-btn-right" ).length;

				$( $headeranchors.get().reverse() ).each( function ( i ) {
					$( this ).addClass( "ui-btn-right-" + i );
				});
			}

			// Auto-add back btn on pages beyond first view
			if ( o.addBackBtn &&
				( role === "footer" || role === "header" ) &&
				$page[0].getAttribute( prefix + "url" ) !== $.mobile.path.stripHash( location.hash ) &&
				!leftbtn ) {

				if ( o.addBackBtn == "header" ) {
					$dest = $page.find( ".ui-header" );
				} else {
					$dest = $page.find( ".ui-footer" );
				}

				if ( !$dest.find( ".ui-btn-back" ).length ) {
					backBtn = $( "<a href='javascript:void(0);' class='ui-btn-back' data-" + $.mobile.ns + "rel='back'></a>" )
						// // If theme is provided, override default inheritance
						.buttonMarkup( { icon: "header-back-btn", theme: o.backBtnTheme || thisTheme } );

					backBtn.find( ".ui-btn-text" ).text( o.backBtnText );
					backBtn.appendTo( $dest );
				}
			}

			// Page title
			$this.children( "h1, h2, h3, h4, h5, h6" )
				.addClass( "ui-title" )
				// Regardless of h element number in src, it becomes h1 for the enhanced page
				.attr({
					"role": "heading",
					"aria-level": "1",
					"aria-label": "title",
					"tabindex": "0"
				});

			$( ".ui-title-text-sub" ).attr( { "tabindex": "0", "aria-label": "subtitle" } );

		} else if ( role === "content" ) {
			if ( contentTheme ) {
				$this.addClass( "ui-body-" + ( contentTheme ) );
			}

			// Add ARIA role
			$this.attr( "role", "main" );
		}
	});
});

})( jQuery );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");
