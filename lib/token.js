"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var jose_1 = __importDefault(require("jose"));
function readKey(path) {
    var key = jose_1.default.JWK.asKey(fs_1.readFileSync(path));
    var rsaKey = key;
    if (!rsaKey) {
        throw new Error(path + " is not a valid RSA key");
    }
    return rsaKey;
}
exports.readKey = readKey;
function createToken(feed, key) {
    var _a;
    var payload = (_a = {},
        _a[feed] = true,
        _a);
    return jose_1.default.JWT.sign(payload, key, { algorithm: 'RS256', expiresIn: '24 hours' });
}
exports.createToken = createToken;
//# sourceMappingURL=token.js.map