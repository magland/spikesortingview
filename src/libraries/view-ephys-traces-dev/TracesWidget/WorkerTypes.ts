export type TracesData = {
    startFrame: number
    endFrame: number
    data: (Int16Array | Float32Array)[]
}

export type SortingUnits = {
    units: {
        unitId: string | number
        color: string
        peakChannelId?: string | number
        spikeFrames: number[]
    }[]
}

export type Opts = {
    canvasWidth: number
    canvasHeight: number
    margins: {left: number, right: number, top: number, bottom: number}
    visibleStartTimeSec: number
    visibleEndTimeSec: number
    channels: {
        channelId: string | number
        offset: number
        scale: number
    }[]
    samplingFrequency: number
    zoomInRequired: boolean
}