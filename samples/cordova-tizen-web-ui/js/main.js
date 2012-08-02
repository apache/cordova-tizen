var deviceReady = false;

var init = function () {
    console.log("init() called");
    $("#myButton").click(function () {
        $(this).remove();
        $("#myInfo").show();
        window.addEventListener("batterystatus", function(info) {
            $("#myInfo").text("Level = " + info.level + "%, Status: " + ((info.isPlugged) ? "Plugged" : "Unplugged"));
        }, false);
    });
    
};

window.onload = function () {
    document.addEventListener("deviceready", function () {
       deviceReady = true;
       console.log("Device = " + device.platform + ", Version = " + device.version);
       $(document).ready(init);
    }, false);

    window.setTimeout(function() {
        if (!deviceReady) {
            alert("Cordova initialization failed !!!");
        }
    }, 1000);
};
