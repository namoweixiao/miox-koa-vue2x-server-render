'use strict';

var path = require('path');
// 需要源码打包的模块，正则，相对 node_modules 的位置


module.exports = function (options) {
    var node_modules = path.resolve(options.cwd, 'node_modules');
    var source_position = [/miox[^\/]*\// // miox 开头的包默认源码打包 miox*
    ];
    var dir = path.normalize(options.entry.dir).replace(/\/$/, '').replace(/\//g, '\\/');
    source_position.push(new RegExp('^../' + dir + '/'));

    return function source_modules(pather) {
        var position = path.relative(node_modules, pather);
        var i = source_position.length;

        while (i--) {
            if (source_position[i].test(position)) {
                return true;
            }
        }

        return false;
    };
};