import { validateObject } from "figurl"
import { isEqualTo } from "figurl/viewInterface/validateObject"

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