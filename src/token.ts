import { readFileSync } from 'fs';
import { default as jose, JSONWebKey } from 'jose';

export function readKey(path: string): jose.JWK.RSAKey {
    const key = jose.JWK.asKey(readFileSync(path));
    const rsaKey = key as jose.JWK.RSAKey;
    if (!rsaKey) {
        throw new Error(`${path} is not a valid RSA key`);
    }
    return rsaKey;
}

export function createToken(feed: string, key: jose.JWK.RSAKey): string {
    const payload = {
        [feed]: true,
    };
    return jose.JWT.sign(payload, key, { algorithm: 'RS256', expiresIn: '24 hours' });
}
