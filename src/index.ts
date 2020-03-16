#!/usr/bin/env node

import chalk from 'chalk';
import program from 'commander';

import { Options } from './options';

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
    .option('-m, --max-event-count <maxEventCount>', 'maximum number of events to return')
    .option('-n, --newest', 'instruct to return newest events in case that number of events returned is limited by --max-event-count')
    .option('-x, --max-rounds <maxRounds>', 'maximum number of requests to send in order to get all events between --after and --before', '1')
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
    after: program.after,
    before: program.before,
    maxEventCount: program.maxEventCount,
    newest: program.newest !== undefined,
    maxRounds: program.maxRounds,
} as Options;

if (options.debug) {
    console.log(chalk.gray(JSON.stringify(options)));
}

