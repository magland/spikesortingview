import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isNumber } from "figurl/viewInterface/validateObject"

export type RawTracesViewData = {
    type: 'RawTraces'
    startTimeSec: number
    samplingFrequency: number
    numFrames: number
    chunkSize: number
    tracesChunks: {[key: string]: string | {min: string, max: string}}
    channelIds: number[]
}

export const isRawTracesViewData = (x: any): x is RawTracesViewData => {
    return validateObject(x, {
        type: isEqualTo('RawTraces'),
        startTimeSec: isNumber,
        samplingFrequency: isNumber,
        numFrames: isNumber,
        chunkSize: isNumber,
        tracesChunks: () => (true),
        channelIds: isArrayOf(isNumber)
    })
}