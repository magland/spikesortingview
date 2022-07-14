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
    color: string
    ticks?: BarPlotTick[]
    xLabel?: string
}

export type Margins = {
    left: number, right: number, top: number, bottom: number
}

const BarPlot: FunctionComponent<Props> = ({bars, color, ticks, xLabel, width, height}) => {
    const {xMin, xMax} = useMemo(() => (
        bars.length > 0 ? (
            {xMin: bars[0].xStart, xMax: bars[bars.length - 1].xEnd}
        ) : (
            {xMin: 0, xMax: 1}
        )
    ), [bars])
    const yMax = useMemo(() => (
        Math.max(...bars.map(b => (b.height)))
    ), [bars])

    const {barBoxes, margins, pixelTicks}: {barBoxes: BarBox[], margins: Margins, pixelTicks?: BarPlotTick[]} = useMemo(() => {
        const margins = {
            left: 3,
            right: 3,
            top: 5,
            bottom: 3 + (xLabel ? 13 : 0) + (ticks ? 13 : 0)
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
        const pixelTicks = ticks ? ticks.map(tick => ({
            x: margins.left + (tick.x - xMin) / (xMax - xMin) * W,
            label: `${tick.label}`
        })) : undefined
        return {barBoxes, margins, pixelTicks}
    }, [bars, ticks, xMin, xMax, yMax, width, height, xLabel])

    return (
        <div style={{width, height, position: 'relative'}}>
            <BarPlotMainLayer
                barBoxes={barBoxes}
                color={color}
                margins={margins}
                pixelTicks={pixelTicks}
                xLabel={xLabel}
                width={width}
                height={height}
            />
        </div>
    )
}

export default BarPlot