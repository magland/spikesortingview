import { validateObject } from "figurl"
import { isEqualTo, isNumber, isOneOf, isString } from "figurl/viewInterface/validateObject"

export type UnitLocationsViewData = {
    type: 'UnitLocations'
    channelLocations: {[key: string]: number[]}
    units: {
        unitId: string | number
        x: number
        y: number
    }[]
}

export const isUnitLocationsViewData = (x: any): x is UnitLocationsViewData => {
    return validateObject(x, {
        type: isEqualTo('UnitLocations'),
        channelLocations: () => (true),
        units: y => (validateObject(y, {
            unitId: isOneOf([isString, isNumber]),
            x: isNumber,
            y: isNumber
        }))
    })
}