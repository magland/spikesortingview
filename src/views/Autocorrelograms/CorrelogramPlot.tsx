import React, { FunctionComponent, useMemo } from 'react';
import BarPlot, { BarPlotBar } from '../common/BarPlot/BarPlot';
import { BarPlotTick } from '../common/BarPlot/BarPlotMainLayer';

type Props = {
    binEdgesSec: number[] | undefined,
    binCounts: number[] | undefined
    color: string
    width: number
    height: number
    hideXAxis?: boolean
}

const determineTickLocationsMsec = (xMin: number, xMax: number): number[] => {
    const xSpan = xMax - xMin
    let interval: number
    if (xSpan <= 30) interval = 10
    else if (xSpan <= 250) interval = 20
    else if (xSpan <= 1000) interval = 50
    else interval = 100
    const ret: number[] = []
    let a = Math.ceil(xMin / interval)
    while (a * interval <= xMax) {
        ret.push(a * interval)
        a ++
    }
    return ret
}

const CorrelogramPlot: FunctionComponent<Props> = ({binEdgesSec, binCounts, color, width, height, hideXAxis}) => {
    const bars: BarPlotBar[] = useMemo(() => (
        (binCounts || []).map((count, ii) => {
            const xStart = (binEdgesSec || [])[ii] * 1000
            const xEnd = (binEdgesSec || [])[ii + 1] * 1000
            return {
                xStart,
                xEnd,
                height: count,
                tooltip: `[${xStart}, ${xEnd}]: ${count}`
            }
        })
    ), [binCounts, binEdgesSec])
    const {xMin, xMax} = useMemo(() => (
        bars.length > 0 ? (
            {xMin: bars[0].xStart, xMax: bars[bars.length - 1].xEnd}
        ) : (
            {xMin: 0, xMax: 1}
        )
    ), [bars])
    const ticks: BarPlotTick[] = useMemo(() => {
        const tickLocations = determineTickLocationsMsec(xMin, xMax)
        return tickLocations.map(x => ({
            x,
            label: `${x}`
        }))
    }, [xMin, xMax])
    return (
        binCounts ? (
            <BarPlot
                bars={bars}
                color={color}
                ticks={hideXAxis ? undefined : ticks}
                width={width}
                height={height}
                xLabel={hideXAxis ? undefined : "dt (msec)"}
            />
        ) : (
            <div
                style={{position: 'relative', width, height, color: 'orange'}}
            />
        )
    )
}

export default CorrelogramPlot