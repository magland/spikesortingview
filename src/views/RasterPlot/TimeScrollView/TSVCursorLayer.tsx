import BaseCanvas from 'FigurlCanvas/BaseCanvas';
import React, { useMemo } from 'react';
import { PixelHighlightSpanSet } from './TimeScrollView';

export type TSVCursorLayerProps = {
    timeRange: [number, number]
    focusTimePixels?: number
    highlightSpans?: PixelHighlightSpanSet[]
    margins: {left: number, right: number, top: number, bottom: number}
    width: number
    height: number
}

const paintCursor = (context: CanvasRenderingContext2D, props: TSVCursorLayerProps) => {
    const {margins, focusTimePixels, highlightSpans} = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    // focus time
    if (focusTimePixels !== undefined) {
        context.strokeStyle = 'red'
        context.beginPath()
        context.moveTo(focusTimePixels, margins.top)
        context.lineTo(focusTimePixels, context.canvas.height - margins.bottom)
        context.stroke()
    }

    if (highlightSpans && highlightSpans.length > 0) {
        paintSpanHighlights(context, margins.top, context.canvas.height - margins.bottom - margins.top, highlightSpans)
    }
}

// some nice purples: [161, 87, 201], or darker: [117, 56, 150]
// dark blue: 0, 30, 255
const defaultSpanHighlightColor = [0, 30, 255]

const paintSpanHighlights = (context: CanvasRenderingContext2D, zeroHeight: number, visibleHeight: number, highlightSets: PixelHighlightSpanSet[]) => {
    highlightSets.forEach(h => {
        const definedColor = h.color || defaultSpanHighlightColor
        const [r, g, b, a] = [...definedColor]
        if (a) context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`

        h.pixelSpans.forEach((span) => {
            if (!a) {
                const alpha = span.width < 2 ? 1 : 0.5
                context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
            }
            context.fillRect(span.start, zeroHeight, span.width, visibleHeight)
        })
    })
}


const TSVCursorLayer = (props: TSVCursorLayerProps) => {
    const {width, height, timeRange, focusTimePixels, margins, highlightSpans} = props
    const drawData = useMemo(() => ({
        width, height, timeRange, focusTimePixels, margins, highlightSpans
    }), [width, height, timeRange, focusTimePixels, margins, highlightSpans])

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