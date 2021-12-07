import { validateObject } from "figurl"
import { isEqualTo, isNumber } from "figurl/viewInterface/validateObject"
import { number } from "mathjs"

export type LivePositionPdfPlotViewData = {
    type: 'LivePositionPdfPlot'
    pdfObject: any
    startTimeSec: number
    endTimeSec: number
    samplingFrequency: number
    numPositions: number
}

export const isLivePositionPdfPlotViewData = (x: any): x is LivePositionPdfPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('LivePositionPdfPlot'),
        pdfObject: () => (true),
        startTimeSec: isNumber,
        endTimeSec: isNumber,
        samplingFrequency: isNumber,
        numPositions: number
    }, {allowAdditionalFields: true})
}