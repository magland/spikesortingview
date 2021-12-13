import { validateObject } from "figurl"
import { isEqualTo, isNumber } from "figurl/viewInterface/validateObject"

export type LivePositionPdfPlotViewData = {
    type: 'LivePositionPdfPlot'
    pdfObject: any
    startTimeSec: number
    endTimeSec: number
    samplingFrequency: number
    numPositions: number
    segmentSize: number
    multiscaleFactor: number
}

export const isLivePositionPdfPlotViewData = (x: any): x is LivePositionPdfPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('LivePositionPdfPlot'),
        pdfObject: () => (true),
        startTimeSec: isNumber,
        endTimeSec: isNumber,
        samplingFrequency: isNumber,
        numPositions: isNumber,
        segmentSize: isNumber,
        multiscaleFactor: isNumber
    }, {allowAdditionalFields: true})
}