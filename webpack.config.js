const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/index.js",
    mode: "production",
    devtool: "source-map",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./src/index.html", to: "" },
                { from: "./src/favicon.ico", to: "" },
            ]
        })
    ],
};