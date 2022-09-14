import { Annotation } from 'libraries/context-annotations';
import { BaseCanvas } from 'libraries/figurl-canvas';
import { convert1dDataSeries } from 'libraries/util-point-projection';
import { Matrix } from 'mathjs';
import { useCallback } from 'react';

export type TSVAnnotationLayerProps = {
    timeRange: [number, number]
    margins: {left: number, right: number, top: number, bottom: number}
    annotations: Annotation[]
    timeToPixelMatrix: Matrix
    width: number
    height: number
}

const emptyDrawData = {}

const TSVAnnotationLayer = (props: TSVAnnotationLayerProps) => {
    const {width, height, margins, timeToPixelMatrix, annotations} = props
    const paint = useCallback((context: CanvasRenderingContext2D) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    
        const timepointAnnotationTimes = annotations.filter(a => (a.type === 'timepoint')).map(a => (a.timeSec))
        const timepointAnnotationTimesPix = convert1dDataSeries(timepointAnnotationTimes, timeToPixelMatrix)
    
        for (let tp of timepointAnnotationTimesPix) {
            context.strokeStyle = 'orange'
            context.lineWidth = 2.5
            context.beginPath()
            context.moveTo(tp, margins.top)
            context.lineTo(tp, context.canvas.height - margins.bottom)
            context.stroke()
        }
    }, [margins, timeToPixelMatrix, annotations])

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