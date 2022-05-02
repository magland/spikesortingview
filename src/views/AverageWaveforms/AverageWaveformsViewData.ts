import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isNumber, optional } from "figurl/viewInterface/validateObject"

type AverageWaveformData = {
    unitId: number
    channelIds: number[]
    waveform: number[][]
    waveformStdDev?: number[][]
}

export const isAverageWaveformData = (x: any): x is AverageWaveformData => {
    return validateObject(x, {
        unitId: isNumber,
        channelIds: isArrayOf(isNumber),
        waveform: () => (true),
        waveformStdDev: optional(() => (true))
    }, {allowAdditionalFields: true})
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
    }, {allowAdditionalFields: true})
}