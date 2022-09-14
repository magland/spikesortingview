import { BaseCanvas } from 'libraries/figurl-canvas';
import React, { useMemo } from 'react';

export type TSVCursorLayerProps = {
    timeRange: [number, number]
    focusTimePixels?: number
    focusTimeIntervalPixels?: [number, number]
    margins: {left: number, right: number, top: number, bottom: number}
    width: number
    height: number
}

const paintCursor = (context: CanvasRenderingContext2D, props: TSVCursorLayerProps) => {
    const {margins, focusTimePixels, focusTimeIntervalPixels } = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    // focus time interval
    if (focusTimeIntervalPixels !== undefined) {
        context.fillStyle = 'rgb(255, 225, 225)'
        context.fillRect(focusTimeIntervalPixels[0], margins.top, focusTimeIntervalPixels[1] - focusTimeIntervalPixels[0], context.canvas.height - margins.bottom - margins.top)
    }

    // focus time
    if (focusTimePixels !== undefined) {
        context.strokeStyle = 'red'
        context.beginPath()
        context.moveTo(focusTimePixels, margins.top)
        context.lineTo(focusTimePixels, context.canvas.height - margins.bottom)
        context.stroke()
    }
}

const TSVCursorLayer = (props: TSVCursorLayerProps) => {
    const {width, height, timeRange, focusTimePixels, focusTimeIntervalPixels, margins } = props
    const drawData = useMemo(() => ({
        width, height, timeRange, focusTimePixels, focusTimeIntervalPixels, margins
    }), [width, height, timeRange, focusTimePixels, focusTimeIntervalPixels, margins])

    return (
        <BaseCanvas
            width={width}
            height={height}
            draw={paintCursor}
            drawData={drawData}
        />
    )
}

export default TSVCursorLayer