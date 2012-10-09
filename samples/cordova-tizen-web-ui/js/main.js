/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

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
