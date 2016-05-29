/**
 * Created by darkwolf on 22.05.2016.
 */
var plugin = "./index.js";
var webgen = require("./index.js");
var doc = new webgen("test/test.olli.html",{cheerio:{decodeEntities:false},
    plugins:{"minify":{},"image":{imagePath:"test/",forceFrame:true}}});
doc.process();
doc.save("test/final.html");


