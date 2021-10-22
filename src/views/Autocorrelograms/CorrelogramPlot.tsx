import React, { FunctionComponent, useMemo } from 'react';
import BarPlot, { BarPlotBar } from './BarPlot/BarPlot';

type Props = {
    binEdgesSec: number[],
    binCounts: number[]
    width: number
    height: number
}

const CorrelogramPlot: FunctionComponent<Props> = ({binEdgesSec, binCounts, width, height}) => {
    const bars: BarPlotBar[] = useMemo(() => (
        binCounts.map((count, ii) => {
            const xStart = binEdgesSec[ii] * 1000
            const xEnd = binEdgesSec[ii + 1] * 1000
            return {
                xStart,
                xEnd,
                height: count,
                tooltip: `[${xStart}, ${xEnd}]: ${count}`
            }
        })
    ), [binCounts, binEdgesSec])
    return (
        <BarPlot
            bars={bars}
            width={width}
            height={height}
        />
    )
}

export default CorrelogramPlot