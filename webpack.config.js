const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./src/index.html", to: "" },
                { from: "./src/favicon.ico", to: "" },
            ]
        })
    ],
};