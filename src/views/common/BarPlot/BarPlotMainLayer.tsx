import BaseCanvas from 'FigurlCanvas/BaseCanvas';
import React, { FunctionComponent } from 'react';
import { Margins } from './BarPlot';

export type BarBox = {key: string | number, x1: number, x2: number, y1: number, y2: number, tooltip: string, color: string}

export type BarPlotTick = {
    x: number
    label: string
}

type Props = {
    barBoxes: BarBox[]
    margins: Margins
    pixelTicks?: BarPlotTick[]
    xLabel?: string
    width: number
    height: number
}

const draw = (context: CanvasRenderingContext2D, data: Props) => {
    context.clearRect(0, 0, data.width, data.height)
    
    data.barBoxes.forEach(b => {
        context.fillStyle = b.color
        context.fillRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1)
    })

    if (data.xLabel) {
        context.textBaseline = 'bottom'
        context.textAlign = 'center'
        context.fillStyle = 'black'
        context.fillText(data.xLabel, data.width / 2, data.height - 3)
    }

    for (let tick of data.pixelTicks || []) {
        context.strokeStyle = 'black'
        context.beginPath()
        context.moveTo(tick.x, data.height - data.margins.bottom)
        context.lineTo(tick.x, data.height - data.margins.bottom + 6)
        context.stroke()

        context.textBaseline = 'top'
        context.textAlign = 'center'
        context.fillStyle = 'black'
        context.fillText(tick.label, tick.x, data.height - data.margins.bottom + 8)
    }
}

const BarPlotMainLayer: FunctionComponent<Props> = (props) => {
    return (
        <BaseCanvas
            width={props.width}
            height={props.height}
            draw={draw}
            drawData={props}
        />
    )
}

export default BarPlotMainLayer