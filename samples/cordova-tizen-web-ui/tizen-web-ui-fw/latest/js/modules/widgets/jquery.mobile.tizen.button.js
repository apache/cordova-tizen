//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Tizen button
//>>label: Button
//>>group: Tizen:Widgets
define( [
	"jqm/widgets/forms/button"
	], function ( ) {
} );
//>>excludeEnd("jqmBuildExclude");

/**
	@class Button
	The button widget shows a control on the screen that you can use to generate an action event when it is pressed and released. This widget is coded with standard HTML anchor and input elements and then enhanced by jQueryMobile to make it more attractive and usable on a mobile device. Buttons can be used in Tizen as described in the jQueryMobile documentation for buttons.

	To add a button widget to the application, use the following code

		<div data-role="button" data-inline="true">Text Button Test</div>
		<div data-role="button" data-inline="true" data-icon="plus" data-style="circle"></div>
		<div data-role="button" data-inline="true" data-icon="plus" data-style="nobg"></div>

	The button can define callbacks for events as described in the jQueryMobile documentation for button events.<br/>
	You can use methods with the button as described in the jQueryMobile documentation for button methods.
*/

/**
	@property {String} data-style
	Defines the button style. <br/> The default value is box. If the value is set to circle, a circle-shaped button is created. If the value is set to nobg, a button is created without a background.

*/
/**
	@property {String} data-icon
	Defines an icon for a button. Tizen supports 12 icon styles: reveal, closed, opened, info, rename, call, warning, plus, minus, cancel, send, and favorite.

*/

