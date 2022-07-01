import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isNumber, isOneOf, isString } from "figurl/viewInterface/validateObject"

export type UnitSimilarityMatrixViewData = {
    type: 'UnitSimilarityMatrix'
    unitIds: (number | string)[]
    similarityScores: {
        unitId1: number,
        unitId2: number,
        similarity: number
    }[]
}

export const isUnitSimilarityMatrixViewData = (x: any): x is UnitSimilarityMatrixViewData => {
    return validateObject(x, {
        type: isEqualTo('UnitSimilarityMatrix'),
        unitIds: isArrayOf(isOneOf([isNumber, isString])),
        similarityScores: isArrayOf(y=> (validateObject(y, {
            unitId1: isNumber,
            unitId2: isNumber,
            similarity: isNumber
        })))
    })
}