import { BaseCanvas, pointInRect, RectangularRegion, Vec4 } from "libraries/figurl-canvas";
import { dragSelectReducer } from "libraries/util-drag-select";
import React, { FunctionComponent, useCallback, useEffect, useReducer, useState } from "react";

// https://figurl.org/f?v=gs://figurl/spikesortingview-9&d=sha1://309f3b0131934091301c3e75669138a2e04e9240&label=Test1
// https://figurl.org/f?v=http://localhost:3000&d=sha1://309f3b0131934091301c3e75669138a2e04e9240&label=Test1

type T = {
	type: 'line'
	x: number
	y: number
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
	x: number
	y: number
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
} | {
	type: 'connector',
	objectId1: string,
	objectId2: string,
	attributes: {
		color: string
		dash?: number[]
		width?: number
	}
}

export type Scene2dObject = {
	objectId: string
	clickable?: boolean
	draggable?: boolean
	selected?: boolean
} & T

type Props ={
	width: number
	height: number
	objects: Scene2dObject[]
	onClickObject?: (objectId: string, e: React.MouseEvent) => void
	onDragObject?: (objectId: string, newPoint: {x: number, y: number}, e: React.MouseEvent) => void
	onSelectObjects?: (objectIds: string[], e: React.MouseEvent | undefined) => void
	onClick?: (p: {x: number, y: number}, e: React.MouseEvent) => void
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

const Scene2d: FunctionComponent<Props> = ({width, height, objects, onClickObject, onDragObject, onSelectObjects, onClick}) => {
	const [dragState, dragStateDispatch] = useReducer(dragSelectReducer, {})
	const [draggingObject, draggingObjectDispatch] = useReducer(draggingObjectReducer, {})
	const [activeSelectRect, setActiveSelectRect] = useState<Vec4 | undefined>()
	const [activeMouseEvent, setActiveMouseEvent] = useState<React.MouseEvent | undefined>()

	const handleSelectRect = useCallback((r: Vec4, e: React.MouseEvent | undefined) => {
		const rr = {xmin: r[0], ymin: r[1], xmax: r[0] + r[2], ymax: r[1] + r[3]}
		const objectIds = objects.filter(o => {
			if (o.type === 'marker') {
				if (pointInRect([o.x, o.y], rr)) {
					return true
				}
			}
			return false
		}).map(o => (o.objectId))
		onSelectObjects && onSelectObjects(objectIds, e)
	}, [objects, onSelectObjects])

	useEffect(() => {
		// dragState or activeSelectRect has changed
		if ((dragState.isActive) && (dragState.dragAnchor)) {
			// We are dragging
			if (draggingObject.object === undefined) {
				// we are not dragging an object (including null object)
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
				// we are dragging an object (including null)
				const p = dragState.dragPosition
				if (p) {
					draggingObjectDispatch({type: 'move', point: {x: p[0], y: p[1]}})
				}
				if (draggingObject.object === null) {
					setActiveSelectRect(dragState.dragRect)
				}
			}
		}
		else {
			// we are not dragging
			if (draggingObject.object !== undefined) {
				draggingObjectDispatch({type: 'end'})
			}
			if (activeSelectRect) {
				handleSelectRect(activeSelectRect, activeMouseEvent)
				setActiveSelectRect(undefined)
			}
		}
	}, [dragState, activeSelectRect, activeMouseEvent, handleSelectRect, draggingObject.object, objects])

	const paint = useCallback((ctxt: CanvasRenderingContext2D, props: any) => {
		ctxt.clearRect(0, 0, width, height)
		const objectsById: {[id: string]: Scene2dObject} = {}
		for (let o of objects) objectsById[o.objectId] = o
		if ((!draggingObject.object) && (dragState.isActive) && (dragState.dragRect)) {
			const rect = dragState.dragRect
			ctxt.fillStyle = defaultDragStyle
            ctxt.fillRect(rect[0], rect[1], rect[2], rect[3])
		}
		const paintObject = (o: Scene2dObject) => {
			if ((o.type === 'line') || (o.type === 'marker')) {
				let pp = {x: o.x, y: o.y}
				if ((draggingObject) && (o.objectId === draggingObject.object?.objectId) && (draggingObject.newPoint)) {
					pp = draggingObject.newPoint
				}

				if (o.type === 'line') {
					const attributes = !o.selected ? o.attributes : o.selectedAttributes || {...o.attributes, color: 'yellow', width: (o.attributes.width || defaultLineWidth) * 1.5}
					ctxt.lineWidth = attributes.width || defaultLineWidth
					if (attributes.dash) ctxt.setLineDash(attributes.dash)
					ctxt.strokeStyle = attributes.color || 'black'
					ctxt.beginPath()
					ctxt.moveTo(pp.x, pp.y)
					ctxt.lineTo(pp.x + o.dx, pp.y + o.dy)
					ctxt.stroke()
					ctxt.setLineDash([])
				}
				else if (o.type === 'marker') {
					const attributes = !o.selected ? o.attributes : o.selectedAttributes || {...o.attributes, fillColor: 'orange', radius: (o.attributes.radius || defaultMarkerRadius) * 1.5}
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
			else if (o.type === 'connector') {
				const obj1 = objectsById[o.objectId1]
				const obj2 = objectsById[o.objectId2]
				if ((obj1) && (obj2) && (obj1.type === 'marker') && (obj2.type === 'marker')) {
					let pp1 = {x: obj1.x, y: obj1.y}
					if ((draggingObject) && (obj1.objectId === draggingObject.object?.objectId) && (draggingObject.newPoint)) {
						pp1 = draggingObject.newPoint
					}

					let pp2 = {x: obj2.x, y: obj2.y}
					if ((draggingObject) && (obj2.objectId === draggingObject.object?.objectId) && (draggingObject.newPoint)) {
						pp2 = draggingObject.newPoint
					}

					const attributes = o.attributes
					if (attributes.dash) ctxt.setLineDash(attributes.dash)
					ctxt.lineWidth = attributes.width || defaultLineWidth
					ctxt.strokeStyle = attributes.color || 'black'
					ctxt.beginPath()
					ctxt.moveTo(pp1.x, pp1.y)
					ctxt.lineTo(pp2.x, pp2.y)
					ctxt.stroke()
					ctxt.setLineDash([])
				}
			}
		}
        objects.forEach(object => {
			paintObject(object)
		})
    }, [objects, width, height, draggingObject, dragState.isActive, dragState.dragRect])

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
        dragStateDispatch({type: 'DRAG_MOUSE_DOWN', point: [p.x, p.y]})
    }, [])
	const handleMouseUp = useCallback((e: React.MouseEvent) => {
		const boundingRect = e.currentTarget.getBoundingClientRect()
		const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
		if (!dragState.isActive) {
			let found = false
			for (let i = objects.length - 1; i >= 0; i--) {
				const o = objects[i]
				if (o.clickable) {
					if (pointInObject(o, p)) {
						found = true
						onClickObject && onClickObject(o.objectId, e)
						break
					}
				}
			}
			if (!found) {
				if (!draggingObject.object) {
					onClick && onClick(p, e)
				}
			}
		}
		if ((draggingObject.newPoint) && (draggingObject.object)) {
			onDragObject && onDragObject(draggingObject.object.objectId, draggingObject.newPoint, e)
		}
		setActiveMouseEvent(e)
		dragStateDispatch({type: 'DRAG_MOUSE_UP', point: [p.x, p.y]})
    }, [dragState.isActive, objects, onClickObject, onClick, draggingObject.newPoint, draggingObject.object, onDragObject])
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

const defaultDragStyle = 'rgba(196, 196, 196, 0.5)'

const pointInObject = (o: Scene2dObject, p: {x: number, y: number}) => {
	if (o.type === 'marker') {
		const r = o.attributes.radius || defaultMarkerRadius
		const R: RectangularRegion = {xmin: o.x - r, ymin: o.y - r, xmax: o.x + r, ymax: o.y + r}
		return pointInRect([p.x, p.y], R)
	}
	else return false
}

export default Scene2d
