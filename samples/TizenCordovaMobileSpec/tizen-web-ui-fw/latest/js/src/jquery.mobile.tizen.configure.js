
/*
 * set TIZEN specific configures
 */

( function( $, window, undefined ) {

	/* set default transition */
	$.mobile.defaultPageTransition = "none";

	/* depth transition */
	$.mobile.transitionHandlers.depth = $.mobile.transitionHandlers.simultaneous;
	$.mobile.transitionFallbacks.depth = "fade";

	/* Button data-corners default value */
	$.fn.buttonMarkup.defaults.corners = false;

	/* button hover delay */
	$.mobile.buttonMarkup.hoverDelay = 0;

})( jQuery, this );


