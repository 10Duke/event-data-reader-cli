#!/usr/bin/env node

import chalk from 'chalk';
import program from 'commander';

import { Options } from './options';

const appPackage = require('../package.json');

let getUrl: string | undefined = undefined;
program
    .name('event-data-reader')
    .description('Command line tool for reading event data from 10Duke Event Data service.')
    .version(appPackage.version)
    .arguments('<getUrl>')
    .action((getUrlArg) => getUrl = getUrlArg)
    .option('-d, --debug', 'output debug info (default: no debug output)')
    .parse(process.argv);

if (!getUrl) {
    console.error(chalk.red('error: missing required argument \'getUrl\''));
    process.exit(1);
}

const debug = program.debug !== undefined;
const options = {
    debug,
    getUrl,
} as Options;

if (debug) {
    console.log(chalk.gray(JSON.stringify(options)));
}
