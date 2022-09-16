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
export var dragSelectReducer = function (state, action) {
    if (action.type === 'DRAG_MOUSE_DOWN') {
        var point = action.point;
        return __assign(__assign({}, state), { isActive: false, dragAnchor: point, dragPosition: point, dragRect: undefined });
    }
    else if (action.type === 'DRAG_MOUSE_UP') {
        return __assign(__assign({}, state), { isActive: false, dragAnchor: undefined, dragPosition: undefined, dragRect: undefined });
    }
    else if (action.type === 'DRAG_MOUSE_MOVE') {
        if (!state.dragAnchor)
            return state;
        var newDragRect = [
            Math.min(state.dragAnchor[0], action.point[0]),
            Math.min(state.dragAnchor[1], action.point[1]),
            Math.abs(state.dragAnchor[0] - action.point[0]),
            Math.abs(state.dragAnchor[1] - action.point[1])
        ];
        if (state.isActive) {
            return __assign(__assign({}, state), { dragRect: newDragRect, dragPosition: [action.point[0], action.point[1]] });
        }
        else if ((newDragRect[2] >= 10) || (newDragRect[3] >= 10)) {
            return __assign(__assign({}, state), { isActive: true, dragRect: newDragRect, dragPosition: [action.point[0], action.point[1]] });
        }
        else {
            return state;
        }
    }
    else if (action.type === 'DRAG_MOUSE_LEAVE') {
        return __assign({}, state
        // isActive: false,
        // dragAnchor: undefined,
        // dragRect: undefined
        );
    }
    else {
        console.log("Error: unrecognized verb in dragSelectReducer.");
        return state;
    }
};
export default dragSelectReducer;
//# sourceMappingURL=dragSelectReducer.js.map