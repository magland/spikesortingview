import { dragSelectReducer } from "./dragSelectReducer";
import { useCallback, useReducer } from "react";
var useDragSelectLayer = function (width, height, handleSelectRect, handleClickPoint) {
    var _a = useReducer(dragSelectReducer, {}), dragSelectState = _a[0], dragSelectStateDispatch = _a[1];
    var onMouseMove = useCallback(function (e) {
        if (e.buttons) { // this condition is important for the case where we leave the window and then come back without the button pressed
            dragSelectStateDispatch({
                type: 'DRAG_MOUSE_MOVE',
                point: getEventPoint(e)
            });
        }
    }, []);
    var onMouseDown = useCallback(function (e) {
        dragSelectStateDispatch({
            type: 'DRAG_MOUSE_DOWN',
            point: getEventPoint(e)
        });
    }, []);
    var onMouseUp = useCallback(function (e) {
        if ((dragSelectState.isActive) && (dragSelectState.dragRect)) {
            handleSelectRect(dragSelectState.dragRect, { ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
        }
        if (!dragSelectState.isActive) {
            handleClickPoint(getEventPoint(e), { ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
        }
        dragSelectStateDispatch({
            type: 'DRAG_MOUSE_UP',
            point: getEventPoint(e)
        });
    }, [dragSelectState, handleSelectRect, handleClickPoint]);
    var onMouseLeave = useCallback(function (e) {
        dragSelectStateDispatch({
            type: 'DRAG_MOUSE_LEAVE'
        });
    }, []);
    var paintDragSelectLayer = useCallback(function (ctxt, props) {
        ctxt.clearRect(0, 0, width, height);
        if ((dragSelectState.isActive) && (dragSelectState.dragRect)) {
            var rect = dragSelectState.dragRect;
            ctxt.fillStyle = defaultDragStyle;
            ctxt.fillRect(rect[0], rect[1], rect[2], rect[3]);
        }
    }, [width, height, dragSelectState]);
    return {
        dragSelectState: dragSelectState,
        onMouseDown: onMouseDown,
        onMouseMove: onMouseMove,
        onMouseUp: onMouseUp,
        onMouseLeave: onMouseLeave,
        paintDragSelectLayer: paintDragSelectLayer
    };
};
var defaultDragStyle = 'rgba(196, 196, 196, 0.5)';
var getEventPoint = function (e) {
    var boundingRect = e.currentTarget.getBoundingClientRect();
    var point = [e.clientX - boundingRect.x, e.clientY - boundingRect.y];
    return point;
};
export default useDragSelectLayer;
//# sourceMappingURL=useDragSelectLayer.js.map