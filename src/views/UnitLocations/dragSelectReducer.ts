import { DragAction, dragReducer, DragState } from "FigurlCanvas/DragCanvas"
import { pointSpanToRegion, Vec2, Vec4 } from "FigurlCanvas/Geometry"
import { getDraggedElectrodeIds } from "views/AverageWaveforms/WaveformWidget/sharedDrawnComponents/electrodeGeometryLayout"

export type DragSelectState = {
    isActive?: boolean,  // whether we are in an active dragging state
    dragAnchor?: Vec2, // The position where dragging began (pixels)
    dragRect?: Vec4,   // The drag rect. [0],[1] are the upper left corner, [2], [3] are width & height.
}

export type DragSelectAction = {
    type: 'DRAG_MOUSE_DOWN'
    point: Vec2
} | {
    type: 'DRAG_MOUSE_UP'
    point: Vec2
} | {
    type: 'DRAG_MOUSE_LEAVE'
} | {
    type: 'DRAG_MOUSE_MOVE'
    point: Vec2
}

export const dragSelectReducer = (state: DragSelectState, action: DragSelectAction): DragSelectState => {
    if (action.type === 'DRAG_MOUSE_DOWN') {
        const { point } = action
        return {
            ...state,
            isActive: true,
            dragAnchor: point,
            dragRect: undefined
        }
    } else if (action.type === 'DRAG_MOUSE_UP') {
        return {
            ...state,
            isActive: false,
            dragAnchor: undefined,
            dragRect: undefined
        }
    } else if (action.type === 'DRAG_MOUSE_MOVE') {
        if (!state.isActive) return state
        if (!state.dragAnchor) return state
        return {
            ...state,
            dragRect: [
                Math.min(state.dragAnchor[0], action.point[0]),
                Math.min(state.dragAnchor[1], action.point[1]),
                Math.abs(state.dragAnchor[0] - action.point[0]),
                Math.abs(state.dragAnchor[1] - action.point[1])
            ]
        }
    } else if (action.type === 'DRAG_MOUSE_LEAVE') {
        return {
            ...state,
            isActive: false,
            dragAnchor: undefined,
            dragRect: undefined
        }
    } else {
        console.log(`Error: unrecognized verb in dragSelectReducer.`)
        return state
    }
}

export default dragSelectReducer