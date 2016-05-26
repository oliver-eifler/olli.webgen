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
    this.dom = false;
    this.path = false;

    console.log("WebGen");
    this.load(path);

    return this;
};
WebGen.prototype.load = function (path) {
    var data = false;

    if (_.isString(path) && path != "") {
        this.path = path;
        try {
            data = fs.readFileSync(path, this.options.encoding);
            this.dom = cheerio.load(data, this.options.cheerio);
            console.log(" => %s parsed", this.path);
        } catch (err) {
            console.log(" => %s", err.message);
            this.path = this.dom = data = false;
        }
    }
    return this;
};
WebGen.prototype.save = function (path) {
    if (this.dom && _.isString(path) && path != "") {
        try {
            fs.writeFileSync(path, this.dom.html(), this.options.encoding);
            console.log(" => saved to %s", path);
        } catch (err) {
            console.log(" => %s", err.message);
        }
    }
    return this;

}

WebGen.prototype.process = function () {
    if (!this.dom)
        return this;

    var plugins = this.options.plugins,
        dom = this.dom;
    Object.keys(plugins).forEach(function (name) {
        var options = plugins[name];
        if (options !== null) {
            var fn = require("./plugins/" + name);
            fn(dom, options);
            console.log(" => Plugin: %s", name);
        }
    });
    return this;
};
WebGen.prototype.toString = function () {
    return this.dom ? this.dom.html() : "<empty>";
};
WebGen.prototype.options = {
    encoding: "utf8",
    plugins: {
        "minify": {}
    },
    cheerio: {
        withDomLvl1: true,
        normalizeWhitespace: true,
        xmlMode: false,
        decodeEntities: false,
        recognizeSelfClosing: true
    }
};
//Statics
WebGen.defaultOptions = function () {
    return _.defaults({}, WebGen.prototype.options);
};