import { validateObject } from "libraries/util-validate-object"
import { isArrayOf, isEqualTo, isNumber, isString } from "libraries/util-validate-object"

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