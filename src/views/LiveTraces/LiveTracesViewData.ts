import { validateObject } from "figurl"
import { isArrayOf, isEqualTo, isNumber, isString } from "figurl/viewInterface/validateObject"

export type LiveTracesViewData = {
    type: 'LiveTraces'
    startTimeSec: number
    samplingFrequency: number
    numFrames: number
    chunkSize: number
    channelIds: number[]
    tracesId: string
}

export const isLiveTracesViewData = (x: any): x is LiveTracesViewData => {
    return validateObject(x, {
        type: isEqualTo('LiveTraces'),
        startTimeSec: isNumber,
        samplingFrequency: isNumber,
        numFrames: isNumber,
        chunkSize: isNumber,
        channelIds: isArrayOf(isNumber),
        tracesId: isString
    })
}