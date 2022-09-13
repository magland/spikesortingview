import { validateObject } from "libraries/util-validate-object"
import { isEqualTo } from "libraries/util-validate-object"

export type ElectrodeGeometryViewData = {
    type: 'ElectrodeGeometry'
    channelLocations: {[key: string]: number[]}
}

export const isElectrodeGeometryViewData = (x: any): x is ElectrodeGeometryViewData => {
    return validateObject(x, {
        type: isEqualTo('ElectrodeGeometry'),
        channelLocations: () => (true)
    })
}