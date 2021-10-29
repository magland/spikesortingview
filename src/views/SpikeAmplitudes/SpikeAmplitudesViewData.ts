import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isNumber } from "figurl/viewInterface/validateObject"

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
}

export const isSpikeAmplitudesViewData = (x: any): x is SpikeAmplitudesViewData => {
    return validateObject(x, {
        type: isEqualTo('SpikeAmplitudes'),
        startTimeSec: isNumber,
        endTimeSec: isNumber,
        units: isArrayOf(isSAUnitData)
    })
}