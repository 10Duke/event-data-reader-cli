import { default as jose } from 'jose';
export declare function readKey(path: string): jose.JWK.RSAKey;
export declare function createToken(feed: string, key: jose.JWK.RSAKey): string;
