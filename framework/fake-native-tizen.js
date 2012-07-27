var tizen = {
	systeminfo: {}
};

tizen.systeminfo.getPropertyValue = function(name, successCallback, errorCallback) {
	if (name === "Device") {
		successCallback({model:"Tizen device", imei:"111111111", version:"1.0"});
	}
};
