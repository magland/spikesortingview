import BaseCanvas from 'FigurlCanvas/BaseCanvas';
import React, { FunctionComponent } from 'react';

export type BarBox = {x1: number, x2: number, y1: number, y2: number, tooltip: string}

type Props = {
    barBoxes: BarBox[]
    width: number
    height: number
}

const draw = (context: CanvasRenderingContext2D, barBoxes: BarBox[]) => {
    const color = 'rgb(140, 120, 200)'
    context.fillStyle = color
    
    barBoxes.forEach(b => {
        context.fillRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1)
    })
}

const BarPlotMainLayer: FunctionComponent<Props> = ({barBoxes, width, height}) => {
    return (
        <BaseCanvas
            width={width}
            height={height}
            draw={draw}
            drawData={barBoxes}
        />
    )
}

export default BarPlotMainLayer