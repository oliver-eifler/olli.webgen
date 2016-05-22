/**
 * Created by darkwolf on 22.05.2016.
 */
var plugin = "./index.js";
var webgen = require(plugin);
var doc = new webgen("test/test.olli.html",{cheerio:{decodeEntities:false}});
doc.process();
console.log(doc.toString());
