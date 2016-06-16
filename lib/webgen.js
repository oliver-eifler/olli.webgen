/**
 * Created by darkwolf on 22.05.2016.
 */
var fs = require("fs"),
    cheerio = require('cheerio'),
    _ = require("lodash"),
    moment = require("moment"),
    yaml = require("yamljs");



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
    var $this = this,
        data = false;

    if (_.isString(path) && path != "") {
        this.path = path;
        try {
            var fileStat = fs.lstatSync(path);
            this.options.data = _.extend($this.options.data,{
                created: fileStat.birthtime,
                tsCreated: parseInt(fileStat.birthtime.getTime()/1000),
                modified: fileStat.mtime,
                tsModified: parseInt(fileStat.mtime.getTime()/1000)
            });
            data = fs.readFileSync(path, this.options.encoding);
            //read metadata
            var regexp = /\s*---([\s\S]*?)---\s*/gi;
            data = data.replace(regexp,function(match,meta) {
                $this.options.data = _.extend($this.options.data,yaml.parse(meta)||{});
                return "";
                
            });
            var compiled = _.template(data,{  'imports': { 'moment': moment},'variable': 'data' });
            data = compiled($this.options.data);

            var tmpl = this.options.data.template || false;
            if (_.isString(tmpl)) {
                var content = data;
                data = fs.readFileSync(tmpl, this.options.encoding);
                data = data.replace(regexp,function(match,meta) {
                    //$this.options.data = _.extend($this.options.data,yaml.parse(meta)||{});
                    return "";
                });
                compiled = _.template(data,{  'imports': { 'moment': moment,'content':content},'variable': 'data' });
                data = compiled($this.options.data);
            }
            _.unset(this.options.data,"template");

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
        var data = this.options.data;
        var buffer = "<?php\n";
        Object.keys(data).forEach(function (key) {
            var value = data[key];
            if (typeof value !== "function")
                buffer += "$" + key + " = $page->" + key + " = " + JSON.stringify(value) + ";\n";
        });

        buffer += "ob_start();\n";
        buffer += "?>" + this.dom.html() + "<?php\n";
        buffer += "$page->html = ob_get_contents();\nob_end_clean();\n";
        buffer += "\?>";

        try {
            fs.writeFileSync(path, buffer, this.options.encoding);
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
            fn.call(this,dom, options);
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
    },
    data: {prop: function (name) {
        return name ? name + "1234" : "__" + "1234" + "__";
    },
        timestamp: function () {
            return moment(this.created).format("LL");


        }
    }
};
//Statics
WebGen.defaultOptions = function () {
    return _.defaults({}, WebGen.prototype.options);
};