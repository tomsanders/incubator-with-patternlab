var exports = module.exports = {};

exports.scripts = function (paths) {
    return [
        paths.webAppJavaScriptRoot + 'gatagmanager.js',
        paths.webAppJavaScriptRoot + 'site.js',
    ];
};
