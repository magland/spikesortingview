import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isNumber } from "figurl/viewInterface/validateObject"

type RPPlotData = {
    unitId: number
    spikeTimesSec: number[]
}

const isRPPlotData = (x: any): x is RPPlotData => {
    return validateObject(x, {
        unitId: isNumber,
        spikeTimesSec: isArrayOf(isNumber)
    },)
}

export type RasterPlotViewData = {
    type: 'RasterPlot'
    startTimeSec: number
    endTimeSec: number
    plots: RPPlotData[]
}

export const isRasterPlotViewData = (x: any): x is RasterPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('RasterPlot'),
        startTimeSec: isNumber,
        endTimeSec: isNumber,
        plots: isArrayOf(isRPPlotData)
    })
}