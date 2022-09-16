import { validateObject } from "@figurl/spikesortingview.core-utils"
import { isEqualTo, isNumber } from "@figurl/spikesortingview.core-utils"

export type PositionPdfPlotViewData = {
    type: 'PositionPdfPlot'
    pdf: number[][]
    samplingFrequency: number
    startTimeSec: number
}

export const isPositionPdfPlotViewData = (x: any): x is PositionPdfPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('PositionPdfPlot'),
        pdf: () => (true),
        samplingFrequency: isNumber,
        startTimeSec: isNumber
    }, {allowAdditionalFields: true})
}