/**
 * Created by evio on 2017/3/24.
 */
module.exports = {
    entry: {
        dir: 'example',
        filename: 'index.js'
    },
    build: 'dist',
    prefix: '/web',
    loaders: ['css', 'less', 'sass', 'jsx']
};