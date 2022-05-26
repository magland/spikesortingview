import { validateObject } from "figurl";
import { isArrayOf, isEqualTo, isNumber, isString, optional } from "figurl/viewInterface/validateObject";

export type PositionFrame = {
    x: number
    y: number
    headDirection?: number
    timestamp?: number
}

// TODO: These two types may be combined as the streaming/live view is implemented.

/**
 * Data comprising a complete (non-streamed) track animation. The track itself is
 * represented as a set of rectangles, and there are separate lists of timestamps
 * and (presumably corresponding) positions, as well as the track extrema and the
 * optional replay rate (number of animation frames to allocate per time tick).
 * 
 * @member trackBinWidth The width of a single tile in the track, in native units. NOT
 * the width of the overall track.
 * @member trackBinHeight The height of a single tile in the track, in native units. NOT
 * the height of the overall track.
 * @member trackBinULCorners The upper-left corner of each tile in the constituent track,
 * represented as an array of x-coordinates and an array of y-coordinates (i.e. number[2][:]).
 * These are in the native units of the source data.
 * @member timestamps Array of (float) timestamps which should align with the position list.
 * The animal should be observed at position (positions[0][t], positions[1][t]) at time
 * timestamps[t].
 * @member positions Animal position at the aligned timestamp from timestamps, in native units.
 * Represented as an array of x-coordinates and an array of y-coordinates.
 * @member decodedPositions Decoded animal position at the aligned timestamp from timestamps, in native
 * units. The same as positions, except decoded from brain activity rather than physical observation.
 * @member xmin Lowest x-value to display, in native units.
 * @member xmax Highest x-value to display, in native units.
 * @member ymin Lowest y-value to display, in native units.
 * @member ymax Highest y-value to display, in native units.
 * @member headDirection Direction of the subject's head in the xy-plane, in radians.
 * @member realTimeReplayRate Optional, assumed 1000/60. If set, specifies the number of milliseconds per frame to achieve real-time playback.
 */
export type TrackAnimationStaticData = {
    type: 'TrackAnimation'
    trackBinWidth: number
    trackBinHeight: number
    trackBinULCorners: number[][]
    totalRecordingFrameLength: number
    timestamps: number[]
    positions: number[][]
    decodedPositions?: number[][]
    xmin: number
    xmax: number
    ymin: number
    ymax: number
    headDirection?: number[]
    realTimeReplayRateMs?: number
}

export const isTrackAnimationStaticData = (x: any): x is TrackAnimationStaticData => {
    const typeMatch = validateObject(x, {
        type: isEqualTo('TrackAnimation'),
        trackBinWidth: isNumber,
        trackBinHeight: isNumber,
        trackBinULCorners: isArrayOf(isArrayOf(isNumber)),
        totalRecordingFrameLength: isNumber,
        timestamps: isArrayOf(isNumber),
        positions: isArrayOf(isArrayOf(isNumber)),
        decodedPositions: optional(isArrayOf(isArrayOf(isNumber))),
        xmin: isNumber,
        xmax: isNumber,
        ymin: isNumber,
        ymax: isNumber,
        headDirection: optional(isArrayOf(isNumber)),
        realTimeReplayRateMs: optional(isNumber)
    })
    if (typeMatch) {
        const candidate = x as TrackAnimationStaticData
        const rangeFail = candidate.xmin >= candidate.xmax || candidate.ymin >= candidate.ymax
        const trackRectsDimensionsFail = candidate.trackBinULCorners.length !== 2 || candidate.trackBinULCorners[0].length !== candidate.trackBinULCorners[1].length
        const positionDimensionsFail = candidate.positions.length !== 2
        const timesCount = candidate.timestamps.length
        const timestampPositionMismatch = timesCount !== candidate.positions[0].length || timesCount !== candidate.positions[1].length
        const headDirectionLengthMismatch = (candidate.headDirection && candidate.headDirection.length > 0 && timesCount !== candidate.headDirection.length)

        return !(rangeFail || trackRectsDimensionsFail || positionDimensionsFail || timestampPositionMismatch || headDirectionLengthMismatch)
    }

    return false
}


export type TrackAnimationLiveData = {
    type: 'TrackAnimationLive'
    trackBinWidth: number
    trackBinHeight: number
    trackBinULCorners: number[][]
    totalRecordingFrameLength: number
    dataUri: string
    initialReplayRate?: number
}

export const isTrackAnimationLiveData = (x: any): x is TrackAnimationLiveData => {
    return validateObject(x, {
        type: isEqualTo('TrackAnimationLive'),
        trackBinWidth: isNumber,
        trackBinHeight: isNumber,
        trackBinULCorners: isArrayOf(isArrayOf(isNumber)),
        totalRecordingFrameLength: isNumber,
        dataUri: isString,
        initialReplayRate: optional(isNumber)
    })
}
