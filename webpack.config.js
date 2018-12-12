var path = require('path');

module.exports = {
    output: {
        filename: 'giza.js'
    },

    devServer: {
        // contentBase: path.join(__dirname, 'dist'),
        compress: true,
        historyApiFallback: true,
        port: 9000,
        open: 'chrome'
    }
};
