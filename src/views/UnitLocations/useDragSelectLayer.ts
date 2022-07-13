import { COMPUTE_DRAG, DragAction, dragReducer, END_DRAG, getDragActionFromEvent, RESET_DRAG } from "FigurlCanvas/DragCanvas"
import { Vec2 } from "FigurlCanvas/Geometry"
import { useCallback, useMemo, useReducer, useRef } from "react"
import dragSelectReducer from "./dragSelectReducer"

const useDragSelectLayer = (width: number, height: number) => {
    const [dragSelectState, dragSelectStateDispatch] = useReducer(dragSelectReducer, {})
    const onMouseMove = useCallback((e: React.MouseEvent) => {
        dragSelectStateDispatch({
            type: 'DRAG_MOUSE_MOVE',
            point: getEventPoint(e)
        })
    }, [])

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        dragSelectStateDispatch({
            type: 'DRAG_MOUSE_DOWN',
            point: getEventPoint(e)
        })
    }, [])

    const onMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        dragSelectStateDispatch({
            type: 'DRAG_MOUSE_UP',
            point: getEventPoint(e)
        })
    }, [])

    const paintDragSelectLayer = useCallback(() => {

    }, [])

    return {
        dragSelectState,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        paintDragSelectLayer
    }
}

const getEventPoint = (e: React.MouseEvent) => {
    const boundingRect = e.currentTarget.getBoundingClientRect()
    const point: Vec2 = [e.clientX - boundingRect.x, e.clientY - boundingRect.y]
    return point
}

export default useDragSelectLayer