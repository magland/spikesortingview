import { validateObject } from "libraries/util-validate-object"
import { isBoolean, isEqualTo, isNumber, isOneOf, isString, optional } from "libraries/util-validate-object"

export type UnitLocationsViewData = {
    type: 'UnitLocations'
    channelLocations: {[key: string]: number[]}
    units: {
        unitId: string | number
        x: number
        y: number
    }[]
    disableAutoRotate?: boolean
}

export const isUnitLocationsViewData = (x: any): x is UnitLocationsViewData => {
    return validateObject(x, {
        type: isEqualTo('UnitLocations'),
        channelLocations: () => (true),
        units: y => (validateObject(y, {
            unitId: isOneOf([isString, isNumber]),
            x: isNumber,
            y: isNumber
        })),
        disableAutoRotate: optional(isBoolean)
    })
}