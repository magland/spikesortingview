import { validateObject } from "@figurl/spikesortingview.core-utils"
import { isEqualTo } from "@figurl/spikesortingview.core-utils"

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