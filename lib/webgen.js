/**
 * Created by darkwolf on 22.05.2016.
 */
var fs = require("fs"),
    cheerio = require('cheerio'),
_ = require("lodash");


var WebGen = module.exports = function (path, options) {
    if (!(this instanceof WebGen)) return new WebGen(path, options);

    if (arguments.length == 1) {
        if (!_.isString(path)) {
            options = path;
            path = void 0;
        }
    }
    this.options = _.defaultsDeep(options || {}, this.options);
    console.log(this.options);
    this.dom = false;
    this.path = false;

    this.load(path);

    return this;
};
WebGen.prototype.load = function (path) {
    var data =false;
    
    if (_.isString(path) && path != "") {
        this.path = path;
        try {
            data = fs.readFileSync(path, this.options.encoding);
        } catch (err) {
            this.path = this.dom = data = false;
        }
        this.dom = cheerio.load(data, this.options.cheerio);    
    
    
    
    }


        return this;
    };

    WebGen.prototype.process = function () {
        var dom = this.dom;
        ["./plugins/minify","./plugins/image"].forEach(function(name) {
            var plugin = require(name);
            plugin(dom, {});
        });
        return this;
    };
    WebGen.prototype.toString = function () {
        return this.dom?this.dom.html():"<empty>";
    };
    WebGen.prototype.options = {
        encoding: "utf8",
        plugins: {},
        cheerio: {
            withDomLvl1: true,
            normalizeWhitespace: true,
            xmlMode: false,
            decodeEntities: true,
            recognizeSelfClosing: true
        }
    };
//Statics
    WebGen.defaultOptions = function () {
        return _.defaults({}, WebGen.prototype.options);
    };