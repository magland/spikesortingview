import { validateObject } from "figurl"
import { isArrayOf, isBoolean, isEqualTo, isNumber, optional } from "figurl/viewInterface/validateObject"

export type CrossCorrelogramData = {
    unitId1: number
    unitId2: number
    binEdgesSec: number[]
    binCounts: number[]
}

export const isCrossCorrelogramData = (x: any): x is CrossCorrelogramData => {
    return validateObject(x, {
        unitId1: isNumber,
        unitId2: isNumber,
        binEdgesSec: isArrayOf(isNumber),
        binCounts: isArrayOf(isNumber)
    },)
}

export type CrossCorrelogramsViewData = {
    type: 'CrossCorrelograms'
    crossCorrelograms: CrossCorrelogramData[]
    hideUnitSelector?: boolean
}

export const isCrossCorrelogramsViewData = (x: any): x is CrossCorrelogramsViewData => {
    return validateObject(x, {
        type: isEqualTo('CrossCorrelograms'),
        crossCorrelograms: isArrayOf(isCrossCorrelogramData),
        hideUnitSelector: optional(isBoolean)
    })
}