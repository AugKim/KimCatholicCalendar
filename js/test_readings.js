var fs = {
    readFileSync: function(path) {
        var app = Application.currentApplication();
        app.includeStandardAdditions = true;
        return app.doShellScript('cat "' + path + '"');
    }
};

var READINGS_DATA = [];
var READINGS_SUNDAY = {};
eval(fs.readFileSync('/Library/WebServer/Documents/Calendar/Reading/readingdata.js'));
eval(fs.readFileSync('/Library/WebServer/Documents/Calendar/Reading/Sunday.js'));

// Mock required functions for controller
var CACHE = { get: function(){}, set: function(){} };
var LUNAR_CALENDAR = { isTetDay: function(){return 0;} };

eval(fs.readFileSync('/Library/WebServer/Documents/Calendar/js/controller.js'));

try {
    var res = getFullReadings("4080", null, null, 0, "C", "2");
    console.log("Results length: " + res.length);
    if(res.length > 0) {
        var data = res[0].data;
        console.log("Type: " + res[0].type);
        console.log("Has Gospel Content: " + (data && data.gospel && data.gospel.content ? "YES" : "NO"));
        if(data && data.gospel && data.gospel.content) {
            console.log("Substring: " + data.gospel.content.substring(0, 50));
        } else {
            console.log("Data keys: " + Object.keys(data).join(", "));
        }
    }
} catch(e) {
    console.log("Error: " + e.toString());
}
