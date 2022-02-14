import { validateObject } from "figurl"
import { isEqualTo, isNumber } from "figurl/viewInterface/validateObject"

export type RawTracesPlotViewData = {
    type: 'RawTracesPlot'
    startTimeSec: number
    samplingFrequency: number
    traces: number[][]
}

export const isRawTracesPlotViewData = (x: any): x is RawTracesPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('RawTracesPlot'),
        startTimeSec: isNumber,
        samplingFrequency: isNumber,
        traces: () => (true)
    })
}