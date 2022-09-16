var formatByteCount = function (a) {
    if (a < 10000) {
        return "".concat(a, " bytes");
    }
    else if (a < 100 * 1000) {
        return "".concat(formatNum(a / 1000), " KiB");
    }
    else if (a < 100 * 1000 * 1000) {
        return "".concat(formatNum(a / (1000 * 1000)), " MiB");
    }
    else if (a < 100 * 1000 * 1000 * 1000) {
        return "".concat(formatNum(a / (1000 * 1000 * 1000)), " GiB");
    }
    else {
        return "".concat(formatNum(a / (1000 * 1000 * 1000)), " GiB");
    }
};
export var formatGiBCount = function (a) {
    return formatByteCount(a * 1000 * 1000 * 1000);
};
var formatNum = function (a) {
    var b = a.toFixed(1);
    if (Number(b) - Math.floor(Number(b)) === 0) {
        return a.toFixed(0);
    }
    else
        return b;
};
export default formatByteCount;
//# sourceMappingURL=formatByteCount.js.map