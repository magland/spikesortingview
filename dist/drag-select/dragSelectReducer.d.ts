import { Vec2, Vec4 } from "./types";
export declare type DragSelectState = {
    isActive?: boolean;
    dragAnchor?: Vec2;
    dragPosition?: Vec2;
    dragRect?: Vec4;
};
export declare type DragSelectAction = {
    type: 'DRAG_MOUSE_DOWN';
    point: Vec2;
} | {
    type: 'DRAG_MOUSE_UP';
    point: Vec2;
} | {
    type: 'DRAG_MOUSE_LEAVE';
} | {
    type: 'DRAG_MOUSE_MOVE';
    point: Vec2;
};
export declare const dragSelectReducer: (state: DragSelectState, action: DragSelectAction) => DragSelectState;
export default dragSelectReducer;
