#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var commander_1 = __importDefault(require("commander"));
var request_1 = require("./request");
var token_1 = require("./token");
var appPackage = require('../package.json');
var getEndpointUrl = undefined;
var feed = undefined;
commander_1.default
    .name('event-data-reader')
    .description('Command line tool for reading event data from 10Duke Event Data service.')
    .version(appPackage.version)
    .arguments('<getEndpointUrl> <feed>')
    .action(function (getEndpointUrlArg, feedArg) {
    getEndpointUrl = getEndpointUrlArg;
    feed = feedArg;
})
    .option('-a, --after <after>', 'Timestamp from which events are requested, in nanoseconds since the Epoch. If not specified, reading starts from the oldest event.')
    .option('-b, --before <before>', 'Timestamp until which events are requested, in nanoseconds since the Epoch. If not specified, reads until no newer events available.')
    .requiredOption('-k, --key <privateKeyFile>', 'private key file, used for building authorization token')
    .option('-m, --max-event-count <maxEventCount>', 'maximum number of events to return per request', '500')
    //    .option('-n, --newest', 'instruct to return newest events in case that number of events returned is limited by --max-event-count')
    .option('-x, --max-rounds <maxRounds>', 'maximum number of requests to send in order to get all events between --after and --before, or -1 for unlimited / until all retrieved', '1')
    .option('-r, --max-retries <maxRetries>', 'maximum number of retries if a request fails', '1')
    .option('-o, --output <filePath>', 'File for writing events received from the server. If not specified, writes to stdout.')
    .option('-d, --debug', 'output debug info (default: no debug output)')
    .parse(process.argv);
if (!getEndpointUrl) {
    console.error(chalk_1.default.red('error: missing required argument \'getEndpointUrl\''));
    process.exit(1);
}
if (!feed) {
    console.error(chalk_1.default.red('error: missing required argument \'feed\''));
    process.exit(1);
}
var options = {
    debug: commander_1.default.debug !== undefined,
    getEndpointUrl: getEndpointUrl,
    feed: feed,
    privateKeyFile: commander_1.default.key,
    after: commander_1.default.after,
    before: commander_1.default.before,
    maxEventCount: commander_1.default.maxEventCount,
    newest: commander_1.default.newest !== undefined,
    maxRounds: Number.parseInt(commander_1.default.maxRounds),
    outputFile: commander_1.default.output,
    maxRetries: Number.parseInt(commander_1.default.maxRetries),
};
if (options.debug) {
    console.log(chalk_1.default.gray(JSON.stringify(options)));
}
var key = token_1.readKey(options.privateKeyFile);
var token = token_1.createToken(options.feed, key);
request_1.readEvents(options, token);
//# sourceMappingURL=index.js.map