import BaseCanvas from 'FigurlCanvas/BaseCanvas'
import { norm } from 'mathjs'
import React, { useCallback, useMemo, useRef } from 'react'
import { AnimationStateDispatcher } from './AnimationStateReducer'

export type AnimationStatePlaybackBarLayerProps<T> = {
    width: number
    height: number
    dispatch: AnimationStateDispatcher<T>
    visibleWindow: [number, number]
    currentFrameIndex: number
    isPlaying: boolean
    buttonPanelOffset: number
}

// TODO: Expose configuration for this styling?
const leftMargin = 15
const barHeight = 6
const barVerticalPadding = 17
const seenFillStyle = 'rgb(130, 130, 130)'
const unseenFillStyle = 'rgb(180, 14, 0)'
const scrubberFillStyle = 'rgb(220, 220, 220)'
const scrubberRadius = 10

const draw = (context: CanvasRenderingContext2D, props: ControlsDrawData) => {
    const { seenX, barWidth } = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    const unseen = barWidth - seenX
    context.font = `${Math.floor(context.canvas.height/2)}px FontAwesome`
    context.fillStyle = seenFillStyle
    context.fillRect(leftMargin, barVerticalPadding, seenX, barHeight)
    context.fillStyle = unseenFillStyle
    context.fillRect(seenX + leftMargin, barVerticalPadding, unseen, barHeight)
    context.fillStyle = scrubberFillStyle
    // Question: is it worth it to make it a tiny bit faster by using FontAwesome icons?
    // context.textAlign = 'center'
    // context.textBaseline = 'middle'    context.beginPath()
    // context.fillText(`\uf111`, seen + leftMargin, context.canvas.height / 2) // solid circle
    context.beginPath()
    context.arc(seenX + leftMargin, context.canvas.height / 2, scrubberRadius, 0, 2*Math.PI)
    context.fill()
}

type ControlsDrawData = {
    seenX: number
    barWidth: number
    isPlaying: boolean
}

const useDebouncedWheelHandler = (dispatch: AnimationStateDispatcher<any>, isPlaying: boolean) => {
    const wheelCount = useRef<number>(0)
    const useFineWheel = useRef<boolean>(false)
    const wheelDebounceRequest = useRef<number | undefined>(undefined)
    const debounceWheel = useCallback(() => {
        if (wheelDebounceRequest.current) {
            if (wheelCount.current !== 0 && !isPlaying) {
                dispatch({type: 'SKIP', backward: wheelCount.current < 0, fineSteps: Math.abs(wheelCount.current), frameByFrame: useFineWheel.current})
            }
            useFineWheel.current = false
            wheelCount.current = 0
            wheelDebounceRequest.current = undefined
        }
    }, [dispatch, isPlaying])
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.deltaY === 0 || isPlaying) return
        useFineWheel.current = e.shiftKey
        wheelCount.current += (e.deltaY > 0 ? 1 : -1)
        if (!wheelDebounceRequest.current) {
            wheelDebounceRequest.current = window.requestAnimationFrame(debounceWheel)
        }
    }, [debounceWheel, isPlaying])

    return handleWheel
}

// Again, there's no neat way to annotate a FunctionComponent<T> where <T> itself takes a generic type.
// However, the parser can figure out that this is a FunctionComponent, so we just let it infer that
// and annotate the type of the underlying frame set.
const AnimationStatePlaybackBarLayer = <T, >(props: AnimationStatePlaybackBarLayerProps<T>) => {
    const { width, height, dispatch, isPlaying, visibleWindow, currentFrameIndex, buttonPanelOffset } = props
    const totalFrameCount = visibleWindow[1] - visibleWindow[0]
    const currentFrameIndexRelative = currentFrameIndex - visibleWindow[0]
    const barAreaVCenter = useMemo(() => height / 2, [height])
    const drawData = useMemo(() => {
        const barWidth = width - buttonPanelOffset - (leftMargin * 2)
        const seenX = Math.floor(barWidth * currentFrameIndexRelative / totalFrameCount)
        return { seenX, isPlaying, barWidth }
    }, [width, buttonPanelOffset, currentFrameIndexRelative, totalFrameCount, isPlaying])

    const getNewFrame = useCallback((x: number, y:  number) => {
        if (barAreaVCenter - scrubberRadius < y && y < barAreaVCenter + scrubberRadius) {
            const newPct = x/drawData.barWidth
            return Math.floor(newPct * totalFrameCount) + visibleWindow[0]
        }
        return undefined
    }, [barAreaVCenter, drawData.barWidth, totalFrameCount])

    const handleWheel = useDebouncedWheelHandler(dispatch, isPlaying)

    const getEventPoint = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const point = [e.clientX - boundingRect.x - buttonPanelOffset - leftMargin, e.clientY - boundingRect.y]
        return point
    }, [buttonPanelOffset])

    const draggingXRef = useRef<number | undefined>(undefined)
    const wasPlayingRef = useRef<boolean>(false)
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const [x, y] = getEventPoint(e)
        if (norm([x - drawData.seenX, barAreaVCenter - y], 2) < scrubberRadius)
        {
            // start dragging
            draggingXRef.current = x
            // and pause while dragging, if we weren't already playing
            if (isPlaying) {
                wasPlayingRef.current = true
                dispatch({type: 'TOGGLE_PLAYBACK'})
            }
        }
        else {
            const newFrame = getNewFrame(x, y)
            if (!newFrame) return
            dispatch({type: 'SET_CURRENT_FRAME', newIndex: newFrame})
        }
    }, [getEventPoint, drawData.seenX, barAreaVCenter, isPlaying, dispatch, getNewFrame])

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
            dragTargetFrameRef.current = getNewFrame(x, y)
            draggingXRef.current = x
            debounceSetFrame()
        }
    }, [debounceSetFrame, getEventPoint, getNewFrame])

    return (
        <div
            onMouseUp={handleMouseUp}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
        >
            <BaseCanvas<ControlsDrawData>
                width={width - buttonPanelOffset}
                height={height}
                hOffsetPx={buttonPanelOffset}
                draw={draw}
                drawData={drawData}
            />
        </div>
    )
}

export default AnimationStatePlaybackBarLayer
