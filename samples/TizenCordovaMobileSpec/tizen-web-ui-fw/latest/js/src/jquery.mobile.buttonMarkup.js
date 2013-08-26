(function( $, undefined ) {

$.fn.buttonMarkup = function( options ) {
	var $workingSet = this,
		prefix = "data-" + $.mobile.ns,
		mapToDataAttr = function( key, value ) {
			e.setAttribute( "data-" + $.mobile.ns + key, value );
			el.jqmData( key, value );
		};

	// Enforce options to be of type string
	options = ( options && ( $.type( options ) === "object" ) )? options : {};
	for ( var i = 0; i < $workingSet.length; i++ ) {
		var el = $workingSet.eq( i ),
			e = el[ 0 ],
			o = $.extend( {}, $.fn.buttonMarkup.defaults, {
				icon:       options.icon       !== undefined ? options.icon       : $.mobile.getAttrFixed( e, prefix + "icon" ),
				iconpos:    options.iconpos    !== undefined ? options.iconpos    : $.mobile.getAttrFixed( e, prefix + "iconpos" ),
				theme:      options.theme      !== undefined ? options.theme      : $.mobile.getAttrFixed( e, prefix + "theme" ) || $.mobile.getInheritedTheme( el, $.fn.buttonMarkup.defaults["theme"] ),
				inline:     options.inline     !== undefined ? options.inline     : $.mobile.getAttrFixed( e, prefix + "inline" ),
				shadow:     options.shadow     !== undefined ? options.shadow     : $.mobile.getAttrFixed( e, prefix + "shadow" ),
				corners:    options.corners    !== undefined ? options.corners    : $.mobile.getAttrFixed( e, prefix + "corners" ),
				iconshadow: options.iconshadow !== undefined ? options.iconshadow : $.mobile.getAttrFixed( e, prefix + "iconshadow" ),
				mini:       options.mini       !== undefined ? options.mini       : $.mobile.getAttrFixed( e, prefix + "mini" )
			}, options ),

			// Classes Defined
			innerClass = "ui-btn-inner",
			textClass = "ui-btn-text",
			buttonClass, iconClass,
			// Button inner markup
			buttonInner,
			buttonText,
			buttonIcon,
			buttonElements;

		for ( key in o ) {
			e.setAttribute ( prefix + key, o[ key ])
		}

		if ( $.mobile.getAttrFixed( e, prefix + "rel" ) === "popup" && el.attr( "href" ) ) {
			e.setAttribute( "aria-haspopup", true );
			e.setAttribute( "aria-owns", e.getAttribute( "href" ) );
		}

		if ( e.tagName !== "LI" && e.tagName !== "LABEL" ) {
			e.setAttribute( "role", "button" );
			e.setAttribute( "tabindex", "0" );
		}

		// Check if this element is already enhanced
		buttonElements = $.data( ( ( e.tagName === "INPUT" || e.tagName === "BUTTON" ) ? e.parentNode : e ), "buttonElements" );

		if ( buttonElements ) {
			e = buttonElements.outer;
			el = $( e );
			buttonInner = buttonElements.inner;
			buttonText = buttonElements.text;
			// We will recreate this icon below
			$( buttonElements.icon ).remove();
			buttonElements.icon = null;
		}
		else {
			buttonInner = document.createElement( o.wrapperEls );
			buttonText = document.createElement( o.wrapperEls );
		}
		buttonIcon = o.icon ? document.createElement( "span" ) : null;

		if ( attachEvents && !buttonElements ) {
			attachEvents();
		}

		// if not, try to find closest theme container
		if ( !o.theme ) {
			o.theme = $.mobile.getInheritedTheme( el, "c" );
		}

		buttonClass = "ui-btn ui-btn-up-" + o.theme;
		buttonClass += o.shadow ? " ui-shadow" : "";
		buttonClass += o.corners ? " ui-btn-corner-all" : "";

		// To distinguish real buttons
		if(  $.mobile.getAttrFixed( e, prefix + "role" ) == "button" || e.tagName == "BUTTON" || e.tagName == "DIV" ){
			buttonClass += " ui-btn-box-" + o.theme;
		}

		/* TIZEN style markup */
		buttonStyle =  $.mobile.getAttrFixed( e, prefix + "style" );

		if ( buttonStyle == "circle" && !($(el).text().length > 0) ) {
			/* style : no text, Icon only */
			buttonClass += " ui-btn-corner-circle";
			buttonClass += " ui-btn-icon_only";
		} else if ( buttonStyle == "nobg" ) {
			/* style : no text, Icon only, no bg */
			buttonClass += " ui-btn-icon-nobg";
			buttonClass += " ui-btn-icon_only";
		} else if ( buttonStyle == "edit" ) {
			buttonClass += " ui-btn-edit";
		} else if ( buttonStyle == "round" || ( buttonStyle == "circle" && $(el).text().length > 0 ) ) {
			buttonClass += " ui-btn-round";
		}
		if ( o.icon ) {
			if ( $(el).text().length > 0 ) {

				switch ( o.iconpos ) {
				case "right" :
				case "left" :
				case "top" :
				case "bottom" :
					textClass += " ui-btn-text-padding-" + o.iconpos;
					break;
				default:
					textClass += " ui-btn-text-padding-left";
					break;
				}

				innerClass += " ui-btn-hastxt";
			} else {
				if ( buttonStyle == "circle" ) {
					/* style : no text, Icon only */
					innerClass += " ui-btn-corner-circle";
				} else if ( buttonStyle == "nobg" ) {
					/* style : no text, Icon only, no bg */
					innerClass += " ui-btn-icon-nobg";
				}

				buttonClass += " ui-btn-icon_only";
				innerClass += " ui-btn-icon-only";

				if ( e.tagName !== "LABEL" ) {
					$( el ).text( o.icon.replace( "naviframe-", "" ) );
				}
			}
		} else {
			if ( $(el).text().length > 0 ) {
				innerClass += " ui-btn-hastxt";
			} else if ( buttonStyle == "circle" ){
				buttonClass += " ui-btn-round";
			}
		}
		if ( o.mini !== undefined ) {
			// Used to control styling in headers/footers, where buttons default to `mini` style.
			buttonClass += o.mini === true ? " ui-mini" : " ui-fullsize";
		}

		if ( o.inline !== undefined ) {
			// Used to control styling in headers/footers, where buttons default to `inline` style.
			buttonClass += o.inline === true ? " ui-btn-inline" : " ui-btn-block";
		}

		if ( o.icon ) {
			o.icon = "ui-icon-" + o.icon;
			o.iconpos = o.iconpos || "left";

			iconClass = "ui-icon " + o.icon;

			if ( o.iconshadow ) {
				iconClass += " ui-icon-shadow";
			}
		}

		if ( o.iconpos ) {
			buttonClass += " ui-btn-icon-" + o.iconpos;

			if ( o.iconpos === "notext" && !el.attr( "title" ) ) {
				el.attr( "title", el.getEncodedText() );
			}
		}

		innerClass += o.corners ? " ui-btn-corner-all" : "";

		if ( o.iconpos && o.iconpos === "notext" && !el.attr( "title" ) ) {
			el.attr( "title", el.getEncodedText() );
		}

		if ( buttonElements ) {
			el.removeClass( buttonElements.bcls || "" );
		}
		el.removeClass( "ui-link" ).addClass( buttonClass );

		buttonInner.className = innerClass;

		buttonText.className = textClass;
		if ( !buttonElements ) {
			buttonInner.appendChild( buttonText );
		}
		if ( buttonIcon ) {
			buttonIcon.className = iconClass;
			if ( !( buttonElements && buttonElements.icon ) ) {
				buttonIcon.innerHTML = "&#160;";
				buttonInner.appendChild( buttonIcon );
			}
		}

		while ( e.firstChild && !buttonElements ) {
			buttonText.appendChild( e.firstChild );
		}

		if ( !buttonElements ) {
			e.appendChild( buttonInner );
		}

		// Assign a structure containing the elements of this button to the elements of this button. This
		// will allow us to recognize this as an already-enhanced button in future calls to buttonMarkup().
		buttonElements = {
			bcls  : buttonClass,
			outer : e,
			inner : buttonInner,
			text  : buttonText,
			icon  : buttonIcon
		};

		$.data( e,           'buttonElements', buttonElements );
		$.data( buttonInner, 'buttonElements', buttonElements );
		$.data( buttonText,  'buttonElements', buttonElements );
		if ( buttonIcon ) {
			$.data( buttonIcon, 'buttonElements', buttonElements );
		}
	}

	return this;
};

$.fn.buttonMarkup.defaults = {
	theme: "c",
	corners: true,
	shadow: true,
	iconshadow: true,
	wrapperEls: "span"
};

function closestEnabledButton( element ) {
    var cname;

    while ( element ) {
		// Note that we check for typeof className below because the element we
		// handed could be in an SVG DOM where className on SVG elements is defined to
		// be of a different type (SVGAnimatedString). We only operate on HTML DOM
		// elements, so we look for plain "string".
        cname = ( typeof element.className === 'string' ) && ( element.className + ' ' );
        if ( cname && cname.indexOf( "ui-btn " ) > -1 && cname.indexOf( "ui-disabled " ) < 0 ) {
            break;
        }

        element = element.parentNode;
    }

    return element;
}

var attachEvents = function() {
	var hoverDelay = $.mobile.buttonMarkup.hoverDelay, hov, foc;

	$.mobile.$document.bind( {
		"vmousedown vmousecancel vmouseup vmouseover vmouseout focus blur scrollstart touchend touchcancel": function( event ) {
			var theme,
				$btn = $( closestEnabledButton( event.target ) ),
				isTouchEvent = event.originalEvent && /^touch/.test( event.originalEvent.type ),
				evt = event.type;

			if ( $btn.length ) {
				theme = $btn.attr( "data-" + $.mobile.ns + "theme" );

				if ( evt === "vmousedown" ) {
					if ( isTouchEvent ) {
						// Use a short delay to determine if the user is scrolling before highlighting
						hov = setTimeout( function() {
							$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-down-" + theme );
						}, hoverDelay );
					} else {
						$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-down-" + theme );
					}
				} else if ( evt === "vmousecancel" || evt === "vmouseup" || evt === "touchend" || evt === "touchcancel" ) {
					$btn.removeClass( "ui-btn-down-" + theme ).addClass( "ui-btn-up-" + theme );
				} else if ( evt === "vmouseover" || evt === "focus" ) {
					if ( isTouchEvent ) {
						// Use a short delay to determine if the user is scrolling before highlighting
						foc = setTimeout( function() {
							$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-hover-" + theme );
						}, hoverDelay );
					} else {
						$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-hover-" + theme );
					}
				} else if ( evt === "vmouseout" || evt === "blur" || evt === "scrollstart" ) {
					$btn.removeClass( "ui-btn-hover-" + theme  + " ui-btn-down-" + theme ).addClass( "ui-btn-up-" + theme );
					if ( hov ) {
						clearTimeout( hov );
					}
					if ( foc ) {
						clearTimeout( foc );
					}
				}
			}
		},
		"focusin focus": function( event ) {
			$( closestEnabledButton( event.target ) ).addClass( $.mobile.focusClass );
		},
		"focusout blur": function( event ) {
			$( closestEnabledButton( event.target ) ).removeClass( $.mobile.focusClass );
		}
	});

	attachEvents = null;
};

//links in bars, or those with  data-role become buttons
//auto self-init widgets
$.mobile.$document.bind( "pagecreate create", function( e ) {

	$( ":jqmData(role='button'), .ui-bar > a, .ui-header > a, .ui-footer > a, .ui-bar > :jqmData(role='controlgroup') > a", e.target )
		.jqmEnhanceable()
		.not( "button, input, .ui-btn, :jqmData(role='none'), :jqmData(role='nojs')" )
		.buttonMarkup();
});

})( jQuery );

