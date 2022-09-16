import { Vec2, Vec4 } from "./types";
declare const useDragSelectLayer: (width: number, height: number, handleSelectRect: (r: Vec4, o: {
    ctrlKey: boolean;
    shiftKey: boolean;
}) => void, handleClickPoint: (p: Vec2, o: {
    ctrlKey: boolean;
    shiftKey: boolean;
}) => void) => {
    dragSelectState: import("./dragSelectReducer").DragSelectState;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    paintDragSelectLayer: (ctxt: CanvasRenderingContext2D, props: any) => void;
};
export default useDragSelectLayer;
