/**
 * Created by darkwolf on 22.05.2016.
 */
(function() {
    module.exports = function(dom,options) {
        dom.root().find('*').contents()
            .filter(function () {
                if (this.type === 'comment')
                    return true;
                if (this.type === 'text') {
                    if (this.data.replace(/^\s+|\s+$/g, '').trim() == "")
                        return true;
                    if (!dom(this).closest("pre").length)
                        this.data = this.data.replace(/^\s+|\s+/g, " ");
                }
                return false;
            })
            .remove();
        console.log("minify finished");
    }
})();