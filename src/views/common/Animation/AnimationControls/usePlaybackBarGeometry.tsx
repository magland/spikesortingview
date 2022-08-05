import { norm } from 'mathjs'
import React, { useCallback, useMemo } from 'react'
import { defaultStyling, ProgressBarDrawData, ScrubberStyle } from '../AnimationStatePlaybackBarLayer'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

export type AnimationStatePlaybackBarGeometryProps = {
    width: number
    height: number
    dispatch: AnimationStateDispatcher<any>
    visibleWindow: [number, number]
    currentFrameIndex: number
    isPlaying: boolean
    leftOffset: number
    rightOffset?: number
    styling?: ScrubberStyle
    baseDrawFn: (context: CanvasRenderingContext2D, props: ProgressBarDrawData, barWidth: number, styling: ScrubberStyle) => void
}


export type LogicalBarStatus = 'scrubber' | 'bar' | undefined
export type LogicalBarInterpreter = (x: number, y: number) => LogicalBarStatus
const _barInterpreter = (x: number, y: number, scrubberCenterX: number, scrubberRadius: number, canvasVMidline: number): LogicalBarStatus => {
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

const _xToFrame = (x: number, framesPerPixel: number, firstFrame: number, barWidth: number) => {
    const boundedPixelX = Math.min(Math.max(0, x), barWidth)
    return Math.floor(boundedPixelX * framesPerPixel) + firstFrame
}

const _frameToPixelX = (framesPastInitialFrame: number, framesPerPixel: number) => {
    return Math.floor(framesPastInitialFrame/framesPerPixel)
}

const _getEventPoint = (e: React.MouseEvent, totalLeftOffset: number) => {
    const boundingRect = e.currentTarget.getBoundingClientRect()
    const point = [e.clientX - boundingRect.x - totalLeftOffset, e.clientY - boundingRect.y]
    return point
}

const usePlaybackBarGeometry = (props: AnimationStatePlaybackBarGeometryProps) => {
    const { width, height, visibleWindow, leftOffset, rightOffset, styling, currentFrameIndex, baseDrawFn } = props

    const currentElapsedFrames = currentFrameIndex - visibleWindow[0]
    const _styling = useMemo(() => styling ? styling : defaultStyling, [styling])
    
    const barCanvasVCenter = useMemo(() => height / 2, [height])
    const barCanvasWidth = useMemo(() => width - leftOffset - (rightOffset ?? 0), [width, leftOffset, rightOffset])

    const barWidth = useMemo(() => barCanvasWidth - (_styling.leftMargin * 2), [barCanvasWidth, _styling.leftMargin])
    const framesPerPixel = useMemo(() => (visibleWindow[1] - visibleWindow[0])/barWidth, [visibleWindow, barWidth])

    console.log(`Frames per pixel: ${framesPerPixel} visibleWindow: ${visibleWindow} barWidth: ${barWidth}`)
    const xToFrame = useCallback((x: number) => _xToFrame(x, framesPerPixel, visibleWindow[0], barWidth), [framesPerPixel, visibleWindow, barWidth])
    const getEventPoint = useCallback((e: React.MouseEvent) => _getEventPoint(e, (leftOffset + _styling.leftMargin)), [leftOffset, _styling.leftMargin])
    const frameToPixelX = useCallback((elapsedFrames: number) => _frameToPixelX(elapsedFrames, framesPerPixel), [framesPerPixel])

    // TODO: It'd be nice to keep this entirely styling-related, get the references to the current elapsed frames (and downstream) out of it...
    const scrubberCenterX = useMemo(() => frameToPixelX(currentElapsedFrames), [frameToPixelX, currentElapsedFrames])
    const barInterpreter: LogicalBarInterpreter = useCallback((x, y) => _barInterpreter(x, y, scrubberCenterX, _styling.scrubberRadius, barCanvasVCenter),
        [scrubberCenterX, _styling.scrubberRadius, barCanvasVCenter])
    const barClickToFrame = useCallback((x: number, y: number) => barInterpreter(x, y) ? xToFrame(x) : undefined, [barInterpreter, xToFrame])
    const draw = useCallback((context: CanvasRenderingContext2D, props: ProgressBarDrawData) => baseDrawFn(context, props, barWidth, _styling), [barWidth, _styling, baseDrawFn])

    return { barWidth, draw, scrubberCenterX, barInterpreter, getEventPoint, barClickToFrame, xToFrame, frameToPixelX, barCanvasWidth }
}


export default usePlaybackBarGeometry
