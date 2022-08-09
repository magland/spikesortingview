import { useRecordingSelectionTimeInitialization, useTimeFocus, useTimeRange } from 'contexts/RecordingSelectionContext'
import { TwoDTransformProps, use2DTransformationMatrix, useAspectTrimming } from 'FigurlCanvas/CanvasTransforms'
import { Margins } from 'FigurlCanvas/Geometry'
import { matrix, Matrix, multiply, transpose } from 'mathjs'
import React, { Fragment, FunctionComponent, useCallback, useEffect, useMemo } from "react"
import { CROP_BUTTON } from 'views/common/Animation/AnimationControls/PlaybackCropWindowButton'
import { PlaybackOptionalButtons } from 'views/common/Animation/AnimationControls/PlaybackOptionalButtons'
import { SYNC_BUTTON } from 'views/common/Animation/AnimationControls/PlaybackSyncWindowButton'
import AnimationPlaybackControls from 'views/common/Animation/AnimationPlaybackControls'
import AnimationStateReducer, { AnimationState, AnimationStateAction, curryDispatch, makeDefaultState } from 'views/common/Animation/AnimationStateReducer'
import TPADecodedPositionLayer, { useConfiguredPositionDrawFunction } from './TPADecodedPositionLayer'
import { getDecodedPositionFramePx, useProbabilityFrames, useProbabilityLocationsMap } from './TPADecodedPositionLogic'
import TPAPositionLayer from './TPAPositionLayer'
import useTimeLookupFn, { liveMatchFocusToFrame, matchFocusToFrame } from './TPATimeSyncLogic'
import TPATrackLayer from './TPATrackLayer'
import { DecodedPositionData, DecodedPositionFrame, PositionFrame, TrackAnimationStaticData } from "./TrackPositionAnimationTypes"
import useLiveFocusReset from './useLiveFocusReset'

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

const TrackPositionAnimationView: FunctionComponent<TrackPositionAnimationProps> = (props: TrackPositionAnimationProps) => {
    const { data, width, height } = props
    const { xmin, xmax, ymin, ymax, headDirection, samplingFrequencyHz } = data
    const realTimeReplayRateMs = samplingFrequencyHz !== undefined ? 1000 / samplingFrequencyHz : undefined

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
    useRecordingSelectionTimeInitialization(data.timestamps[0] + (data.timestampStart ?? 0), data.timestamps[data.timestamps.length - 1] + (data.timestampStart ?? 0))

    useEffect(() => {
        animationStateDispatch({
            type: 'UPDATE_FRAME_DATA',
            incomingFrames: dataFrames,
            replaceExistingFrames: true
        })
    }, [dataFrames])

    const { focusTime, setTimeFocus } = useTimeFocus()  // state imported from recording context
    const findNearestTime = useTimeLookupFn(animationState)
    const animationCurrentTime = animationState?.frameData[animationState?.currentFrameIndex]?.timestamp
    // TODO: this could probably still be made neater/better compartmentalized
    const { liveFocus, checkFocusWithinEpsilon, cancelPendingRefocus } = useLiveFocusReset(setTimeFocus)
    const onNewFocusTime = useCallback((focusTime: number | undefined) => liveMatchFocusToFrame({
        focusTime,
        checkFocusWithinEpsilon,
        multiplier: animationState.replayMultiplier,
        cancelPendingRefocus,
        findNearestTime,
        animationStateDispatch
    }), [checkFocusWithinEpsilon, animationState.replayMultiplier, cancelPendingRefocus, findNearestTime, animationStateDispatch])
    useEffect(() => onNewFocusTime(focusTime), [onNewFocusTime, focusTime])
    
    useEffect(() => {
        animationState.isPlaying ? liveFocus({ currentTime: animationCurrentTime }) : matchFocusToFrame(animationCurrentTime, setTimeFocus)
    }, [animationCurrentTime, setTimeFocus, animationState.isPlaying, liveFocus])


    const { visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()
    useEffect(() => {
        if (!animationState.windowSynced) return
        const windowBounds: [number, number] | undefined = (visibleTimeStartSeconds === undefined || visibleTimeEndSeconds === undefined)
            ? undefined
            : [(findNearestTime(visibleTimeStartSeconds)?.baseListIndex) as number, (findNearestTime(visibleTimeEndSeconds)?.baseListIndex) as number]
        if (windowBounds) { // Narrow the animation window if "closest frame" falls outside the range due to rounding. Avoids weird sync behavior.
            windowBounds[0] += (animationState.frameData[windowBounds[0]].timestamp || -1) < (visibleTimeStartSeconds ?? 0) ?  1 : 0
            windowBounds[1] += (animationState.frameData[windowBounds[1]].timestamp || -1) > ( visibleTimeEndSeconds  ?? 0) ? -1 : 0
        }
        animationStateDispatch({ type: 'SET_WINDOW', bounds: windowBounds })
    }, [visibleTimeStartSeconds, visibleTimeEndSeconds, animationStateDispatch, findNearestTime, animationState.windowSynced, animationState.frameData])
    useEffect(() => {
        // Reset to full recording when we turn off syncing
        if (animationState.windowSynced) return
        animationStateDispatch({ type: 'SET_WINDOW', bounds: undefined })
    }, [animationState.windowSynced])

    const currentProbabilityFrame = useMemo(() => {
        const linearFrame = animationState.frameData[animationState.currentFrameIndex]?.decodedPositionFrame
        const finalFrame = getDecodedPositionFramePx(linearFrame, decodedLocationsMap)
        return {
            frame: finalFrame
        }
    }, [animationState.currentFrameIndex, animationState.frameData, decodedLocationsMap])

    const currentPositionFrame = useMemo(() => {
        return {
            bottomMargin: finalMargins.bottom,
            frame: animationState.frameData[animationState.currentFrameIndex],
        }
    }, [animationState.currentFrameIndex, animationState.frameData, finalMargins.bottom])

    const uiFeatures = useMemo(() => {
        return {
            optionalButtons: [ SYNC_BUTTON, CROP_BUTTON ] as PlaybackOptionalButtons[],
            isSynced: animationState?.windowSynced,
            isCropped: animationState?.windowSynced || !(animationState?.window[0] === 0 && animationState?.window[1] === (animationState?.frameData?.length - 1))
        }
    }, [animationState.windowSynced, animationState.window, animationState.frameData])

    const trackLayer = useMemo(() => <TPATrackLayer
            width={width}
            height={drawHeight}
            trackBucketRectanglesPx={trackBins}
        />, [width, drawHeight, trackBins])
        
    const configuredPositionDrawFn = useConfiguredPositionDrawFunction('plasma')
    const probabilityLayer = useMemo(() => <TPADecodedPositionLayer
            width={width}
            height={drawHeight}
            drawData={currentProbabilityFrame}
            configuredDrawFnCallback={configuredPositionDrawFn}
        />, [width, drawHeight, currentProbabilityFrame, configuredPositionDrawFn])

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
            visibleWindow={animationState.window}
            windowProposal={animationState.windowProposal}
            currentFrameIndex={animationState.currentFrameIndex}
            isPlaying={animationState.isPlaying}
            playbackRate={animationState.replayMultiplier}
            ui={uiFeatures}
        />, [width, drawHeight, animationState.frameData.length, animationState.window, animationState.windowProposal, animationState.currentFrameIndex,
            animationState.isPlaying, uiFeatures, animationState.replayMultiplier])
 
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
