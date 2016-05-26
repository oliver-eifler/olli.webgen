/**
 * Created by darkwolf on 22.05.2016.
 */
var imageSize = require('image-size'),
    url = require('url'),
    _ = require("lodash");

(function() {
    var defaultOptions = {
        width: 640,
        height: 480,
        imagePath: "",
        forPrint:false,
        forceFrame: void 0,
        forceAsync: void 0
    };

    var emptyAttr = {
        width: "auto",
        height: "auto",
        zoom: true,
        src: false,
        async: true,
        frame: true
    };
    var defaultAttr = {
        width: "auto",
        height: "auto",
        zoom: false,
        src: false,
        async: false,
        frame: false
    };








    module.exports = function(dom,options) {
        
        options = _.defaultsDeep(options || {}, defaultOptions);


        var images = dom('olli-img').toArray();
        images.forEach(function (node) {
            processImage(dom,dom(node),options);
        });
    };
    function processImage(dom,node,options) {
        var attr = getNodeOptions(node, defaultAttr, emptyAttr);
        var isUrl = !!url.parse(attr.src).protocol;
        var size={width:options.width,height:options.height};
        
        if (!isUrl) { 
            var imagePath = (options.imagePath ? options.imagePath : "") + attr.src;
            try {
                size = imageSize(imagePath);
            } catch(err) {}
        }
        
        if (attr.width === "auto")
            attr.width = size.width;
        if (attr.height === "auto")
            attr.height = size.height;
        if (attr.width == 0 || attr.height == 0) {
            attr.width = attr.height = 100;
            attr.zoom = false;
        }
        if (options.forceAsync != void 0) {
            attr.async = options.forceAsync;
        }
        if (options.forceFrame != void 0) {
            attr.frame = options.forceFrame;
        }
        if (options.forPrint === true) {
            attr.async = false;
            attr.frame = false;
        }
        
        var box = dom('<div></div>');
        //add classes
        ['box', 'pic'].concat(attr.class).forEach(function (name) {
            box.addClass(name)
        });
        //add attributes
        Object.keys(attr.attr).forEach(function (key) {
            box.attr(key, attr.attr[key])
        });
        //style it
        if (!attr.zoom) {
            box.css("max-width", attr.width + "px");
        }
        //Dummy for aspect Ratio
        var dummy = dom('<div></div>');
        dummy.addClass("box-dummy");
        dummy.css("padding-bottom", round(attr.height * 100 / attr.width, 5) + "%");
        box.append(dummy);
        //the image
        var image;
        if (attr.frame) {
            attr.async = true;
            image = dom("<iframe scrolling='no' data-type='img' allowtransparency='true' frameborder='0'></iframe>");
        }
        else {
            image = dom('<img>');
        }
        
        image.addClass("box-embed");
        image.attr(attr.async ? "data-src" : "src", attr.src);
        box.append(image);
        if (attr.async) {
            image = dom('<img>');
            image.addClass("box-embed");
            image.attr("src", attr.src);
            box.append(image);
            image.wrap("<noscript></noscript>");
        }
        //and now the caption
        if (attr.caption != "") {
            box.append("<div class='caption'><div class='caption-text'>" + attr.caption + "</div></div>")
        }
        node.replaceWith(box);


        function getNodeOptions(node, defaults, emptyAttr) {
            var opt = _.extend({}, defaults),
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
                    opt[key] = (value == "" || value == key) ? emptyAttr[key] : toValue(value);
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

})();