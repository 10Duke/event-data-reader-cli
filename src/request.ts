import https from 'https';

import chalk from 'chalk';

import { Options } from './options';
import { URL } from 'url';

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

function buildAuthorizationHeaderValue(token: string): string {
    return `Bearer ${token}`;
}

export async function readEvents(options: Options, token: string): any {
    const feedUrl = buildFeedUrl(options);
    if (options.debug) {
        console.log(chalk.gray(feedUrl));
    }
    let queryParams = buildInitialQueryParams(options);
    if (options.debug) {
        console.log(chalk.gray(queryParams));
    }
    const authzHeader = buildAuthorizationHeaderValue(token);
    if (options.debug) {
        console.log(chalk.gray(authzHeader));
    }
    
    const reqOptions: https.RequestOptions = {
        method: 'GET',
        protocol: feedUrl.protocol,
        host: feedUrl.host,
        headers: {
            Authorization: authzHeader,
        }
    };

    https.request
}
