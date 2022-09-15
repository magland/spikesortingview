import { Annotation } from 'libraries/context-annotations';
import { BaseCanvas } from 'libraries/figurl-canvas';
import { useCallback } from 'react';

type PixelTimepointAnnotation = {
    annotation: Annotation
    pixelTime: number
}

export type TSVAnnotationLayerProps = {
    timeRange: [number, number]
    margins: {left: number, right: number, top: number, bottom: number}
    pixelTimepointAnnotations: PixelTimepointAnnotation[]
    width: number
    height: number
}

const emptyDrawData = {}

const TSVAnnotationLayer = (props: TSVAnnotationLayerProps) => {
    const {width, height, margins, pixelTimepointAnnotations} = props
    const paint = useCallback((context: CanvasRenderingContext2D) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height)

        for (let x of pixelTimepointAnnotations) {
            // at some point, we may want to do something with the annotation label
            const t = x.pixelTime
            context.strokeStyle = 'orange'
            context.lineWidth = 2.5
            context.beginPath()
            context.moveTo(t, margins.top)
            context.lineTo(t, context.canvas.height - margins.bottom)
            context.stroke()
        }
    }, [margins, pixelTimepointAnnotations])

    return (
        <BaseCanvas
            width={width}
            height={height}
            draw={paint}
            drawData={emptyDrawData}
        />
    )
}

export default TSVAnnotationLayer