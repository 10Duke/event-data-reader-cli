export interface Options {
    getEndpointUrl: string;
    feed: string;
    privateKeyFile: string;
    after?: number;
    before?: number;
    maxEventCount?: number;
    newest: boolean;
    maxRounds: number;
    debug: boolean;
}
