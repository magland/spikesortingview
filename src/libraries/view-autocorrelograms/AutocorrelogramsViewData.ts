import { validateObject } from "@figurl/core-utils"
import { isArrayOf, isEqualTo, isNumber, isOneOf, isString } from "@figurl/core-utils"

type AutocorrelogramData = {
    unitId: number | string
    binEdgesSec: number[]
    binCounts: number[]
}

export const isAutocorrelogramData = (x: any): x is AutocorrelogramData => {
    return validateObject(x, {
        unitId: isOneOf([isNumber, isString]),
        binEdgesSec: isArrayOf(isNumber),
        binCounts: isArrayOf(isNumber)
    },)
}

export type AutocorrelogramsViewData = {
    type: 'Autocorrelograms'
    autocorrelograms: AutocorrelogramData[]
}

export const isAutocorrelogramsViewData = (x: any): x is AutocorrelogramsViewData => {
    return validateObject(x, {
        type: isEqualTo('Autocorrelograms'),
        autocorrelograms: isArrayOf(isAutocorrelogramData)
    })
}