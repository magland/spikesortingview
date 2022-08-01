import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isNumber } from "figurl/viewInterface/validateObject"

export type RawTracesViewData = {
    type: 'RawTraces'
    startTimeSec: number
    samplingFrequency: number
    traces: number[][]
    channelIds: number[]
}

export const isRawTracesViewData = (x: any): x is RawTracesViewData => {
    return validateObject(x, {
        type: isEqualTo('RawTraces'),
        startTimeSec: isNumber,
        samplingFrequency: isNumber,
        traces: () => (true),
        channelIds: isArrayOf(isNumber)
    })
}