"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseDateTime(input) {
    if (input === undefined || input === null || input.length === 0) {
        return undefined;
    }
    var digitsOnly = /^\d+$/.test(input);
    if (digitsOnly) {
        return input;
    }
    var epochMillis = Date.parse(input);
    if (epochMillis === NaN) {
        throw new Error("error: parsing date and time failed from " + input);
    }
    return epochMillis + "000000";
}
exports.parseDateTime = parseDateTime;
//# sourceMappingURL=util.js.map