import { validateObject } from "@figurl/spikesortingview.core-utils"
import { isArrayOf, isBoolean, isEqualTo, isNumber, optional } from "@figurl/spikesortingview.core-utils"

type SAUnitData = {
    unitId: number
    spikeTimesSec: number[]
    spikeAmplitudes: number[]
}

const isSAUnitData = (x: any): x is SAUnitData => {
    return validateObject(x, {
        unitId: isNumber,
        spikeTimesSec: isArrayOf(isNumber),
        spikeAmplitudes: isArrayOf(isNumber),
    })
}

export type SpikeAmplitudesViewData = {
    type: 'SpikeAmplitudes'
    startTimeSec: number
    endTimeSec: number
    units: SAUnitData[]
    hideUnitSelector?: boolean
}

export const isSpikeAmplitudesViewData = (x: any): x is SpikeAmplitudesViewData => {
    return validateObject(x, {
        type: isEqualTo('SpikeAmplitudes'),
        startTimeSec: isNumber,
        endTimeSec: isNumber,
        units: isArrayOf(isSAUnitData),
        hideUnitSelector: optional(isBoolean)
    })
}