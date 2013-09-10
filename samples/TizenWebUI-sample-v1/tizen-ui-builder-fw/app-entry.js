/*******************************************************************************
 * Tizen UI Builder Framework 0.2.2
 * Application entry manager
 * 
 * @generated Tizen UI Builder
 * @attribute managed, readonly, static
 *******************************************************************************
 */

// entry
$(function() {
	if (!app)
		return;

	// bind user unload event handler
	if (app.onunload)
		$(window).unload(app.onunload);

	// call user entry
	if (app.onload)
		app.onload();

	if (!document.webkitHidden)
		app.onshow();

	// event handler for detecting when visibility changes
	document.addEventListener("webkitvisibilitychange", function() {
		if (document.webkitHidden) {
			app.onhide();
		} else {
			app.onshow();
		}
	}, false);
	
	// event handler for detecting when hardware key clicked
	$(window).on("tizenhwkey", function(e) {
		if (e.originalEvent.keyName == "back") {
			window.history.back();
		}
	});

	var startPageId = app.getStartPageId();
	if (startPageId) {
		pageManager.changePage(startPageId);
	}
});

if (app && app.init) app.init();
