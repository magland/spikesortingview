import React, { FunctionComponent, useMemo } from 'react';
import BarPlotMainLayer, { BarBox } from './BarPlotMainLayer';

export type BarPlotBar = {
    xStart: number
    xEnd: number
    height: number
    tooltip: string
}

type Props = {
    width: number
    height: number
    bars: BarPlotBar[]
}

const BarPlot: FunctionComponent<Props> = ({bars, width, height}) => {
    const {xMin, xMax} = useMemo(() => (
        {xMin: bars[0].xStart, xMax: bars[bars.length - 1].xEnd}
    ), [bars])
    const yMax = useMemo(() => (
        Math.max(...bars.map(b => (b.height)))
    ), [bars])

    const barBoxes: BarBox[] = useMemo(() => (
        bars.map(bar => ({
            x1: (bar.xStart - xMin) / (xMax - xMin) * width,
            x2: (bar.xEnd - xMin) / (xMax - xMin) * width,
            y1: height * (1 - (bar.height / yMax)),
            y2: height,
            tooltip: bar.tooltip
        }))
    ), [bars, xMin, xMax, yMax, width, height])

    return (
        <div style={{width, height, position: 'relative'}}>
            <BarPlotMainLayer
                barBoxes={barBoxes}
                width={width}
                height={height}
            />
        </div>
    )
}

export default BarPlot