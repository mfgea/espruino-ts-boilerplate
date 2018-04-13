const gulp = require('gulp');
const fs = require("fs");
const { fork } = require('child_process');
const flatten = require('flat');
const path = require("path");
const yaml = require("js-yaml");
const _ = require("lodash");
const replace = require("gulp-string-replace");
const rollup = require("gulp-better-rollup");
const rollupTypescript = require("rollup-plugin-typescript");
const rollupReplace = require("rollup-plugin-replace");
const rollupUglify = require("rollup-plugin-uglify");
const minify = require("uglify-js").minify;

const envConfig = yaml.load(fs.readFileSync("./config/env-config.yaml"));

const srcDir = "./src";
const distDir = "./dist";

const appTsFileName = "app.ts";
const bundleFileName = "bundle.js";
const bundleFilePath = path.join(distDir, bundleFileName);

function rollupConfigFactory(debug=true) {
    const appConfig = yaml.load(fs.readFileSync("./config/app-config.yaml"));
    let userAppConfig;
    try {
        userAppConfig = yaml.load(fs.readFileSync("./config/app-config.user.yaml"));
    } catch (e) {
        userAppConfig = {};
    }

    const config = Object.assign({}, appConfig, userAppConfig);
    const replaceValues = _.mapValues(flatten({ __CONFIG__: config }), v => {
        if(typeof v === 'string' && v.match(/^(NodeMCU\.)?D\d{1,2}/)) {
            return v;
        }
        return JSON.stringify(v);
    });

    const plugins = [
        rollupTypescript({ typescript: require("typescript") }),
        rollupReplace({ values: replaceValues }),
    ];

    if(!debug) {
        plugins.push(
            rollupUglify({
                // output: { beautify: true }, // Activate for debugging purposes
                compress: true,
                mangle: { reserved: ['onInit'], toplevel: true },
            }, minify)
        );
    }

    return {
        options: { plugins },
        output: { format: 'cjs', file: bundleFileName }
    };
}

function isDebug() {
    return Array.from(process.argv).includes('--debug');
}

gulp.task("build", function(cb) {
    const rollupConfig = rollupConfigFactory(isDebug());

    gulp.src(path.join(srcDir, appTsFileName))
        .pipe(rollup(rollupConfig.options, rollupConfig.output))
        .pipe(replace("'use strict';", ''))
        .pipe(replace('"use strict";', ''))
        .pipe(gulp.dest(distDir))
        .on('end', () => cb());
});

gulp.task("send-to-espruino", ["build"], (cb) => {
    const buildproc = fork(
        require.resolve("espruino/bin/espruino-cli"),
        ["--board", envConfig.board, "-b", envConfig.port_speed, "--port", envConfig.port, bundleFilePath]
    );
    buildproc.on('close', () => cb());
});
