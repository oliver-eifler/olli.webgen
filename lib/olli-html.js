/**
 * Created by darkwolf on 16.05.2016.
 */
var fs = require('fs');
var cheerio = require('cheerio');
var imageSize = require('image-size');
var webgen = require('olli.webgen');
webgen();
console.log(webgen.version);
console.log(webgen.defaults);
var html = "<h1>Olli <br>Tag Test</h1>\n<olli-img data-reflow src='images/welpe.jpg'>Titel: <b>Welpe</b></olli-img>\n"
    + "<olli-img class='box  4711 4988  box bla' async='true' zoom src='images/pult.jpg' data='cut'/>\n"
    + "<olli-img src='images/faultier.jpg' width='456' height='123'>Titel: <b>Just<br> Relaxing</b></olli-img>\n<p><i>Does it work?</i></p>";
html = fs.readFileSync("web/_assets/pages/test.html", "utf8");
var defaults = {
    width: 640,
    height: 480
};

var default_attr = {
    width: "auto",
    height: "auto",
    zoom: true,
    src: false,
    async: true
};
var default_picture = {
    width: "auto",
    height: "auto",
    zoom: false,
    src: false,
    async: false
};


var $ = cheerio.load(html, {recognizeSelfClosing: true});
//cleanup
$.root().find('*').contents()
    .filter(function () {
        if (this.type === 'comment')
            return true;
        if (this.type === 'text') {
            if (this.data.replace(/^\s+|\s+$/g, '').trim() == "")
                return true;
            if (!$(this).closest("pre").length)
                this.data = this.data.replace(/^\s+|\s+/g, " ");
        }
        return false;
    })
    .remove();


var images = $('olli-img').toArray();
images.forEach(function (node) {
    processImage($(node));
});
fs.writeFileSync("web/pages/test.html", $.html(), "utf8");

function processImage(node) {
    var options = getNodeOptions(node, default_picture, default_attr);
    /* get width/height from Image */
    var size = getImageSize("web/" + options.src);
    if (options.width === "auto")
        options.width = size.width;
    if (options.height === "auto")
        options.height = size.height;
    if (options.width == 0 || options.height == 0) {
        options.width = options.height = 100;
        options.zoom = false;
    }

    var box = $('<div></div>');
    //add classes
    ['box', 'pic'].concat(options.class).forEach(function (name) {
        box.addClass(name)
    });
    //add attributes
    Object.keys(options.attr).forEach(function (key) {
        box.attr(key, options.attr[key])
    });
    //style it
    if (!options.zoom) {
        box.css("max-width", options.width + "px");
    }
    //Dummy for aspect Ratio
    var dummy = $('<div></div>');
    dummy.addClass("box-dummy");
    dummy.css("padding-bottom", round(options.height * 100 / options.width, 5) + "%");
    box.append(dummy);
    //the image
    var image = $('<img>');
    image.addClass("box-embed");
    image.attr(options.async ? "data-src" : "src", options.src);
    box.append(image);
    if (options.async) {
        image = $('<img>');
        image.addClass("box-embed");
        image.attr("src", options.src);
        box.append(image);
        image.wrap("<noscript></noscript>");
    }
    //and now the caption
    if (options.caption != "") {
        box.append("<div class='caption'><div class='caption-text'>" + options.caption + "</div></div>")
    }


    node.replaceWith(box);


    function getNodeOptions(node, defaults, defAttr) {
        var opt = extend({}, defaults),
            attr = node.attr(),
            _class = [],
            _attr = [];
        Object.keys(attr).forEach(function (key) {
            var value = attr[key];
            key = key.toLowerCase();
            if (key == "class" && typeof value === "string") {
                _class = value.split(" ").map(trimString).filter(isStringNotEmpty).reduce(noStringDub, []);
            }
            else if (opt.hasOwnProperty(key)) {
                opt[key] = value == "" ? defAttr[key] : toValue(value);
            }
            else
                _attr[key] = value;
        });
        opt["class"] = _class;
        opt["attr"] = _attr;
        opt["caption"] = node.html();

        return opt;
    }

}
function toValue(str) {
    try {
        return JSON.parse(str);
    }
    catch (err) {
        return str;
    }
}
function trimString(str) {
    return (typeof str === "string") ? str.trim() : "";
};
function isStringNotEmpty(obj) {
    return ((typeof obj === "string") && obj.trim() != "");
};
function noStringDub(accum, current) {
    if (accum.indexOf(current) < 0) {
        accum.push(current);
    }
    return accum;
}
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function getImageSize(path) {
    if (fileExists(path))
        return imageSize(path);
    return {width: defaults.width, height: defaults.height}
}

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
}
function extend(target, source) {
    for (var i in source) {
        if (source.hasOwnProperty(i)) {
            target[i] = source[i];
        }
    }
    return target;
}
