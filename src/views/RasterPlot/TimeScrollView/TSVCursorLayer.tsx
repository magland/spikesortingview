import BaseCanvas from 'FigurlCanvas/BaseCanvas';
import React, { useMemo } from 'react';

export type TSVCursorLayerProps = {
    timeRange: [number, number]
    focusTimePixels?: number
    margins: {left: number, right: number, top: number, bottom: number}
    width: number
    height: number
}

const paintCursor = (context: CanvasRenderingContext2D, props: TSVCursorLayerProps) => {
    const {margins, focusTimePixels} = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

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
    const {width, height, timeRange, focusTimePixels, margins} = props
    const drawData = useMemo(() => ({
        width, height, timeRange, focusTimePixels, margins,
    }), [width, height, timeRange, focusTimePixels, margins])

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