export interface Options {
    getEndpointUrl: string;
    feed: string;
    privateKeyFile: string;
    after?: string;
    before?: string;
    maxEventCount?: number;
    newest: boolean;
    maxRounds: number;
    debug: boolean;
    outputFile?: string;
    maxRetries: number;
}
