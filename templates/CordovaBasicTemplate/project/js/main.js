var deviceReady = false;

function startBatteryInfoMonitoring() {
	window.addEventListener("batterystatus", function (info) {
		var batteryInfoStr = "Level = " + info.level + "%, Status: " + ((info.isPlugged) ? "Plugged" : "Unplugged");
		document.getElementById('divbutton1').innerHTML = batteryInfoStr;
	}, false);
}

// Initialize function called when page loading is finished
var init = function () {
    console.log("init() called");
    document.addEventListener("deviceready", function() {
        deviceReady = true;
        console.log("Device = " + device.platform + ", Version = " + device.version);
    }, false);

    window.setTimeout(function() {
        if (!deviceReady) {
            alert("Cordova initialization failed !!!");
        }
    }, 1000);
};

window.onload = init;
