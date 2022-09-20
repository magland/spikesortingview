import { validateObject } from "@figurl/core-utils"
import { isEqualTo, isNumber, optional } from "@figurl/core-utils"

export type LivePositionPdfPlotViewData = {
    type: 'LivePositionPdfPlot'
    pdfObject: any
    startTimeSec: number
    endTimeSec: number
    samplingFrequency: number
    numPositions: number
    segmentSize: number
    multiscaleFactor: number
    linearPositions?: number[]
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
        multiscaleFactor: isNumber,
        linearPositions: optional(() => (true))
    }, {allowAdditionalFields: true})
}