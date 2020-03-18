#!/usr/bin/env node

import chalk from 'chalk';
import program from 'commander';

import { Options } from './options';
import { readEvents } from './request';
import { readKey, createToken } from './token';
import { parseDateTime } from './util';

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
    .option('-a, --after <after>', 'Timestamp from which events are requested, in nanoseconds since the Epoch or as a parseable datetime string (ISO 8601). If not specified, reading starts from the oldest event.')
    .option('-b, --before <before>', 'Timestamp until which events are requested, in nanoseconds since the Epoch or as a parseable datetime string (ISO 8601). If not specified, reads until no newer events available.')
    .requiredOption('-k, --key <privateKeyFile>', 'private key file, used for building authorization token')
    .option('-m, --max-event-count <maxEventCount>', 'maximum number of events to return per request', '500')
//    .option('-n, --newest', 'instruct to return newest events in case that number of events returned is limited by --max-event-count')
    .option('-x, --max-rounds <maxRounds>', 'maximum number of requests to send in order to get all events between --after and --before, or -1 for unlimited / until all retrieved', '1')
    .option('-r, --max-retries <maxRetries>', 'maximum number of retries if a request fails', '1')
    .option('-o, --output <filePath>', 'File for writing events received from the server. If not specified, writes to stdout.')
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
    after: parseDateTime(program.after),
    before: parseDateTime(program.before),
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
