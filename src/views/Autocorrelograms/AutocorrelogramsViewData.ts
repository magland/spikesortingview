import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isNumber } from "figurl/viewInterface/validateObject"

type AutocorrelogramData = {
    unitId: number
    binEdgesSec: number[]
    binCounts: number[]
}

export const isAutocorrelogramData = (x: any): x is AutocorrelogramData => {
    return validateObject(x, {
        unitId: isNumber,
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