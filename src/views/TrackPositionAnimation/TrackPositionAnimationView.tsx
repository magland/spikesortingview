import { TwoDTransformProps, use2DTransformationMatrix, useAspectTrimming } from 'FigurlCanvas/CanvasTransforms'
import { Margins } from 'FigurlCanvas/Geometry'
import { matrix, Matrix, multiply, transpose } from 'mathjs'
import React, { Fragment, FunctionComponent, useEffect, useMemo } from "react"
import AnimationPlaybackControls from 'views/common/Animation/AnimationPlaybackControls'
import AnimationStateReducer, { AnimationState, AnimationStateAction, curryDispatch, makeDefaultState } from 'views/common/Animation/AnimationStateReducer'
import TPADecodedPositionLayer, { ValidColorMap } from './TPADecodedPositionLayer'
import { getDecodedPositionFramePx, useProbabilityFrames, useProbabilityLocationsMap } from './TPADecodedPositionLogic'
import TPAPositionLayer from './TPAPositionLayer'
import TPATrackLayer from './TPATrackLayer'
import { DecodedPositionData, DecodedPositionFrame, PositionFrame, TrackAnimationStaticData } from "./TrackPositionAnimationTypes"

// TODO: Implement streaming / live view

export type TrackPositionAnimationProps = {
    data: TrackAnimationStaticData
    width: number
    height: number
}

const controlsHeight = 40

const defaultMargins: Margins = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 40
}

export const computeTrackBinPixelDimensions = (transform: Matrix, trackRectPoints: number[][], trackRectWidth: number, trackRectHeight: number) => {
    const flippedY = (transform.valueOf() as number[][])[1][1] < 0 ? true : false
    const sourcePoints = [trackRectPoints[0], trackRectPoints[1], new Array(trackRectPoints[0].length).fill(1)]
    const all = matrix([[trackRectWidth, ...sourcePoints[0]], [trackRectHeight, ...sourcePoints[1]], [0, ...sourcePoints[2]]])
    const converted = multiply(transform, all).valueOf() as any as number[][]
    const trackRectPixelWidth = converted[0].shift() as number
    const trackRectPixelHeight = (flippedY ? -1 : 1) * (converted[1].shift() as number)
    // Ensure that there are some actual columns in the resulting matrix: otherwise the transpose will fatally fail
    const perPointView = converted[0].length === 0 ? [] : transpose(converted)
    const rects = perPointView.map(pt => { return [...pt, trackRectPixelWidth, trackRectPixelHeight] })
    return rects
}

const useTrackBinPixelDimensions = (transform: Matrix, trackRectPoints: number[][], trackRectWidth: number, trackRectHeight: number) => {
    return useMemo(() => computeTrackBinPixelDimensions(transform, trackRectPoints, trackRectWidth, trackRectHeight), [transform, trackRectPoints, trackRectWidth, trackRectHeight])
}

const usePixelPositions = (transform: Matrix, points: number[][]) => {
    return useMemo(() => {
        if (points.length === 0) return undefined
        const augmentedNativePoints = matrix([
            points[0],
            points[1],
            new Array(points[0].length).fill(1)
        ])
        const pixelPoints = multiply(transform, augmentedNativePoints).valueOf() as number[][]
        return transpose(pixelPoints) // converts [[xs], [ys]] -> [[x0, y0], [x1, y1], ...]
    }, [transform, points])
}

const useFrames = (
    positions: number[][],
    decodedData: DecodedPositionData | undefined,
    transform: Matrix,
    headDirection: number[] | undefined,
    timestampStart: number | undefined,
    timestamps: number[]
    ) => {
    const positionSet = useMemo(() => {
        return positions
    }, [positions])
    const probabilityFrames = useProbabilityFrames(decodedData)
    const pixelPositions = usePixelPositions(transform, positionSet)
    const positionFrames = usePositionFrames(pixelPositions, timestampStart, timestamps, headDirection, probabilityFrames)

    return positionFrames
}

const usePositionFrames = (positions: number[][] | undefined, timestampStart: number | undefined, timestamps: number[], headDirection: number[] | undefined, decodedData: DecodedPositionFrame[] | undefined): PositionFrame[] => {
    return useMemo(() => {
        if (positions === undefined) return []
        return positions.map((p, i) => {
            return {
                x: p[0],
                y: p[1],
                timestamp: timestamps[i] + (timestampStart || 0),
                headDirection: headDirection && headDirection[i],
                decodedPositionFrame: decodedData && decodedData[i]
            }
        })
    }, [positions, timestampStart, timestamps, headDirection, decodedData])
}

const setupAnimationStateDispatchFn = (animationStateDispatch: React.Dispatch<AnimationStateAction<PositionFrame>>) => {
    if (!animationStateDispatch) return
    const aniDispatch = curryDispatch(animationStateDispatch)
    animationStateDispatch({
        type: 'SET_DISPATCH',
        animationDispatchFn: aniDispatch
    })
}

const setupReplayRate = (realTimeReplayRateMs: number | undefined, animationStateDispatch: React.Dispatch<AnimationStateAction<PositionFrame>>) => {
    if (realTimeReplayRateMs && realTimeReplayRateMs !== 0) {
        animationStateDispatch({
            type: 'SET_BASE_MS_PER_FRAME',
            baseMsPerFrame: realTimeReplayRateMs
        })
    }
}

const useDrawingSpace = (width: number, drawHeight: number, xmax: number, xmin: number, ymax: number, ymin: number) => {
    // We call the final-margin computation manually because we need to track margins for timestamp display
    const finalMargins = useAspectTrimming({
        pixelWidth: width,
        pixelHeight: drawHeight,
        xrange: xmax - xmin,
        yrange: ymax - ymin,
        margins: defaultMargins
    })

    const matrixProps: TwoDTransformProps = useMemo(() => {
        return {
            pixelWidth: width,
            pixelHeight: drawHeight,
            margins: finalMargins,
            xmin, xmax, ymin, ymax,
            invertY: true,
            preserveDataAspect: false // don't recompute the final margins--we already did it manually
        }
    }, [width, drawHeight, xmin, xmax, ymin, ymax, finalMargins])
    const transform = use2DTransformationMatrix(matrixProps)

    return { finalMargins, transform }
}


type TPAReducer = React.Reducer<AnimationState<PositionFrame>, AnimationStateAction<PositionFrame>>
const initialState = makeDefaultState<PositionFrame>()

const snapTimeToGrid = (time: number, timestampStart: number | undefined, timestamps: number[]) => {
    const relativeTime = timestampStart ? time - timestampStart : time

}

const TrackPositionAnimationView: FunctionComponent<TrackPositionAnimationProps> = (props: TrackPositionAnimationProps) => {
    const { data, width, height } = props
    const { xmin, xmax, ymin, ymax, headDirection, samplingFrequencyHz } = data
    const realTimeReplayRateMs = samplingFrequencyHz !== undefined ? 1000 / samplingFrequencyHz : undefined

    // Note: to expose timestamp to other components, may need to elevate to a full context
    const [animationState, animationStateDispatch] = React.useReducer<TPAReducer>(AnimationStateReducer, initialState)
    useEffect(() => setupAnimationStateDispatchFn(animationStateDispatch), [animationStateDispatch])
    useEffect(() => setupReplayRate(realTimeReplayRateMs, animationStateDispatch), [realTimeReplayRateMs, animationStateDispatch])
    const drawHeight = height - controlsHeight
    const { finalMargins, transform } = useDrawingSpace(width, drawHeight, xmax, xmin, ymax, ymin)
    const trackBins = useTrackBinPixelDimensions(transform, data.trackBinULCorners, data.trackBinWidth, data.trackBinHeight)

    // TODO: Implement support for appending to position data (for a live/streaming context)
    const decodedData: DecodedPositionData | undefined = useMemo(() => {
        return data.decodedData 
    }, [data.decodedData])
    const dataFrames = useFrames(data.positions, decodedData, transform, headDirection, data.timestampStart, data.timestamps)
    const decodedLocationsMap = useProbabilityLocationsMap(transform, decodedData)

    useEffect(() => {
        animationStateDispatch({
            type: 'UPDATE_FRAME_DATA',
            incomingFrames: dataFrames,
            replaceExistingFrames: true
        })
    }, [dataFrames])

    const currentProbabilityFrame = useMemo(() => {
        const linearFrame = dataFrames[animationState.currentFrameIndex].decodedPositionFrame
        const finalFrame = getDecodedPositionFramePx(linearFrame, decodedLocationsMap)
        return {
            frame: finalFrame,
            colorMap: 'plasma' as any as ValidColorMap // TODO: This is ugly, should be configured once, not on a per-frame basis
        }
    }, [animationState.currentFrameIndex, dataFrames, decodedLocationsMap])

    const currentPositionFrame = useMemo(() => {
        return {
            bottomMargin: finalMargins.bottom,
            frame: animationState.frameData[animationState.currentFrameIndex],
        }
    }, [animationState.currentFrameIndex, animationState.frameData, finalMargins.bottom])

    const trackLayer = useMemo(() => <TPATrackLayer
            width={width}
            height={drawHeight}
            trackBucketRectanglesPx={trackBins}
        />, [width, drawHeight, trackBins])

    const probabilityLayer = useMemo(() => <TPADecodedPositionLayer
            width={width}
            height={drawHeight}
            drawData={currentProbabilityFrame}
        />, [width, drawHeight, currentProbabilityFrame])

    const positionLayer = useMemo(() => <TPAPositionLayer
            width={width}
            height={drawHeight}
            drawData={currentPositionFrame}
        />, [width, drawHeight, currentPositionFrame])

    const controlLayer = useMemo(() => <AnimationPlaybackControls
            width={width}
            height={controlsHeight}
            verticalOffset={drawHeight}
            dispatch={animationStateDispatch}
            totalFrameCount={animationState.frameData.length}
            currentFrameIndex={animationState.currentFrameIndex}
            isPlaying={animationState.isPlaying}
            playbackRate={animationState.replayMultiplier}
        />, [width, drawHeight, animationState.frameData.length, animationState.currentFrameIndex, animationState.isPlaying, animationState.replayMultiplier])
 
    return (
        <Fragment>
            <div>
                {trackLayer}
                {probabilityLayer}
                {positionLayer}
                {controlLayer}
            </div>
        </Fragment>
    )
}

export default TrackPositionAnimationView
