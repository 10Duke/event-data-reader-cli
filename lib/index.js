#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var commander_1 = __importDefault(require("commander"));
var appPackage = require('../package.json');
var defaultFilePath = '.';
var defaultGitlabHost = 'https://king.10duke.com';
var defaultTag = new Date().toISOString().replace(/\.\d{3}Z/, 'Z').replace(/[-:\.]/g, '');
commander_1.default
    .name('event-data-reader')
    .description('Command line tool for reading event data from 10Duke Event Data service.')
    .version(appPackage.version)
    .arguments('<url>')
    .option('-d, --debug', 'output debug info (default: no debug output)')
    .parse(process.argv);
var debug = commander_1.default.debug !== undefined;
var url = commander_1.default.url;
var options = {
    debug: debug,
    url: url,
};
if (debug) {
    console.log(chalk_1.default.gray(JSON.stringify(options)));
}
//# sourceMappingURL=index.js.map