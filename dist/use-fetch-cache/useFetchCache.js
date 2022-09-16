var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import objectHash from 'object-hash';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
var initialFetchCacheState = {
    data: {},
    activeFetches: {}
};
var fetchCacheReducer = function (state, action) {
    var _a, _b, _c;
    switch (action.type) {
        case 'clear': {
            return initialFetchCacheState;
        }
        case 'startFetch': {
            return __assign(__assign({}, state), { activeFetches: __assign(__assign({}, state.activeFetches), (_a = {}, _a[action.queryHash] = true, _a)) });
        }
        case 'setData': {
            return __assign(__assign({}, state), { data: __assign(__assign({}, state.data), (_b = {}, _b[action.queryHash] = action.data, _b)), activeFetches: __assign(__assign({}, state.activeFetches), (_c = {}, _c[action.queryHash] = false, _c)) });
        }
        default: {
            throw Error('Unexpected action in fetchCacheReducer');
        }
    }
};
var queryHash = function (query) {
    return objectHash(query);
};
var useFetchCache = function (fetchFunction) {
    var _a = useState(0), count = _a[0], setCount = _a[1];
    if (count < 0)
        console.info(count); // just suppress the unused warning (will never print)
    var prevFetchFunction = useRef(fetchFunction);
    var _b = useReducer(fetchCacheReducer, initialFetchCacheState), state = _b[0], dispatch = _b[1];
    var queriesToFetch = useRef({});
    useEffect(function () {
        // clear whenever fetchFunction has Changed
        if (fetchFunction !== prevFetchFunction.current) {
            prevFetchFunction.current = fetchFunction;
            dispatch({ type: 'clear' });
        }
    }, [fetchFunction]);
    // The `get` function depends on the state, so it updates every time a reducer operation
    // fires. This is intended: updating the `get` is how we trigger consumers that a fetch
    // operation has completed and there's new data available in the cache.
    var get = useCallback(function (query) {
        var h = queryHash(query);
        var v = state.data[h];
        if ((v === undefined) && (!state.activeFetches[h])) {
            if (!queriesToFetch.current[h]) {
                queriesToFetch.current[h] = query;
                setCount(function (c) { return (c + 1); }); // make sure we trigger a state change so we go to the useEffect below
            }
        }
        return v;
    }, [state.data, state.activeFetches]);
    var fetch = useMemo(function () { return (function (query) {
        var h = queryHash(query);
        var val = state.data[h];
        if (val !== undefined)
            return;
        if (state.activeFetches[h])
            return;
        dispatch({ type: 'startFetch', queryHash: h });
        fetchFunction(query).then(function (data) {
            if (data !== undefined) {
                dispatch({ type: 'setData', queryHash: h, data: data });
            }
        }).catch(function (err) {
            console.warn(err);
            console.warn('Problem fetching data', query);
            // note: we intentionally do not unset the active fetch here
        });
    }); }, [state.data, state.activeFetches, fetchFunction]);
    useEffect(function () {
        var keys = Object.keys(queriesToFetch.current);
        if (keys.length === 0)
            return;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var k = keys_1[_i];
            fetch(queriesToFetch.current[k]);
        }
        queriesToFetch.current = {};
    });
    return useMemo(function () { return ({
        get: get
    }); }, [get]);
};
export default useFetchCache;
//# sourceMappingURL=useFetchCache.js.map