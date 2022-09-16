import { isNumber } from "../validate-object";
export var isVec2 = function (x) {
    if ((x) && (Array.isArray(x)) && (x.length === 2)) {
        for (var _i = 0, x_1 = x; _i < x_1.length; _i++) {
            var a = x_1[_i];
            if (!isNumber(a))
                return false;
        }
        return true;
    }
    else
        return false;
};
export var isVec3 = function (x) {
    if ((x) && (Array.isArray(x)) && (x.length === 3)) {
        for (var _i = 0, x_2 = x; _i < x_2.length; _i++) {
            var a = x_2[_i];
            if (!isNumber(a))
                return false;
        }
        return true;
    }
    else
        return false;
};
export var isVec4 = function (x) {
    if ((x) && (Array.isArray(x)) && (x.length === 4)) {
        for (var _i = 0, x_3 = x; _i < x_3.length; _i++) {
            var a = x_3[_i];
            if (!isNumber(a))
                return false;
        }
        return true;
    }
    else
        return false;
};
//# sourceMappingURL=types.js.map