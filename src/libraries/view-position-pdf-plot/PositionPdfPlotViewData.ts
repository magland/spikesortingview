import { validateObject } from "libraries/util-validate-object"
import { isEqualTo, isNumber } from "libraries/util-validate-object"

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