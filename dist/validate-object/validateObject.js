// string
export var isString = function (x) {
    return ((x !== null) && (typeof x === 'string'));
};
// function
export var isFunction = function (x) {
    return ((x !== null) && (typeof x === 'function'));
};
// number
export var isNumber = function (x) {
    return ((x !== null) && (typeof x === 'number'));
};
// null
export var isNull = function (x) {
    return x === null;
};
// boolean
export var isBoolean = function (x) {
    return ((x !== null) && (typeof x === 'boolean'));
};
// isOneOf
export var isOneOf = function (testFunctions) {
    return function (x) {
        for (var _i = 0, testFunctions_1 = testFunctions; _i < testFunctions_1.length; _i++) {
            var tf = testFunctions_1[_i];
            if (tf(x))
                return true;
        }
        return false;
    };
};
export var optional = function (testFunctionOrSpec) {
    if (isFunction(testFunctionOrSpec)) {
        var testFunction_1 = testFunctionOrSpec;
        return function (x) {
            return ((x === undefined) || (testFunction_1(x)));
        };
    }
    else {
        return function (x) {
            var obj = testFunctionOrSpec;
            return ((x === undefined) || (validateObject(x, obj)));
        };
    }
};
// isEqualTo
export var isEqualTo = function (value) {
    return function (x) {
        return x === value;
    };
};
// isArrayOf
export var isArrayOf = function (testFunction) {
    return function (x) {
        if ((x !== null) && (Array.isArray(x))) {
            for (var _i = 0, x_1 = x; _i < x_1.length; _i++) {
                var a = x_1[_i];
                if (!testFunction(a))
                    return false;
            }
            return true;
        }
        else
            return false;
    };
};
// object
export var isObject = function (x) {
    return ((x !== null) && (typeof x === 'object'));
};
// isObjectOf
export var isObjectOf = function (keyTestFunction, valueTestFunction) {
    return function (x) {
        if (isObject(x)) {
            for (var k in x) {
                if (!keyTestFunction(k))
                    return false;
                if (!valueTestFunction(x[k]))
                    return false;
            }
            return true;
        }
        else
            return false;
    };
};
export var isJSONObject = function (x) {
    if (!isObject(x))
        return false;
    return isJSONSerializable(x);
};
export var isJSONValue = function (x) {
    return isJSONSerializable(x);
};
export var tryParseJsonObject = function (x) {
    var a;
    try {
        a = JSON.parse(x);
    }
    catch (_a) {
        return null;
    }
    if (!isJSONObject(a))
        return null;
    return a;
};
export var isJSONSerializable = function (obj) {
    if (typeof (obj) === 'string')
        return true;
    if (typeof (obj) === 'number')
        return true;
    if (!isObject(obj))
        return false;
    var isPlainObject = function (a) {
        return Object.prototype.toString.call(a) === '[object Object]';
    };
    var isPlain = function (a) {
        return (a === null) || (typeof a === 'undefined' || typeof a === 'string' || typeof a === 'boolean' || typeof a === 'number' || Array.isArray(a) || isPlainObject(a));
    };
    if (!isPlain(obj)) {
        return false;
    }
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (!isPlain(obj[property])) {
                return false;
            }
            if (obj[property] !== null) {
                if (typeof obj[property] === "object") {
                    if (!isJSONSerializable(obj[property])) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
};
var validateObject = function (x, spec, opts) {
    var o = opts || {};
    if (!x) {
        o.callback && o.callback('x is undefined/null.');
        return false;
    }
    if (typeof (x) !== 'object') {
        o.callback && o.callback('x is not an Object.');
        return false;
    }
    for (var k in x) {
        if (!(k in spec)) {
            if (!o.allowAdditionalFields) {
                o.callback && o.callback("Key not in spec: ".concat(k));
                return false;
            }
        }
    }
    for (var k in spec) {
        var specK = spec[k];
        if (isFunction(specK)) {
            if (!specK(x[k])) {
                o.callback && o.callback("Problem validating: ".concat(k));
                return false;
            }
        }
        else {
            if (!(k in x)) {
                o.callback && o.callback("Key not in x: ".concat(k));
                return false;
            }
            if (!validateObject(x[k], specK, { callback: o.callback })) {
                o.callback && o.callback("Value of key > ".concat(k, " < itself failed validation."));
                return false;
            }
        }
    }
    return true;
};
export default validateObject;
//# sourceMappingURL=validateObject.js.map