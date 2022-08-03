import BaseCanvas from 'FigurlCanvas/BaseCanvas'
import { norm } from 'mathjs'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef } from 'react'
import useWheelHandler, { useWheelDebouncer } from './AnimationControls/useWheelHandler'
import { AnimationStateDispatcher } from './AnimationStateReducer'

export type AnimationStatePlaybackBarLayerProps = {
    width: number
    height: number
    dispatch: AnimationStateDispatcher<any>
    visibleWindow: [number, number]
    currentFrameIndex: number
    isPlaying: boolean
    leftOffset: number
    rightOffset?: number
    styling?: ScrubberStyle
}

export type ScrubberStyle = {
    leftMargin: number
    barHeight: number
    seenFillStyle: string
    unseenFillStyle: string
    scrubberFillStyle: string
    scrubberRadius: number
}

// TODO: Expose configuration for this styling
// TODO: set vertical stuff based on actual height rather than assuming a constant?
const defaultStyling: ScrubberStyle = {
    leftMargin: 15,
    barHeight: 6,
    seenFillStyle: 'rgb(130, 130, 130)',
    unseenFillStyle: 'rgb(180, 14, 0)',
    scrubberFillStyle: 'rgb(220, 220, 220)',
    scrubberRadius: 10
}

// NOTE: TODO maybe -- this uses a 0-based "seenX" value, which would assume the bar starts
// all the way to the left of the canvas. The draw function adds the left-margin padding.
// That's a little confusing, but so it goes.
const draw = (context: CanvasRenderingContext2D, props: ControlsDrawData) => {
    const { seenX, barWidth, styling } = props
    console.log(`seenx: ${seenX} barWidth: ${barWidth}`)
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    const unseen = barWidth - seenX
    context.font = `${Math.floor(context.canvas.height/2)}px FontAwesome`
    const verticalPadding = Math.floor((context.canvas.height - styling.barHeight)/2)
    context.fillStyle = styling.seenFillStyle
    context.fillRect(styling.leftMargin, verticalPadding, seenX, styling.barHeight)
    context.fillStyle = styling.unseenFillStyle
    context.fillRect(seenX + styling.leftMargin, verticalPadding, unseen, styling.barHeight)
    context.fillStyle = styling.scrubberFillStyle
    // Question: is it worth it to make it a tiny bit faster by using FontAwesome icons?
    // context.textAlign = 'center'
    // context.textBaseline = 'middle'    context.beginPath()
    // context.fillText(`\uf111`, seen + leftMargin, context.canvas.height / 2) // solid circle
    context.beginPath()
    context.arc(seenX + styling.leftMargin, context.canvas.height / 2, styling.scrubberRadius, 0, 2*Math.PI)
    context.fill()
}

type ControlsDrawData = {
    seenX: number
    barWidth: number
    styling: ScrubberStyle
}

// const useDebouncedWheelHandler = (dispatch: AnimationStateDispatcher<any>, isPlaying: boolean) => {
//     // console.log(`Creating wheel handler debouncer.`) // Shows this fires on every bar click... odd.
//     const wheelCount = useRef<number>(0)
//     const useFineWheel = useRef<boolean>(false)
//     const wheelDebounceRequest = useRef<number | undefined>(undefined)
//     const debounceWheel = useCallback(() => {
//         if (wheelDebounceRequest.current) {
//             if (wheelCount.current !== 0 && !isPlaying) {
//                 dispatch({type: 'SKIP', backward: wheelCount.current < 0, fineSteps: Math.abs(wheelCount.current), frameByFrame: useFineWheel.current})
//             }
//             useFineWheel.current = false
//             wheelCount.current = 0
//             wheelDebounceRequest.current = undefined
//         }
//     }, [dispatch, isPlaying])
//     const handleWheel = useCallback((e: React.WheelEvent) => {
//         if (e.deltaY === 0 || isPlaying) return
//         useFineWheel.current = e.shiftKey
//         wheelCount.current += (e.deltaY > 0 ? 1 : -1)
//         if (!wheelDebounceRequest.current) {
//             wheelDebounceRequest.current = window.requestAnimationFrame(debounceWheel)
//         }
//     }, [debounceWheel, isPlaying])

//     return handleWheel
// }


type LogicalBarStatus = 'scrubber' | 'bar' | undefined
export type LogicalBarInterpreter = (x: number, y: number) => LogicalBarStatus
const _mouseEventBarStatus = (x: number, y: number, scrubberCenterX: number, scrubberRadius: number, canvasVMidline: number): LogicalBarStatus => {
    const xOffset = x - scrubberCenterX
    const yOffset = canvasVMidline - y
    // case 1: click is on the scrubber
    return norm([xOffset, yOffset], 2) < scrubberRadius
        ? 'scrubber'
        // case 2: not on scrubber but within scrubber's height of bar
        : Math.abs(yOffset) < scrubberRadius
            ? 'bar'
            : undefined // case 3: not on bar or scrubber
}

const _xToFrame = (x: number, framesPerPixel: number, firstFrame: number) => {
    return Math.floor(x * framesPerPixel) + firstFrame
}


const _frameToPixelX = (framesPastInitialFrame: number, framesPerPixel: number) => {
    return Math.floor(framesPastInitialFrame/framesPerPixel)
}

const _getEventPoint = (e: React.MouseEvent, totalLeftOffset: number) => {
    const boundingRect = e.currentTarget.getBoundingClientRect()
    const point = [e.clientX - boundingRect.x - totalLeftOffset, e.clientY - boundingRect.y]
    return point
}


const AnimationStatePlaybackBarLayer: FunctionComponent<AnimationStatePlaybackBarLayerProps> = (props: AnimationStatePlaybackBarLayerProps) => {
    const { width, height, dispatch, isPlaying, visibleWindow, currentFrameIndex, leftOffset, rightOffset, styling } = props
    const currentElapsedFrames = currentFrameIndex - visibleWindow[0]
    const _styling = useMemo(() => styling ? styling : defaultStyling, [styling])
    const barCanvasVCenter = useMemo(() => height / 2, [height])
    const barCanvasWidth = useMemo(() => width - leftOffset - (rightOffset ?? 0), [width, leftOffset, rightOffset])
    const barWidth = useMemo(() => barCanvasWidth - (_styling.leftMargin * 2), [barCanvasWidth, _styling.leftMargin])
    const framesPerPixel = useMemo(() => (visibleWindow[1] - visibleWindow[0])/barWidth, [visibleWindow, barWidth])
    const getEventPoint = useCallback((e: React.MouseEvent) => _getEventPoint(e, (leftOffset + _styling.leftMargin)), [leftOffset, _styling.leftMargin])
    const xToFrame = useCallback((x: number) => _xToFrame(x, framesPerPixel, visibleWindow[0]), [framesPerPixel, visibleWindow])
    const frameToPixelX = useCallback((elapsedFrames: number) => _frameToPixelX(elapsedFrames, framesPerPixel), [framesPerPixel])
    const scrubberCenterX = useMemo(() => frameToPixelX(currentElapsedFrames), [frameToPixelX, currentElapsedFrames])
    const barInterpreter: LogicalBarInterpreter = useCallback((x, y) => _mouseEventBarStatus(x, y, scrubberCenterX, _styling.scrubberRadius, barCanvasVCenter),
        [scrubberCenterX, _styling.scrubberRadius, barCanvasVCenter])
    const getFrameFromMouseEvent = useCallback((x: number, y: number) => barInterpreter(x, y) ? xToFrame(x) : undefined, [barInterpreter, xToFrame])

    const drawData = useMemo(() => {
        return { seenX: scrubberCenterX, barWidth, styling: _styling }
    }, [scrubberCenterX, barWidth, _styling])
    

    // const handleWheel = useDebouncedWheelHandler(dispatch, isPlaying)
    const playingRef = useRef<boolean>(isPlaying)
    useEffect(() => { playingRef.current = isPlaying }, [isPlaying])
    const wheelDebouncer = useWheelDebouncer(dispatch, playingRef)
    const handleWheel = useWheelHandler(wheelDebouncer, playingRef)


    const draggingXRef = useRef<number | undefined>(undefined)
    const wasPlayingRef = useRef<boolean>(false)
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const [x, y] = getEventPoint(e)
        if (norm([x - drawData.seenX, barCanvasVCenter - y], 2) < defaultStyling.scrubberRadius)
        {
            // start dragging
            draggingXRef.current = x
            // and pause while dragging, if we were already playing
            if (isPlaying) {
                wasPlayingRef.current = true
                dispatch({type: 'TOGGLE_PLAYBACK'})
            }
        }
        else {
            const newFrame = getFrameFromMouseEvent(x, y)
            if (!newFrame) return
            dispatch({type: 'SET_CURRENT_FRAME', newIndex: newFrame})
        }
    }, [getEventPoint, drawData.seenX, barCanvasVCenter, isPlaying, dispatch, getFrameFromMouseEvent])

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (draggingXRef.current && wasPlayingRef.current && !isPlaying) {
            dispatch({type: 'TOGGLE_PLAYBACK'})
            wasPlayingRef.current = false
        }
        draggingXRef.current = undefined
    }, [dispatch, isPlaying])

    // TODO: Break drag debounce stuff into a more self-contained hook?
    const dragTargetFrameRef = useRef<number | undefined>(undefined)
    const nextDebounceRequest = useRef<number | undefined>(undefined)
    const debounceSetFrame = useCallback(() => {
        if (draggingXRef.current && dragTargetFrameRef.current) {
            if (dragTargetFrameRef.current !== currentFrameIndex) {
                dispatch({type: 'SET_CURRENT_FRAME', newIndex: dragTargetFrameRef.current})
            }
            nextDebounceRequest.current = window.requestAnimationFrame(debounceSetFrame)
        } else {
            if (nextDebounceRequest.current) {
                window.cancelAnimationFrame(nextDebounceRequest.current)
            }
            nextDebounceRequest.current = undefined
            dragTargetFrameRef.current = undefined
        }
    }, [currentFrameIndex, dispatch])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!draggingXRef.current) return

        const [x, y] = getEventPoint(e)
        if (Math.abs(x - draggingXRef.current) > 2) {
            dragTargetFrameRef.current = getFrameFromMouseEvent(x, y)
            draggingXRef.current = x
            debounceSetFrame()
        }
    }, [debounceSetFrame, getEventPoint, getFrameFromMouseEvent])

    return (
        <div onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
        >
            <BaseCanvas<ControlsDrawData>
                width={barCanvasWidth}
                height={height}
                hOffsetPx={leftOffset}
                draw={draw}
                drawData={drawData}
            />
        </div>
    )
}

export default AnimationStatePlaybackBarLayer
