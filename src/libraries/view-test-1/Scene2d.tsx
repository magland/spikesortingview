import { BaseCanvas, pointInRect, RectangularRegion } from "libraries/figurl-canvas";
import dragSelectReducer from "libraries/view-unit-locations/dragSelectReducer";
import { FunctionComponent, useCallback, useEffect, useReducer } from "react";

// https://figurl.org/f?v=gs://figurl/spikesortingview-9&d=sha1://309f3b0131934091301c3e75669138a2e04e9240&label=Test1

type T = {
	type: 'line'
	dx: number
	dy: number
	attributes: {
		color: string
		dash?: number[]
		width?: number
	}
	selectedAttributes?: {
		color: string
		dash?: number[]
		width?: number
	}
} | {
	type: 'marker'
	attributes: {
		fillColor?: string
		lineColor?: string
		shape?: 'circle' | 'square'
		radius?: number
	}
	selectedAttributes?: {
		fillColor?: string
		lineColor?: string
		shape?: 'circle' | 'square'
		radius?: number
	}
}

export type Scene2dObject = {
	objectId: string
	clickable?: boolean
	draggable?: boolean
	selected?: boolean
	x: number
	y: number
} & T

type Props ={
	width: number
	height: number
	objects: Scene2dObject[]
	onClickObject?: (objectId: string) => void
	onDragObject?: (objectId: string, newPoint: {x: number, y: number}) => void
}

const emptyDrawData = {}

const defaultMarkerRadius = 6
const defaultLineWidth = 1.1

type DraggingObjectState = {
	object?: Scene2dObject | null
	newPoint?: {x: number, y: number}
}
type DraggingObjectAction = {
	type: 'start'
	object: Scene2dObject | null
	point: {x: number, y: number}
} | {
	type: 'end'
} | {
	type: 'move'
	point: {x: number, y: number}
}

const draggingObjectReducer = (s: DraggingObjectState, a: DraggingObjectAction): DraggingObjectState => {
	if (a.type === 'start') {
		return {...s, object: a.object, newPoint: a.point}
	}
	else if (a.type === 'end') {
		return {...s, object: undefined}
	}
	else if (a.type === 'move') {
		return {...s, newPoint: a.point}
	}
	else return s
}

const Scene2d: FunctionComponent<Props> = ({width, height, objects, onClickObject, onDragObject}) => {
	const [dragState, dragStateDispatch] = useReducer(dragSelectReducer, {})
	const [draggingObject, draggingObjectDispatch] = useReducer(draggingObjectReducer, {})
	useEffect(() => {
		if ((dragState.isActive) && (dragState.dragAnchor)) {
			if (draggingObject.object === undefined) {
				const p = dragState.dragAnchor
				let found = false
				for (let i = objects.length - 1; i >= 0; i--) {
					const o = objects[i]
					if (o.draggable) {
						if (pointInObject(o, {x: p[0], y: p[1]})) {
							draggingObjectDispatch({type: 'start', object: o, point: {x: p[0], y: p[1]}})
							found = true
							break
						}
					}
				}
				if (!found) {
					draggingObjectDispatch({type: 'start', object: null, point: {x: 0, y: 0}})
				}
			}
			else {
				const dragRect = dragState.dragRect
				const dragAnchor = dragState.dragAnchor
				if ((dragRect) && (dragAnchor)) {
					let p = {x: dragRect[0], y: dragRect[1]}
					if ((p.x === dragAnchor[0]) && (p.y === dragAnchor[1])) {
						p = {x: dragRect[0] + dragRect[2], y: dragRect[1] + dragRect[3]}
					}
					draggingObjectDispatch({type: 'move', point: p})
				}
			}
		}
		else {
			if (draggingObject.object !== undefined) {
				draggingObjectDispatch({type: 'end'})
			}
		}
	}, [dragState, draggingObject.object, objects])

	const paint = useCallback((ctxt: CanvasRenderingContext2D, props: any) => {
		ctxt.clearRect(0, 0, width, height)
		const paintObject = (o: Scene2dObject) => {
			let pp = {x: o.x, y: o.y}
			if ((draggingObject) && (o.objectId === draggingObject.object?.objectId) && (draggingObject.newPoint)) {
				pp = draggingObject.newPoint
			}
			if (o.type === 'line') {
				const attributes = !o.selected ? o.attributes : o.selectedAttributes || {...o.attributes, color: 'yellow', width: (o.attributes.width || defaultLineWidth) * 1.5}
				ctxt.lineWidth = attributes.width || defaultLineWidth
				ctxt.strokeStyle = attributes.color || 'black'
				ctxt.beginPath()
				ctxt.moveTo(pp.x, pp.y)
				ctxt.lineTo(pp.x + o.dx, pp.y + o.dy)
				ctxt.stroke()
			}
			else if (o.type === 'marker') {
				const attributes = !o.selected ? o.attributes : o.selectedAttributes || {...o.attributes, color: 'yellow', radius: (o.attributes.radius || defaultMarkerRadius) * 1.5}
				const radius = attributes.radius || defaultMarkerRadius
				const shape = o.attributes.shape || 'circle'
				ctxt.lineWidth = defaultLineWidth
				ctxt.fillStyle = attributes.fillColor || 'black'
				ctxt.strokeStyle = attributes.lineColor || 'black'

				ctxt.beginPath()
				if (shape === 'circle') {
					ctxt.ellipse(pp.x, pp.y, radius, radius, 0, 0, 2 * Math.PI)
				}
				else if (shape === 'square') {
					ctxt.rect(pp.x - radius, pp.y - radius, radius * 2, radius * 2)
				}
				attributes.fillColor && ctxt.fill()
				attributes.lineColor && ctxt.stroke()
			}
		}
        objects.forEach(object => {
			paintObject(object)
		})
    }, [objects, width, height, draggingObject])

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
        dragStateDispatch({type: 'DRAG_MOUSE_DOWN', point: [p.x, p.y]})
    }, [])
	const handleMouseUp = useCallback((e: React.MouseEvent) => {
		const boundingRect = e.currentTarget.getBoundingClientRect()
		const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
		if (!dragState.isActive) {
			for (let i = objects.length - 1; i >= 0; i--) {
				const o = objects[i]
				if (o.clickable) {
					if (pointInObject(o, p)) {
						onClickObject && onClickObject(o.objectId)
						break
					}
				}
			}
		}
		if ((draggingObject.newPoint) && (draggingObject.object)) {
			onDragObject && onDragObject(draggingObject.object.objectId, draggingObject.newPoint)
		}
		dragStateDispatch({type: 'DRAG_MOUSE_UP', point: [p.x, p.y]})
    }, [dragState.isActive, objects, onClickObject, draggingObject.newPoint, draggingObject.object, onDragObject])
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
		dragStateDispatch({type: 'DRAG_MOUSE_MOVE', point: [p.x, p.y]})
    }, [])
    const handleMouseLeave = useCallback((e: React.MouseEvent) => {
		dragStateDispatch({type: 'DRAG_MOUSE_LEAVE'})
    }, [])

	return (
		<div
            style={{width, height, position: 'relative'}}
            onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
			<BaseCanvas
				width={width}
				height={height}
				draw={paint}
				drawData={emptyDrawData}
			/>
		</div>
	)
}

const pointInObject = (o: Scene2dObject, p: {x: number, y: number}) => {
	if (o.type === 'marker') {
		const r = o.attributes.radius || defaultMarkerRadius
		const R: RectangularRegion = {xmin: o.x - r, ymin: o.y - r, xmax: o.x + r, ymax: o.y + r}
		return pointInRect([p.x, p.y], R)
	}
	else return false
}

export default Scene2d
