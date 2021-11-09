import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isNumber, isString } from "figurl/viewInterface/validateObject"

export type LiveCrossCorrelogramsViewData = {
    type: 'LiveCrossCorrelograms'
    unitIds: number[]
    dataUri: string
}

export const isLiveCrossCorrelogramsViewData = (x: any): x is LiveCrossCorrelogramsViewData => {
    return validateObject(x, {
        type: isEqualTo('LiveCrossCorrelograms'),
        unitIds: isArrayOf(isNumber),
        dataUri: isString
    })
}