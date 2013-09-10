/*******************************************************************************
 * Tizen UI Builder Framework 0.2.3
 * Page System manager
 * 
 * @generated Tizen UI Builder
 * @attribute managed, readonly, static
 *******************************************************************************
 */

/**
 * Page base class
 * @param {String} pageID
 */
function _page(pageID) {
	this.pageID = pageID;
	this.jqID = "#" + this.pageID;
	/**
	 * Full path for html file.
	 * @type String
	 */
	this.htmlPath = undefined;	// will be replaced.
	/**
	 * Full path for css file.
	 * @type String
	 */
	this.managedCssPath = undefined;	// will be replaced.
	/**
	 * Full path for css file.
	 * @type String
	 */
	this.cssPath = undefined;	// will be replaced.
	
	/**
	 * Page object
	 * @type jQueryObject
	 */
	this.obj = undefined;
	// default event handler
	/**
	 * event-handler onpagebeforecreate(event)
	 * @param {Object} event
	 * @returns {Boolean}
	 */
	this.onpagebeforecreate = function(event) {};
	/**
	 * event-handler onpagecreate(event)
	 * @param {Object} event
	 * @returns {Boolean}
	 */
	this.onpagecreate = function(event) {};
	/**
	 * event-handler onpageinit(event)
	 * @param {Object} event
	 * @returns {Boolean}
	 */
	this.onpageinit = function(event) {};
	/**
	 * event-handler onpagebeforeshow(event)
	 * @param {Object} event
	 * @returns {Boolean}
	 */
	this.onpagebeforeshow = function(event) {};
	/**
	 * event-handler onpageshow(event)
	 * @param {Object} event
	 * @returns {Boolean}
	 */
	this.onpageshow = function(event) {};
	/**
	 * event-handler onpagebeforehide(event)
	 * @param {Object} event
	 * @returns {Boolean}
	 */
	this.onpagebeforehide = function(event) {};
	/**
	 * event-handler onpagehide(event)
	 * @param {Object} event
	 * @returns {Boolean}
	 */
	this.onpagehide = function(event) {};
	/**
	 * event-handler onpageremove(event)
	 * @param {Object} event
	 * @returns {Boolean}
	 */
	this.onpageremove = function(event) {};
	/**
	 * event-handler onupdatelayout(event)
	 * @param {Object} event
	 * @returns {Boolean}
	 */
	this.onupdatelayout = function(event) {};
}

// default event handler
/**
 * function _init_page(initFunc)
 * @param {function} initFunc
 * @param {Boolean} isStartPage
 */
_page.prototype._init_page = function(initFunc, isStartPage) {
	// page object
	var _obj = this.obj = $(this.jqID);
	var _basePage = this;
	
	_obj.live("pageinit", initFunc);
	
	var _cssPath = this.cssPath;
	var _managedCssPath = this.managedCssPath;
	var _currentPageId = this.pageID;
	_obj.live("pageinit", function(event) {
		var managedCssLink = document.createElement('link');
		managedCssLink.setAttribute('rel', 'stylesheet');
		managedCssLink.setAttribute('href', _managedCssPath);
		
		var cssLink = document.createElement('link');
		cssLink.setAttribute('rel', 'stylesheet');
		cssLink.setAttribute('href', _cssPath);

		var head = document.getElementsByTagName('head')[0];
		if(head) {
			$(head).append(cssLink);
			$(head).append(managedCssLink);
		}
	});
	_obj.live("pagebeforeshow", function(event) {
		app.setCurrentPageId(_currentPageId);
	});
	_obj.live("pagebeforehide", function(event) {
		app.setCurrentPageId(undefined);
	});
	_obj.live("pageremove", function(event) {			
		var cssLinks = document.getElementsByTagName('head')[0].getElementsByTagName('link');				
		for (var i = (cssLinks.length-1); i >= 0; i--) {
			var link = cssLinks[i];
			
			if (link.getAttribute('href') == _managedCssPath || link.getAttribute('href') == _cssPath) {				
				link.parentNode.removeChild(link);				
			}
		}
		
	});
	_obj.live("pagehide", function(event) {
		if (app.getCurrentPageId() == undefined) {
			tizen.application.getCurrentApplication().exit();
		}
	});
	
	_obj.live("pagebeforecreate", function(event){_basePage.onpagebeforecreate(event);});
	_obj.live("pagecreate", function(event){_basePage.onpagecreate(event);});
	_obj.live("pageinit", function(event){_basePage.onpageinit(event);});
	_obj.live("pagebeforeshow", function(event){_basePage.onpagebeforeshow(event);});
	_obj.live("pageshow", function(event){_basePage.onpageshow(event);});
	_obj.live("pagebeforehide", function(event){_basePage.onpagebeforehide(event);});
	_obj.live("pagehide", function(event){_basePage.onpagehide(event);});
	_obj.live("pageremove", function(event){_basePage.onpageremove(event);});
	_obj.live("updatelayout", function(event){_basePage.onupdatelayout(event);});
};

/**
 * Page manager class
 * @constructor
 * @param {String} pageDir
 * @returns {_pageManager}
 */
function _pageManager() {
	var _count = 0;
	
	var _pages = [];
	
	/**
	 * getVersion()
	 * @returns {String} 
	 */
	this.getVersion = function() {
		return "0.2.4";
	};
	
	/**
	 * addPage(page)
	 * @param {_page} pageObj
	 * @param {String} htmlPath
	 * @param {String} cssPath
	 * @param {String} managedCssPath
	 * @returns {Number} pages count
	 */
	this.addPage = function(pageObj) {
		if (pageObj instanceof _page === false) {
			throw page + " is not instance of _page";
		}
		_pages[pageObj.pageID] = pageObj;
		return (++_count);
	};
	
	/**
	 * getHtmlPath(pageID)
	 * @param {String} pageID
	 * @returns {String}
	 */
	this.getHtmlPath = function(pageID) {
		var pageObj = _pages[pageID];
		if (pageObj == undefined) {
			throw pageID + " is not exist in pageManager";
		} else {
			return pageObj.htmlPath;
		}
	};
	
	/**
	 * getPath(pageID) - deprecated. use getHtmlPath()
	 * @param {String} pageID
	 * @returns {String}
	 */
	this.getPath = this.getHtmlPath;
	
	/**
	 * getManagedCssPath(pageID)
	 * @param {String} pageID
	 * @returns {String}
	 */
	this.getManagedCssPath = function(pageID) {
		var pageObj = _pages[pageID];
		if (pageObj == undefined) {
			throw pageID + " is not exist in pageManager";
		} else {
			return pageObj.managedCssPath;
		}
	};
	
	/**
	 * getCssPath(pageID)
	 * @param {String} pageID
	 * @returns {String}
	 */
	this.getCssPath = function(pageID) {
		var pageObj = _pages[pageID];
		if (pageObj == undefined) {
			throw pageID + " is not exist in pageManager";
		} else {
			return pageObj.cssPath;
		}
	};

	/**
	 * getPageObj(pageID)
	 * @param {String} pageID
	 * @param {Object} options
	 */
	this.getPageObj = function(pageID) {
		var pageObj = _pages[pageID];
		if (pageObj == undefined) {
			throw pageID + " is not exist in pageManager";
		} else {
			return pageObj;
		}

	};

	/**
     * changePage(pageID, options)
     * @param {String} pageID
     * @param {Object} options
     */
	this.changePage = function(pageID, options) {
		$.mobile.changePage(pageManager.getHtmlPath(pageID), options);
	};
}

var pageManager = new _pageManager("");


/**
 * app base class
 */
function _app() {

	/**
	 * startPageId
	 * @private
	 */
	var startPageId =	undefined;

	/**
	 * startPage
	 * @deprecated Since version 2.1. You get the startPage using PageManager.
	 */
	/*this.startPage = undefined;*/

	/**
	 * currentPageId
	 * @private
	 */
	var currentPageId = undefined;

	/**
	 * masterPagePath
	 * @private
	 */
	var masterPagePath = undefined;

	function init() {
	}

	this.setStartPageId = function(pageId) {
		startPageId = pageId;
	}

	this.getStartPageId = function() {
		return startPageId;
	};

	this.setMasterPagePath = function(path) {
		masterPagePath = path;
	};

	this.getMasterPagePath = function() {
		return masterPagePath;
	}

	this.setCurrentPageId = function(pageId) {
		currentPageId = pageId;
	};

	this.getCurrentPageId = function() {
		return currentPageId;
	}

	/**
	 * onload()
	 */
	this.onload = function() {};

	/**
	 * onunload()
	 */
	this.onunload = function() {};

	/**
	 * onshow()
	 */
	this.onshow = function() {};

	/**
	 * onhide()
	 */
	this.onhide = function() {};

}

var app = new _app();
