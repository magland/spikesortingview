import React, { FunctionComponent, useMemo } from 'react';
import BarPlotMainLayer, { BarBox, BarPlotTick } from './BarPlotMainLayer';

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
    ticks: BarPlotTick[]
    xLabel?: string
}

export type Margins = {
    left: number, right: number, top: number, bottom: number
}

const BarPlot: FunctionComponent<Props> = ({bars, ticks, xLabel, width, height}) => {
    const {xMin, xMax} = useMemo(() => (
        {xMin: bars[0].xStart, xMax: bars[bars.length - 1].xEnd}
    ), [bars])
    const yMax = useMemo(() => (
        Math.max(...bars.map(b => (b.height)))
    ), [bars])

    const {barBoxes, margins, pixelTicks}: {barBoxes: BarBox[], margins: Margins, pixelTicks: BarPlotTick[]} = useMemo(() => {
        const margins = {
            left: 3,
            right: 3,
            top: 5,
            bottom: 30
        }
        const W = width - margins.left - margins.right
        const H = height - margins.top - margins.bottom
        const barBoxes = bars.map(bar => ({
            x1: margins.left + (bar.xStart - xMin) / (xMax - xMin) * W,
            x2: margins.left + (bar.xEnd - xMin) / (xMax - xMin) * W,
            y1: margins.top + H * (1 - (bar.height / yMax)),
            y2: margins.top + H,
            tooltip: bar.tooltip
        }))
        const pixelTicks = ticks.map(tick => ({
            x: margins.left + (tick.x - xMin) / (xMax - xMin) * W,
            label: `${tick.label}`
        }))
        return {barBoxes, margins, pixelTicks}
    }, [bars, ticks, xMin, xMax, yMax, width, height])

    return (
        <div style={{width, height, position: 'relative'}}>
            <BarPlotMainLayer
                barBoxes={barBoxes}
                margins={margins}
                pixelTicks={pixelTicks}
                xLabel={xLabel || ''}
                width={width}
                height={height}
            />
        </div>
    )
}

export default BarPlot