//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Shows multimedia and its controls
//>>label: Multimedia view
//>>group: Tizen:Widgets

define( [ 
	'jquery',
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
 * Authors: Yonghwi Park <yonghwi0324.park@samsung.com>
 *		 Wonseop Kim <wonseop.kim@samsung.com>
*/

/**
 *
 * MultiMediaView is a widget that lets the user view and handle multimedia contents.
 * Video and audio elements are coded as standard HTML elements and enhanced by the 
 * MultiMediaview to make them attractive and usable on a mobile device.
 *
 * HTML Attributes:
 *			data-theme : Set a theme of widget.
 *				If this value is not defined, widget will use parent`s theme. (optional)
 *			data-controls : If this value is 'true', widget will use belonging controller.
 *				If this value is 'false', widget will use browser`s controller.
 *				Default value is 'true'.
 *			data-full-screen : Set a status that full-screen when inital start.
 *				Default value is 'false'.
 *
 * APIs:
 *			width( [number] )
 *					: Get or set the width of widget.
 *					The first argument is the width of widget.
 *					If no first argument is specified, will act as a getter.
 *			height( [number] )
 *					: Get or set the height of widget.
 *					The first argument is the height of widget.
 *					If no first argument is specified, will act as a getter.
 *			fullScreen( [boolean] )
 *					: Get or Set the status of full-screen.
 *					If no first argument is specified, will act as a getter.
 *
 * Events:
 *
 *			N/A
 *
 * Examples:
 *
 *			VIDEO :
 *				<video data-controls="true" style="width:100%;">
 *					<source src="media/oceans-clip.mp4" type="video/mp4" />
 *					Your browser does not support the video tag.
 *				</video>
 *
 *			AUDIO :
 *				<audio data-controls="true" style="width:100%;">
 *					<source src="media/Over the horizon.mp3" type="audio/mp3" />
 *					Your browser does not support the audio tag.
 *				</audio>
 *
 */
/**
	@class MutimediaView
	The multimedia view widget shows a player control that you can use to view and handle multimedia content. This widget uses the standard HTML video and audio elements, which have been enhanced for use on a mobile device.

	To add a multimedia view widget to the application, use the following code:
	
		// Video player control
		<video data-controls="true" style="width:100%;">
		<source src="<VIDEO_FILE_URL>" type="video/mp4" /> Your browser does not support the video tag. </video>
		// Audio player control
		<audio data-controls="true" style="width:100%;"> <source src="<AUDIO_FILE_URL>" type="audio/mp3" /> Your browser does not support the audio tag.
		</audio>
*/
/**
	@property {Boolean} data-control
	Sets the controls for the widget.
	The default value is true. If the value is set to true, the widget uses its own player controls. If the value is set to false, the widget uses the browser's player controls.
*/
/**
	@property {Boolean} data-full-screen
	Defines whether the widget opens in the fullscreen view mode.
	The default value is false.
*/
/**
	@property {String} data-theme
	Sets the widget theme.
	If the value is not set, the parent control's theme is used
*/
/**
	@method width
	The width method is used to get (if no value is defined) or set the multimedia view widget width:
		<video>
			 <source src="test.mp4" type="video/mp4" />
		</video>
		$(".selector").multimediaview("width", [value]);
*/
/**
	@method height
	The height method is used to get (if no value is defined) or set the multimedia view widget height:
		<video>
			<source src="test.mp4" type="video/mp4" />
		</video>
		$(".selector").multimediaview("height", [value]);
*/
/**
	@method fullScreen
	The fullScreen method is used to get (if no value is defined) or set the full-screen mode of the multimedia view widget. If the value is true, the full-screen mode is used; otherwise the multimedia view widget runs in the normal mode.

		<video>
			<source src="test.mp4" type="video/mp4" />
		</video>
		$(".selector").multimediaview("fullScreen", [value]);
*/
( function ( $, document, window, undefined ) {
	$.widget( "tizen.multimediaview", $.mobile.widget, {
		options: {
			theme: null,
			controls: true,
			fullScreen: false,
			initSelector: "video, audio"
		},

		_create: function () {
			var self = this,
				view = self.element,
				viewElement = view[0],
				isVideo = ( viewElement.nodeName === "VIDEO" ),
				option = self.options,
				parentTheme = $.mobile.getInheritedTheme( view, "s" ),
				theme = option.theme || parentTheme,
				width = viewElement.style.getPropertyValue( "width" ) || "",
				wrap = $( "<div class='ui-multimediaview-wrap ui-multimediaview-" + theme + "'>" ),
				control = null;

			$.extend( this, {
				role: null,
				controlTimer: null,
				isVolumeHide: true,
				backupView: null,
				_reserveVolume: -1,
				_isVideo: isVideo
			});

			view.addClass( "ui-multimediaview" );
			control = self._createControl();
			control.hide();

			$( ".ui-button", control ).addClass( "ui-shadow ui-btn-corner-all" );
			$( ".ui-volumecontrol .ui-handle", control ).addClass( "ui-shadow ui-btn-corner-circle" );

			view.wrap( wrap ).after( control );

			if ( isVideo ) {
				control.addClass( "ui-multimediaview-video" );
			} else {
				self.width( width );
				self.options.fullScreen = false;
			}

			if ( option.controls && view.attr( "controls" ) ) {
				view.removeAttr( "controls" );
			}

			self._addEvent();
		},

		_resize: function () {
			this._resizeFullscreen( this.options.fullScreen );
			this._resizeControl();
			this._updateSeekBar();
			this._updateVolumeState();
		},

		_resizeControl: function () {
			var self = this,
				view = self.element,
				viewElement = view[0],
				isVideo = self._isVideo,
				wrap = view.parent( ".ui-multimediaview-wrap" ),
				control = wrap.find( ".ui-multimediaview-control" ),
				buttons = control.find( ".ui-button" ),
				playpauseButton = control.find( ".ui-playpausebutton" ),
				seekBar = control.find( ".ui-seekbar" ),
				durationLabel = control.find( ".ui-durationlabel" ),
				timestampLabel = control.find( ".ui-timestamplabel" ),
				volumeControl = control.find( ".ui-volumecontrol" ),
				volumeBar = volumeControl.find( ".ui-volumebar" ),
				width = ( isVideo ? view.width() : wrap.width() ),
				height = ( isVideo ? view.height() : control.height() ),
				offset = view.offset(),
				controlHeight = control.height(),
				availableWidth = 0,
				controlOffset = null;

			if ( control ) {
				if ( isVideo ) {
					controlOffset = control.offset();
					controlOffset.left = offset.left;
					controlOffset.top = offset.top + height - controlHeight;
					control.offset( controlOffset );
				}
				control.width( width );
			}

			if ( seekBar ) {
				availableWidth = control.width() - ( buttons.outerWidth( true ) * buttons.length );
				availableWidth -= ( parseInt( buttons.eq( 0 ).css( "margin-left" ), 10 ) + parseInt( buttons.eq( 0 ).css( "margin-right" ), 10 ) ) * buttons.length;
				if ( !self.isVolumeHide ) {
					availableWidth -= volumeControl.outerWidth( true );
				}
				seekBar.width( availableWidth );
			}

			if ( durationLabel && !isNaN( viewElement.duration ) ) {
				durationLabel.find( "p" ).text( self._convertTimeFormat( viewElement.duration ) );
			}

			if ( viewElement.autoplay && viewElement.paused === false ) {
				playpauseButton.removeClass( "ui-play-icon" ).addClass( "ui-pause-icon" );
			}

			if ( seekBar.width() < ( volumeBar.width() + timestampLabel.width() + durationLabel.width() ) ) {
				durationLabel.hide();
			} else {
				durationLabel.show();
			}
		},

		_resizeFullscreen: function ( isFullscreen ) {
			if ( !this._isVideo ) {
				return;
			}

			var self = this,
				view = self.element,
				viewElement = view[0],
				wrap = view.parent( ".ui-multimediaview-wrap" ),
				control = wrap.find( ".ui-multimediaview-control" ),
				fullscreenButton = control.find( ".ui-fullscreenbutton" ),
				currentPage = $( ".ui-page-active" ),
				playpauseButton = control.find( ".ui-playpausebutton" ),
				timestampLabel = control.find( ".ui-timestamplabel" ),
				seekBar = control.find( ".ui-seekbar" ),
				durationBar = seekBar.find( ".ui-duration" ),
				currenttimeBar = seekBar.find( ".ui-currenttime" ),
				body = $( "body" )[0],
				header = currentPage.children( ".ui-header" ),
				footer = currentPage.children( ".ui-footer" ),
				docWidth = 0,
				docHeight = 0;

			if ( isFullscreen ) {
				if ( !self.backupView ) {
					self.backupView = {
						width: viewElement.style.getPropertyValue( "width" ) || "",
						height: viewElement.style.getPropertyValue( "height" ) || "",
						position: view.css( "position" ),
						zindex: view.css( "z-index" ),
						wrapHeight: wrap[0].style.getPropertyValue( "height" ) || ""
					};
				}
				docWidth = body.clientWidth;
				docHeight = body.clientHeight - 1;

				header.hide();
				footer.hide();
				view.parents().each( function ( e ) {
					var element = $( this );
					element.addClass( "ui-fullscreen-parents" )
						.siblings()
						.addClass( "ui-multimediaview-siblings-off" );
				});
				fullscreenButton.removeClass( "ui-fullscreen-on" ).addClass( "ui-fullscreen-off" );

				wrap.height( docHeight );
				view.width( docWidth ).height( docHeight );
			} else {
				if ( !self.backupView ) {
					return;
				}

				header.show();
				footer.show();
				view.parents().each( function ( e ) {
					var element = $( this );
					element.removeClass( "ui-fullscreen-parents" )
						.siblings()
						.removeClass( "ui-multimediaview-siblings-off" );
				});

				fullscreenButton.removeClass( "ui-fullscreen-off" ).addClass( "ui-fullscreen-on" );

				wrap.css( "height", self.backupView.wrapHeight );
				view.css( {
					"width": self.backupView.width,
					"height": self.backupView.height,
					"position": self.backupView.position,
					"z-index": self.backupView.zindex
				});
				self.backupView = null;

				$( window ).trigger( "throttledresize" );
			}
		},

		_addEvent: function () {
			var self = this,
				view = self.element,
				option = self.options,
				viewElement = view[0],
				isVideo = self._isVideo,
				control = view.parent( ".ui-multimediaview-wrap" ).find( ".ui-multimediaview-control" ),
				playpauseButton = control.find( ".ui-playpausebutton" ),
				timestampLabel = control.find( ".ui-timestamplabel" ),
				durationLabel = control.find( ".ui-durationlabel" ),
				volumeButton = control.find( ".ui-volumebutton" ),
				volumeControl = control.find( ".ui-volumecontrol" ),
				volumeBar = volumeControl.find( ".ui-volumebar" ),
				volumeGuide = volumeControl.find( ".ui-guide" ),
				volumeHandle = volumeControl.find( ".ui-handle" ),
				fullscreenButton = control.find( ".ui-fullscreenbutton" ),
				seekBar = control.find( ".ui-seekbar" ),
				durationBar = seekBar.find( ".ui-duration" ),
				currenttimeBar = seekBar.find( ".ui-currenttime" ),
				touchStartEvt = ( $.support.touch ? "touchstart" : "mousedown" ),
				touchMoveEvt = ( $.support.touch ? "touchmove" : "mousemove" ) + ".multimediaview",
				touchEndEvt = ( $.support.touch ? "touchend" : "mouseup" ) + ".multimediaview",
				$document = $( document );

			view.bind( "loadedmetadata.multimediaview", function ( e ) {
				if ( !isNaN( viewElement.duration ) ) {
					durationLabel.find( "p" ).text( self._convertTimeFormat( viewElement.duration ) );
				}
				self._resize();
			}).bind( "timeupdate.multimediaview", function ( e ) {
				self._updateSeekBar();
			}).bind( "play.multimediaview", function ( e ) {
				playpauseButton.removeClass( "ui-play-icon" ).addClass( "ui-pause-icon" );
			}).bind( "pause.multimediaview", function ( e ) {
				playpauseButton.removeClass( "ui-pause-icon" ).addClass( "ui-play-icon" );
			}).bind( "ended.multimediaview", function ( e ) {
				if ( typeof viewElement.loop == "undefined" || viewElement.loop === "" ) {
					self.stop();
				}
			}).bind( "volumechange.multimediaview", function ( e ) {
				if ( viewElement.muted && viewElement.volume > 0.1 ) {
					volumeButton.removeClass( "ui-volume-icon" ).addClass( "ui-mute-icon" );
					self._reserveVolume = viewElement.volume;
					viewElement.volume = 0;
				} else if ( self._reserveVolume !== -1 && !viewElement.muted ) {
					volumeButton.removeClass( "ui-mute-icon" ).addClass( "ui-volume-icon" );
					viewElement.volume = self._reserveVolume;
					self._reserveVolume = -1;
				} else if ( viewElement.volume < 0.1 ) {
					volumeButton.removeClass( "ui-volume-icon" ).addClass( "ui-mute-icon" );
				} else {
					volumeButton.removeClass( "ui-mute-icon" ).addClass( "ui-volume-icon" );
				}

				if ( !self.isVolumeHide ) {
					self._updateVolumeState();
				}
			}).bind( "durationchange.multimediaview", function ( e ) {
				if ( !isNaN( viewElement.duration ) ) {
					durationLabel.find( "p" ).text( self._convertTimeFormat( viewElement.duration ) );
				}
				self._resize();
			}).bind( "click.multimediaview", function ( e ) {
				if ( !self.options.controls ) {
					return;
				}

				control.fadeToggle( "fast" );
				self._resize();
			}).bind( "multimediaviewinit", function ( e ) {
				if ( option.controls ) {
					control.show();
				}
				self._resize();
			});

			$( ".ui-button", control ).bind( touchStartEvt, function () {
				var button = $( this ).addClass( "ui-button-down" );

				$document.bind( touchMoveEvt, function () {
					button.trigger( touchEndEvt );
				});
			}).bind( touchEndEvt, function () {
				$( this ).removeClass( "ui-button-down" );
				$document.unbind( touchMoveEvt );
			});

			playpauseButton.bind( "click.multimediaview", function () {
				self._endTimer();

				if ( viewElement.paused ) {
					viewElement.play();
				} else {
					viewElement.pause();
				}

				if ( isVideo ) {
					self._startTimer();
				}
			});

			fullscreenButton.bind( "click.multimediaview", function ( e ) {
				e.preventDefault();
				self.fullScreen( !self.options.fullScreen );
				self._resize();
				self._endTimer();
				e.stopPropagation();
			});

			seekBar.bind( touchStartEvt, function ( e ) {
				var x = $.support.touch ? e.originalEvent.changedTouches[0].pageX : e.pageX,
					duration = viewElement.duration,
					durationOffset = durationBar.offset(),
					durationWidth = durationBar.width(),
					timerate = ( x - durationOffset.left ) / durationWidth,
					time = duration * timerate;

				if ( !viewElement.played.length ) {
					return;
				}

				viewElement.currentTime = time;

				self._endTimer();

				e.preventDefault();

				control.bind( touchMoveEvt, function ( e ) {
					var x = $.support.touch ? e.originalEvent.changedTouches[0].pageX : e.pageX,
						timerate = ( x - durationOffset.left ) / durationWidth;

					viewElement.currentTime = duration * timerate;

					e.stopPropagation();
				}).bind( touchEndEvt, function () {
					control.unbind( ".multimediaview" );
					$document.unbind( touchMoveEvt );
					if ( viewElement.paused ) {
						viewElement.pause();
					} else {
						viewElement.play();
					}
					e.stopPropagation();
				});

				$document.bind( touchMoveEvt, function () {
					control.trigger( touchEndEvt );
				});
			});

			volumeButton.bind( "click.multimediaview", function () {
				if ( self.isVolumeHide ) {
					var view = self.element,
						volume = viewElement.volume;

					self.isVolumeHide = false;
					volumeControl.fadeIn( "fast", function () {
						self._updateVolumeState();
						self._updateSeekBar();
					});
					self._resize();
				} else {
					self.isVolumeHide = true;
					volumeControl.fadeOut( "fast", function () {
						self._resize();
					});
				}
			});

			volumeBar.bind( touchStartEvt, function ( e ) {
				var baseX = $.support.touch ? e.originalEvent.changedTouches[0].pageX : e.pageX,
					volumeGuideLeft = volumeGuide.offset().left,
					volumeGuideWidth = volumeGuide.width(),
					volumeBase = volumeGuideLeft + volumeGuideWidth,
					handlerOffset = volumeHandle.offset(),
					volumerate = ( baseX - volumeGuideLeft ) / volumeGuideWidth,
					currentVolume = ( baseX - volumeGuideLeft ) / volumeGuideWidth;

				self._endTimer();
				volumeHandle.addClass( "ui-button-down" );
				self._setVolume( currentVolume.toFixed( 2 ) );

				e.preventDefault();

				control.bind( touchMoveEvt, function ( e ) {
					var x = $.support.touch ? e.originalEvent.changedTouches[0].pageX : e.pageX,
						currentVolume = ( x - volumeGuideLeft );
					currentVolume = ( currentVolume < 0 ) ? 0 : currentVolume / volumeGuideWidth;
					self._setVolume( ( currentVolume > 1 ) ? 1 : currentVolume.toFixed( 2 ) );

					e.stopPropagation();
				}).bind( touchEndEvt, function () {
					control.unbind( ".multimediaview" );
					$document.unbind( touchMoveEvt );
					volumeHandle.removeClass( "ui-button-down" );
					e.stopPropagation();
				});

				$document.bind( touchMoveEvt, function () {
					control.trigger( touchEndEvt );
				});
			});
		},

		_removeEvent: function () {
			var view = this.element,
				control = view.parent( ".ui-multimediaview-wrap" ).find( ".ui-multimediaview-control" ),
				playpauseButton = control.find( ".ui-playpausebutton" ),
				fullscreenButton = control.find( ".ui-fullscreenbutton" ),
				seekBar = control.find( ".ui-seekbar" ),
				volumeControl = control.find( ".ui-volumecontrol" ),
				volumeBar = volumeControl.find( ".ui-volumebar" ),
				volumeHandle = volumeControl.find( ".ui-handle" );

			view.unbind( ".multimediaview" );
			playpauseButton.unbind( ".multimediaview" );
			fullscreenButton.unbind( ".multimediaview" );
			seekBar.unbind( ".multimediaview" );
			volumeBar.unbind( ".multimediaview" );
			volumeHandle.unbind( ".multimediaview" );
		},

		_createControl: function () {
			var view = this.element,
				viewElement = view[0],
				control = $( "<span></span>" ).addClass( "ui-multimediaview-control" ),
				playpauseButton = $( "<span></span>" ).addClass( "ui-playpausebutton ui-button ui-play-icon" ),
				seekBar = $( "<span></span>" ).addClass( "ui-seekbar ui-multimediaview-bar" ),
				timestampLabel = $( "<span><p>00:00:00</p></span>" ).addClass( "ui-timestamplabel" ),
				durationLabel = $( "<span><p>00:00:00</p></span>" ).addClass( "ui-durationlabel" ),
				volumeButton = $( "<span></span>" ).addClass( "ui-volumebutton ui-button" ),
				volumeControl = $( "<span></span>" ).addClass( "ui-volumecontrol" ),
				volumeBar = $( "<div></div>" ).addClass( "ui-volumebar ui-multimediaview-bar" ),
				volumeGuide = $( "<span></span>" ).addClass( "ui-guide ui-multimediaview-bar-bg" ),
				volumeValue = $( "<span></span>" ).addClass( "ui-value ui-multimediaview-bar-highlight" ),
				volumeHandle = $( "<span></span>" ).addClass( "ui-handle" ),
				fullscreenButton = $( "<span></span>" ).addClass( "ui-fullscreenbutton ui-button" ),
				durationBar = $( "<span></span>" ).addClass( "ui-duration ui-multimediaview-bar-bg" ),
				currenttimeBar = $( "<span></span>" ).addClass( "ui-currenttime ui-multimediaview-bar-highlight" );

			seekBar.append( durationBar ).append( currenttimeBar ).append( durationLabel ).append( timestampLabel );

			volumeButton.addClass( viewElement.muted ? "ui-mute-icon" : "ui-volume-icon" );
			volumeBar.append( volumeGuide ).append( volumeValue ).append( volumeHandle );
			volumeControl.append( volumeBar );

			control.append( playpauseButton ).append( seekBar ).append( volumeControl ).append( volumeButton );

			if ( this._isVideo ) {
				$( fullscreenButton ).addClass( "ui-fullscreen-on" );
				control.append( fullscreenButton );
			}
			volumeControl.hide();

			return control;
		},

		_startTimer: function ( duration ) {
			this._endTimer();

			if ( !duration ) {
				duration = 3000;
			}

			var self = this,
				view = self.element,
				control = view.parent( ".ui-multimediaview-wrap" ).find( ".ui-multimediaview-control" ),
				volumeControl = control.find( ".ui-volumecontrol" );

			self.controlTimer = setTimeout( function () {
				self.isVolumeHide = true;
				self.controlTimer = null;
				volumeControl.hide();
				control.fadeOut( "fast" );
			}, duration );
		},

		_endTimer: function () {
			if ( this.controlTimer ) {
				clearTimeout( this.controlTimer );
				this.controlTimer = null;
			}
		},

		_convertTimeFormat: function ( systime ) {
			if ( !$.isNumeric( systime ) ) {
				return "Playback Error";
			}

			var ss = parseInt( systime % 60, 10 ).toString(),
				mm = parseInt( ( systime / 60 ) % 60, 10 ).toString(),
				hh = parseInt( systime / 3600, 10 ).toString(),
				time =	( ( hh.length < 2  ) ? "0" + hh : hh ) + ":" +
						( ( mm.length < 2  ) ? "0" + mm : mm ) + ":" +
						( ( ss.length < 2  ) ? "0" + ss : ss );

			return time;
		},

		_updateSeekBar: function ( currenttime ) {
			var view = this.element,
				viewElement = view[0],
				duration = viewElement.duration,
				control = view.parent( ".ui-multimediaview-wrap" ).find( ".ui-multimediaview-control" ),
				seekBar = control.find(  ".ui-seekbar"  ),
				durationBar = seekBar.find( ".ui-duration" ),
				currenttimeBar = seekBar.find( ".ui-currenttime" ),
				timestampLabel = control.find( ".ui-timestamplabel" ),
				durationOffset = durationBar.offset(),
				durationWidth = durationBar.width(),
				durationHeight = durationBar.height(),
				timebarWidth = 0;

			if ( typeof currenttime === "undefined" ) {
				currenttime = viewElement.currentTime;
			}
			timebarWidth = parseInt( currenttime / duration * durationWidth, 10 );
			durationBar.offset( durationOffset );
			currenttimeBar.offset( durationOffset ).width( timebarWidth );
			timestampLabel.find( "p" ).text( this._convertTimeFormat( currenttime ) );
		},

		_updateVolumeState: function () {
			var view = this.element,
				control = view.parent( ".ui-multimediaview-wrap" ).find( ".ui-multimediaview-control" ),
				volumeControl = control.find( ".ui-volumecontrol" ),
				volumeButton = control.find( ".ui-volumebutton" ),
				volumeBar = volumeControl.find( ".ui-volumebar" ),
				volumeGuide = volumeControl.find( ".ui-guide" ),
				volumeValue = volumeControl.find( ".ui-value" ),
				volumeHandle = volumeControl.find( ".ui-handle" ),
				handlerWidth = volumeHandle.width(),
				handlerHeight = volumeHandle.height(),
				volumeGuideHeight = volumeGuide.height(),
				volumeGuideWidth = volumeGuide.width(),
				volumeGuideTop = 0,
				volumeGuideLeft = 0,
				volumeBase = 0,
				handlerOffset = null,
				volume = view[0].volume;

			volumeGuideTop = parseInt( volumeGuide.offset().top, 10 );
			volumeGuideLeft = parseInt( volumeGuide.offset().left, 10 );
			volumeBase = volumeGuideLeft;
			handlerOffset = volumeHandle.offset();
			handlerOffset.top = volumeGuideTop - parseInt( ( handlerHeight - volumeGuideHeight ) / 2, 10 );
			handlerOffset.left = volumeBase + parseInt( volumeGuideWidth * volume, 10 ) - parseInt( handlerWidth / 2, 10 );
			volumeHandle.offset( handlerOffset );
			volumeValue.offset( volumeGuide.offset() ).width( parseInt( volumeGuideWidth * ( volume ), 10 ) );
		},

		_setVolume: function ( value ) {
			var viewElement = this.element[0];

			if ( value < 0.0 || value > 1.0 ) {
				return;
			}

			viewElement.volume = value;
		},

		width: function ( value ) {
			if ( this.options.fullScreen ) {
				return;
			}

			var view = this.element,
				wrap = view.parent( ".ui-multimediaview-wrap" );

			if ( arguments.length === 0 ) {
				return view.width();
			}

			if ( !this._isVideo ) {
				wrap.width( value );
			}

			view.width( value );
			this._resize();
		},

		height: function ( value ) {
			if ( !this._isVideo || this.options.fullScreen ) {
				return;
			}

			var view = this.element;

			if ( arguments.length === 0 ) {
				return view.height();
			}

			view.height( value );
			this._resize();
		},

		fullScreen: function ( value ) {
			if ( !this._isVideo ) {
				return;
			}

			var view = this.element,
				option = this.options;

			if ( arguments.length === 0 ) {
				return option.fullScreen;
			}

			view.parents( ".ui-scrollview-clip" ).scrollview( "scrollTo", 0, 0 );

			this.options.fullScreen = value;

			this._resize();
		},

		refresh: function () {
			this._resize();
		}
	});

	$( document ).bind( "pagecreate create", function ( e ) {
		$.tizen.multimediaview.prototype.enhanceWithin( e.target );
	}).bind( "pagechange", function ( e ) {
		$( e.target ).find( ".ui-multimediaview" ).each( function () {
			var view = $( this ),
				viewElement = view[0];

			if ( viewElement.autoplay ) {
				viewElement.play();
			}
			view.multimediaview( "refresh" );
		});
	}).bind( "pagebeforechange", function ( e ) {
		$( e.target ).find( ".ui-multimediaview" ).each( function () {
			var view = $( this ),
				viewElement = view[0],
				isFullscreen = view.multimediaview( "fullScreen" );

			if ( isFullscreen ) {
				view.multimediaview( "fullScreen", !isFullscreen );
			}

			if ( viewElement.played.length !== 0 ) {
				viewElement.pause();
			}
		});
	});

	$( window ).bind( "resize orientationchange", function ( e ) {
		$( ".ui-page-active" ).find( ".ui-multimediaview" ).multimediaview( "refresh" );
	});

} ( jQuery, document, window ) );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
} );
//>>excludeEnd("jqmBuildExclude");
