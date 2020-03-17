#!/usr/bin/env node

import chalk from 'chalk';
import program from 'commander';

import { Options } from './options';
import { readEvents } from './request';
import { readKey, createToken } from './token';

const appPackage = require('../package.json');

let getEndpointUrl: string | undefined = undefined;
let feed: string | undefined = undefined;
program
    .name('event-data-reader')
    .description('Command line tool for reading event data from 10Duke Event Data service.')
    .version(appPackage.version)
    .arguments('<getEndpointUrl> <feed>')
    .action((getEndpointUrlArg, feedArg) =>  {
        getEndpointUrl = getEndpointUrlArg;
        feed = feedArg;
    })
    .option('-a, --after <after>', 'timestamp from which events are requested, in nanoseconds since the Epoch')
    .option('-b, --before <before>', 'timestamp until which events are requested, in nanoseconds since the Epoch')
    .requiredOption('-k, --key <privateKeyFile>', 'private key file')
    .option('-m, --max-event-count <maxEventCount>', 'maximum number of events to return', '1000')
//    .option('-n, --newest', 'instruct to return newest events in case that number of events returned is limited by --max-event-count')
    .option('-x, --max-rounds <maxRounds>', 'maximum number of requests to send in order to get all events between --after and --before, or -1 for unlimited / until all retrieved', '1')
    .option('-r, --max-retries <maxRetries>', 'maximum number of retries if request fails', '1')
    .option('-o, --output <filePath>', 'file for writing events received from the server')
    .option('-d, --debug', 'output debug info (default: no debug output)')
    .parse(process.argv);

if (!getEndpointUrl) {
    console.error(chalk.red('error: missing required argument \'getEndpointUrl\''));
    process.exit(1);
}
if (!feed) {
    console.error(chalk.red('error: missing required argument \'feed\''));
    process.exit(1);
}

const options = {
    debug: program.debug !== undefined,
    getEndpointUrl,
    feed,
    privateKeyFile: program.key,
    after: program.after,
    before: program.before,
    maxEventCount: program.maxEventCount,
    newest: program.newest !== undefined,
    maxRounds: Number.parseInt(program.maxRounds),
    outputFile: program.output,
    maxRetries: Number.parseInt(program.maxRetries),
} as Options;

if (options.debug) {
    console.log(chalk.gray(JSON.stringify(options)));
}

const key = readKey(options.privateKeyFile);
const token = createToken(options.feed, key);

readEvents(options, token);
