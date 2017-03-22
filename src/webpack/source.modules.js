'use strict';
const path = require('path');

const node_modules = path.resolve(process.cwd(), 'node_modules');
// 需要源码打包的模块，正则，相对 node_modules 的位置


module.exports = function(options) {
    const source_position = [
        /miox[^\/]*\// // miox 开头的包默认源码打包 miox*
    ];
    let dir = path.normalize(options.entry.dir).replace(/\/$/, '').replace(/\//g, '\\/');
    source_position.push(new RegExp(`^\.\.\/${dir}\/`));

    return function source_modules(pather){
        const position = path.relative(node_modules, pather);
        let i = source_position.length;

        while (i--) {
            if (source_position[i].test(position)) {
                return true;
            }
        }

        return false;
    }
}