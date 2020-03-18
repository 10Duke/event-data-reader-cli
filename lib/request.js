"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var bent_1 = __importDefault(require("bent"));
var chalk_1 = __importDefault(require("chalk"));
var url_1 = require("url");
function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
function buildFeedUrl(options) {
    var url = options.getEndpointUrl;
    if (!url.endsWith('/')) {
        url += '/';
    }
    url += options.feed;
    return new url_1.URL(url);
}
function buildCommonQueryParams(options) {
    var retValue = "?maxEventCount=" + (options.maxEventCount || 1000);
    if (options.newest) {
        retValue += '&newest=true';
        if (options.after) {
            retValue += "&after=" + options.after;
        }
    }
    else {
        if (options.before) {
            retValue += "&before=" + options.before;
        }
    }
    return retValue;
}
function buildInitialQueryParams(options) {
    var retValue = buildCommonQueryParams(options);
    if (options.newest) {
        if (options.before) {
            retValue += "&before=" + options.before;
        }
    }
    else {
        if (options.after) {
            retValue += "&after=" + options.after;
        }
    }
    return retValue;
}
function resolveAfterForNextQuery(options, newerInstruction) {
    var newerUrl = new url_1.URL('http://' + newerInstruction.url);
    var afterParam = newerUrl.searchParams.get('after');
    if (afterParam && options.before) {
        if (afterParam.localeCompare(options.before) >= 0) {
            return null;
        }
        return afterParam;
    }
    else if (afterParam) {
        return afterParam;
    }
    return null;
}
function resolveBeforeForNextQuery(options, olderInstruction) {
    var olderUrl = new url_1.URL('http://' + olderInstruction.url);
    var beforeParam = olderUrl.searchParams.get('before');
    if (beforeParam && options.after) {
        if (beforeParam.localeCompare(options.after) <= 0) {
            return null;
        }
        return beforeParam;
    }
    else if (beforeParam) {
        return beforeParam;
    }
    return null;
}
function buildNextQueryParams(options, olderInstruction, newerInstruction) {
    var retValue = buildCommonQueryParams(options);
    if (options.newest) {
        var beforeForQueryOlder = resolveBeforeForNextQuery(options, olderInstruction);
        if (beforeForQueryOlder === null) {
            return null;
        }
        retValue += "&before=" + beforeForQueryOlder;
    }
    else {
        var afterForQueryNewer = resolveAfterForNextQuery(options, newerInstruction);
        if (afterForQueryNewer === null) {
            return null;
        }
        retValue += "&after=" + afterForQueryNewer;
    }
    return retValue;
}
function buildAuthorizationHeaderValue(token) {
    return "Bearer " + token;
}
function findFirstEventIndex(eventsResponse, eventsEndIndex) {
    var indexOfInstruction = eventsResponse.indexOf('"instruction"');
    var startIndex = eventsResponse.indexOf('{', indexOfInstruction);
    return eventsEndIndex - startIndex > 2 ? startIndex : -1;
}
function findEventsEndIndex(eventsResponse) {
    var indexOfInstruction = eventsResponse.lastIndexOf('"instruction"');
    return eventsResponse.lastIndexOf('}', indexOfInstruction) + 1;
}
function findOlderInstruction(eventsResponse, eventsStartIndex) {
    var instructionEndIndex = eventsResponse.lastIndexOf('}', eventsStartIndex) + 1;
    var instructionStartIndex = eventsResponse.lastIndexOf('{', instructionEndIndex);
    return JSON.parse(eventsResponse.substring(instructionStartIndex, instructionEndIndex));
}
function findNewerInstruction(eventsResponse, eventsEndIndex) {
    var instructionStartIndex = eventsResponse.indexOf('{', eventsEndIndex);
    var instructionEndIndex = eventsResponse.indexOf('}', instructionStartIndex) + 1;
    return JSON.parse(eventsResponse.substring(instructionStartIndex, instructionEndIndex));
}
function readEventsWithRetries(getFunc, maxRetries) {
    return __awaiter(this, void 0, void 0, function () {
        var failedCount, sleepSecs, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    failedCount = 0;
                    _a.label = 1;
                case 1:
                    if (!(failedCount > 0)) return [3 /*break*/, 3];
                    sleepSecs = Math.pow(2, failedCount - 1);
                    console.log(chalk_1.default.red("retry " + failedCount + " after " + sleepSecs + " second(s)"));
                    return [4 /*yield*/, sleep(sleepSecs * 1000)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, getFunc()];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    e_1 = _a.sent();
                    console.log(chalk_1.default.red(JSON.stringify(e_1)));
                    return [3 /*break*/, 6];
                case 6:
                    if (failedCount++ < maxRetries) return [3 /*break*/, 1];
                    _a.label = 7;
                case 7:
                    console.log(chalk_1.default.red('Too many retries, exiting'));
                    process.exit(1);
                    return [2 /*return*/];
            }
        });
    });
}
function readEvents(options, token) {
    return __awaiter(this, void 0, void 0, function () {
        var feedUrl, queryParams, fullUrl, authzHeader, headers, getString, out, i, response, eventsEndIndex, eventsStartIndex, olderInstruction, newerInstruction, nextQueryParams;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    feedUrl = buildFeedUrl(options);
                    queryParams = buildInitialQueryParams(options);
                    fullUrl = feedUrl + queryParams;
                    if (options.debug) {
                        console.log(chalk_1.default.gray(fullUrl));
                    }
                    authzHeader = buildAuthorizationHeaderValue(token);
                    if (options.debug) {
                        console.log(chalk_1.default.gray(authzHeader));
                    }
                    headers = {
                        Authorization: authzHeader,
                    };
                    getString = bent_1.default('string', headers);
                    out = options.outputFile ? fs_1.default.createWriteStream(options.outputFile) : process.stdout;
                    out.write('[');
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(options.maxRounds === -1 || i < options.maxRounds)) return [3 /*break*/, 4];
                    return [4 /*yield*/, readEventsWithRetries(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getString(fullUrl)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); }, options.maxRetries)];
                case 2:
                    response = _a.sent();
                    eventsEndIndex = findEventsEndIndex(response);
                    eventsStartIndex = findFirstEventIndex(response, eventsEndIndex);
                    if (eventsStartIndex == -1) {
                        return [3 /*break*/, 4];
                    }
                    if (i > 0) {
                        out.write(',');
                    }
                    // TODO: If using --newest, should invert order of events before writing to stdout
                    out.write(response.substring(eventsStartIndex, eventsEndIndex));
                    olderInstruction = findOlderInstruction(response, eventsStartIndex);
                    newerInstruction = findNewerInstruction(response, eventsEndIndex);
                    nextQueryParams = buildNextQueryParams(options, olderInstruction, newerInstruction);
                    if (nextQueryParams === null) {
                        return [3 /*break*/, 4];
                    }
                    fullUrl = feedUrl + nextQueryParams;
                    if (options.debug) {
                        console.log(chalk_1.default.gray(fullUrl));
                    }
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    out.write(']');
                    return [2 /*return*/];
            }
        });
    });
}
exports.readEvents = readEvents;
//# sourceMappingURL=request.js.map