import fs, { WriteStream } from 'fs';

import bent from 'bent';
import chalk from 'chalk';

import { Options } from './options';
import { URL } from 'url';

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve,ms);
    });
}

function buildFeedUrl(options: Options): URL {
    let url = options.getEndpointUrl;
    if (!url.endsWith('/')) {
        url += '/';
    }
    url += options.feed;
    return new URL(url);
}

function buildCommonQueryParams(options: Options): string {
    let retValue = `?maxEventCount=${options.maxEventCount || 1000}`;
    if (options.newest) {
        retValue += '&newest=true';
        if (options.after) {
            retValue += `&after=${options.after}`;
        }
    } else {
        if (options.before) {
            retValue += `&before=${options.before}`;
        }
    }
    return retValue;
}

function buildInitialQueryParams(options: Options): string {
    let retValue = buildCommonQueryParams(options);
    if (options.newest) {
        if (options.before) {
            retValue += `&before=${options.before}`;
        }
    } else {
        if (options.after) {
            retValue += `&after=${options.after}`;
        }
    }
    return retValue;
}

function resolveAfterForNextQuery(options: Options, newerInstruction: any): string | null {
    const newerUrl = new URL('http://' + newerInstruction.url);
    const afterParam = newerUrl.searchParams.get('after');
    if (afterParam && options.before) {
        if (afterParam.localeCompare(options.before) >= 0) {
            return null;
        }
        return afterParam;
    } else if (afterParam) {
        return afterParam;
    }
    return null;
}

function resolveBeforeForNextQuery(options: Options, olderInstruction: any): string | null {
    const olderUrl = new URL('http://' + olderInstruction.url);
    const beforeParam = olderUrl.searchParams.get('before');
    if (beforeParam && options.after) {
        if (beforeParam.localeCompare(options.after) <= 0) {
            return null;
        }
        return beforeParam;
    } else if (beforeParam) {
        return beforeParam;
    }
    return null;
}

function buildNextQueryParams(options: Options, olderInstruction: any, newerInstruction: any): string | null {
    let retValue = buildCommonQueryParams(options);
    if (options.newest) {
        const beforeForQueryOlder = resolveBeforeForNextQuery(options, olderInstruction);
        if (beforeForQueryOlder === null) {
            return null;
        }
        retValue += `&before=${beforeForQueryOlder}`;
    } else {
        const afterForQueryNewer = resolveAfterForNextQuery(options, newerInstruction);
        if (afterForQueryNewer === null) {
            return null;
        }
        retValue += `&after=${afterForQueryNewer}`;
    }
    return retValue;
}

function buildAuthorizationHeaderValue(token: string): string {
    return `Bearer ${token}`;
}

function findFirstEventIndex(eventsResponse: string, eventsEndIndex: number): number {
    const indexOfInstruction = eventsResponse.indexOf('"instruction"');
    const startIndex = eventsResponse.indexOf('{', indexOfInstruction);
    return eventsEndIndex - startIndex > 2 ? startIndex : -1;
}

function findEventsEndIndex(eventsResponse: string): number {
    const indexOfInstruction = eventsResponse.lastIndexOf('"instruction"');
    return eventsResponse.lastIndexOf('}', indexOfInstruction) + 1;
}

function findOlderInstruction(eventsResponse: string, eventsStartIndex: number): any {
    const instructionEndIndex = eventsResponse.lastIndexOf('}', eventsStartIndex) + 1;
    const instructionStartIndex = eventsResponse.lastIndexOf('{', instructionEndIndex);
    return JSON.parse(eventsResponse.substring(instructionStartIndex, instructionEndIndex));
}

function findNewerInstruction(eventsResponse: string, eventsEndIndex: number): any {
    const instructionStartIndex = eventsResponse.indexOf('{', eventsEndIndex);
    const instructionEndIndex = eventsResponse.indexOf('}', instructionStartIndex) + 1;
    return JSON.parse(eventsResponse.substring(instructionStartIndex, instructionEndIndex));
}

async function readEventsWithRetries(getFunc: () => Promise<string>, maxRetries: number): Promise<string> {
    let failedCount = 0;
    do {
        if (failedCount > 0) {
            const sleepSecs = Math.pow(2, failedCount - 1);
            console.log(chalk.red(`retry ${failedCount} after ${sleepSecs} second(s)`));
            await sleep(sleepSecs * 1000);
        }
        try {
            return await getFunc();
        } catch (e) {
            console.log(chalk.red(JSON.stringify(e)));
        }
    } while (failedCount++ < maxRetries);
    console.log(chalk.red('Too many retries, exiting'));
    process.exit(1);
}

export async function readEvents(options: Options, token: string): Promise<void> {
    const feedUrl = buildFeedUrl(options);
    const queryParams = buildInitialQueryParams(options);
    let fullUrl = feedUrl + queryParams;
    if (options.debug) {
        console.log(chalk.gray(fullUrl));
    }
    const authzHeader = buildAuthorizationHeaderValue(token);
    if (options.debug) {
        console.log(chalk.gray(authzHeader));
    }
    
    const headers: bent.Options = {
        Authorization: authzHeader,
    };
    const getString = bent('string', headers);

    const out: any = options.outputFile ? fs.createWriteStream(options.outputFile) : process.stdout;
    out.write('[');
    for (let i = 0; options.maxRounds === -1 || i < options.maxRounds; i++) {
        const response = await readEventsWithRetries(async () => await getString(fullUrl), options.maxRetries);
        const eventsEndIndex = findEventsEndIndex(response);
        const eventsStartIndex = findFirstEventIndex(response, eventsEndIndex);
        if (eventsStartIndex == -1) {
            break;
        }
        if (i > 0) {
            out.write(',');
        }
        // TODO: If using --newest, should invert order of events before writing to stdout
        out.write(response.substring(eventsStartIndex, eventsEndIndex));

        const olderInstruction = findOlderInstruction(response, eventsStartIndex);
//        if (options.newest && olderInstruction.count === 0) {
//            break;
//        }
        const newerInstruction = findNewerInstruction(response, eventsEndIndex);
//        if (!options.newest && newerInstruction.count === 0) {
//            break;
//        }

        const nextQueryParams = buildNextQueryParams(options, olderInstruction, newerInstruction);
        if (nextQueryParams === null) {
            break;
        }
        fullUrl = feedUrl + nextQueryParams;
        if (options.debug) {
            console.log(chalk.gray(fullUrl));
        }
    }
    out.write(']');
}
