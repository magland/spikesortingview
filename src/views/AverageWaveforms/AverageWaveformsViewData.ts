import { validateObject } from "figurl"
import { optional } from "figurl/viewInterface/kacheryTypes"
import { isArrayOf, isEqualTo, isNumber } from "figurl/viewInterface/validateObject"

type AverageWaveformData = {
    unitId: number
    channelIds: number[]
    waveform: number[][]
}

export const isAverageWaveformData = (x: any): x is AverageWaveformData => {
    return validateObject(x, {
        unitId: isNumber,
        channelIds: isArrayOf(isNumber),
        waveform: () => (true)
    },)
}

export type AverageWaveformsViewData = {
    type: 'AverageWaveforms'
    averageWaveforms: AverageWaveformData[]
    samplingFrequency: number
    noiseLevel: number
    channelLocations?: {[key: string]: number[]}
}

export const isAverageWaveformsViewData = (x: any): x is AverageWaveformsViewData => {
    return validateObject(x, {
        type: isEqualTo('AverageWaveforms'),
        averageWaveforms: isArrayOf(isAverageWaveformData),
        samplingFrequency: isNumber,
        noiseLevel: isNumber,
        channelLocations: optional(() => (true))
    })
}