import { validateObject } from "libraries/util-validate-object"
import { isArrayOf, isEqualTo, isNumber, optional } from "libraries/util-validate-object"
import { HighlightIntervalSet, isHighlightIntervalSet } from 'libraries/component-time-scroll-view'

type RPPlotData = {
    unitId: number
    spikeTimesSec: number[]
}

const isRPPlotData = (x: any): x is RPPlotData => {
    return validateObject(x, {
        unitId: isNumber,
        spikeTimesSec: isArrayOf(isNumber)
    })
}

export type RasterPlotViewData = {
    type: 'RasterPlot'
    startTimeSec: number
    endTimeSec: number
    plots: RPPlotData[]
    highlightIntervals?: HighlightIntervalSet[]
}

export const isRasterPlotViewData = (x: any): x is RasterPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('RasterPlot'),
        startTimeSec: isNumber,
        endTimeSec: isNumber,
        plots: isArrayOf(isRPPlotData),
        highlightIntervals: optional(isArrayOf(isHighlightIntervalSet))
    })
}