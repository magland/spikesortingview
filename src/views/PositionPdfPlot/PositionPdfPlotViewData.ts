import { validateObject } from "figurl"
import { isEqualTo, isNumber } from "figurl/viewInterface/validateObject"

export type PositionPdfPlotViewData = {
    type: 'PositionPdfPlot'
    timeCoord: number[]
    positionCoord: number[]
    pdf: number[][]
    startTimeSec: number
    endTimeSec: number
}

export const isPositionPdfPlotViewData = (x: any): x is PositionPdfPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('PositionPdfPlot'),
        timeCoord: () => (true),
        positionCoord: () => (true),
        pdf: () => (true),
        startTimeSec: isNumber,
        endTimeSec: isNumber
    }, {allowAdditionalFields: true})
}