import { validateObject } from "@figurl/core-utils"
import { isArrayOf, isBoolean, isEqualTo, isNumber, isOneOf, isString, optional } from "@figurl/core-utils"

export type SpikeLocationsViewData = {
    type: 'SpikeLocations'
    channelLocations: {[key: string]: number[]}
    units: {
        unitId: string | number
        spikeTimesSec: number[]
        xLocations: number[]
        yLocations: number[]
    }[]
    xRange: [number, number]
    yRange: [number, number]
    hideUnitSelector?: boolean
    disableAutoRotate?: boolean
}

export const isSpikeLocationsViewData = (x: any): x is SpikeLocationsViewData => {
    return validateObject(x, {
        type: isEqualTo('SpikeLocations'),
        channelLocations: () => (true),
        units: y => (validateObject(y, {
            unitId: isOneOf([isString, isNumber]),
            spikeTimesSec: () => (true),
            xLocations: () => (true),
            yLocations: () => (true)
        })),
        xRange: isArrayOf(isNumber),
        yRange: isArrayOf(isNumber),
        hideUnitSelector: optional(isBoolean),
        disableAutoRotate: optional(isBoolean)
    })
}