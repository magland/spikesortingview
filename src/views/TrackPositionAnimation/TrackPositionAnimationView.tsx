import { TwoDTransformProps, use2DTransformationMatrix, useAspectTrimming } from 'FigurlCanvas/CanvasTransforms'
import { Margins } from 'FigurlCanvas/Geometry'
import { matrix, Matrix, multiply, transpose } from 'mathjs'
import React, { Fragment, FunctionComponent, useEffect, useMemo } from "react"
import AnimationPlaybackControls from './AnimationPlaybackControls'
import AnimationStateReducer, { AnimationState, AnimationStateAction, curryDispatch, makeDefaultState } from './AnimationStateReducer'
import TPAPositionLayer from './TPAPositionLayer'
import TPATrackLayer from './TPATrackLayer'
import { PositionFrame, TrackAnimationStaticData } from "./TrackPositionAnimationTypes"

// TODO: Implement streaming / live view
// TODO: Could create a version of this with an arbitrary array of position information streams

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

const useTrackBinPixelDimensions = (transform: Matrix, trackRectPoints: number[][], trackRectWidth: number, trackRectHeight: number) => {
    return useMemo(() => {
        const flippedY = (transform.valueOf() as number[][])[1][1] < 0 ? true : false
        const sourcePoints = [trackRectPoints[0], trackRectPoints[1], new Array(trackRectPoints[0].length).fill(1)]
        const all = matrix([[trackRectWidth, ...sourcePoints[0]], [trackRectHeight, ...sourcePoints[1]], [0, ...sourcePoints[2]]])
        const converted = multiply(transform, all).valueOf() as any as number[][]
        const trackRectPixelWidth = converted[0].shift() as number
        const trackRectPixelHeight = (flippedY ? -1 : 1) * (converted[1].shift() as number)
        const rects = transpose(converted).map(pt => { return [...pt, trackRectPixelWidth, trackRectPixelHeight] })
        return rects
    }, [transform, trackRectPoints, trackRectWidth, trackRectHeight])
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

type TPAReducer = React.Reducer<AnimationState<PositionFrame>, AnimationStateAction<PositionFrame>>
const initialState = makeDefaultState<PositionFrame>()

const TrackPositionAnimationView: FunctionComponent<TrackPositionAnimationProps> = (props: TrackPositionAnimationProps) => {
    const { data, width, height } = props
    const { xmin, xmax, ymin, ymax, initialReplayRate } = data
    // Note: to expose this to other components, may wish to elevate to a full context
    const [animationState, animationStateDispatch] = React.useReducer<TPAReducer>(AnimationStateReducer, initialState)
    useEffect(() => {
        if (!animationStateDispatch) return
        const aniDispatch = curryDispatch(animationStateDispatch)
        animationStateDispatch({
            type: 'SET_DISPATCH',
            animationDispatchFn: aniDispatch
        })
    }, [animationStateDispatch])
    useEffect(() => {
        if (initialReplayRate && initialReplayRate !== 0) {
            animationStateDispatch({
                type: 'SET_REPLAY_RATE',
                newRate: initialReplayRate
            })
        }
    })

    const drawHeight = height - controlsHeight

    // We call the final-margin computation manually so we know the bottom margin for timestamp display.
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
            preserveDataAspect: false // don't recompute the final margins--we did it manually
        }
    }, [width, drawHeight, xmin, xmax, ymin, ymax, finalMargins])
    const transform = use2DTransformationMatrix(matrixProps)
    const trackBins = useTrackBinPixelDimensions(transform, data.trackBinULCorners, data.trackBinWidth, data.trackBinHeight)

    const trackLayer = useMemo(() => {
        return <TPATrackLayer
            width={width}
            height={drawHeight}
            trackBucketRectanglesPx={trackBins}
        />
    }, [width, drawHeight, trackBins])

    // TODO: Implement support for appending to position data (for a live/streaming context)
    const positionSet = useMemo(() => {
        return data.positions
    }, [data.positions])

    const positions = usePixelPositions(transform, positionSet)
    const positionFrames: PositionFrame[] = useMemo(() => {
        if (positions === undefined) return []
        return positions.map((p, i) => {return {x: p[0], y: p[1], timestamp: data.timestamps[i] }})
    }, [positions, data.timestamps])

    useEffect(() => {
        animationStateDispatch({
            type: 'UPDATE_FRAME_DATA',
            incomingFrames: positionFrames,
            replaceExistingFrames: true
        })
    }, [positionFrames])

    // TODO: Implement support for optional additional position streams (e.g. DecodedPosition)

    const frameData = useMemo(() => {
        return {
            bottomMargin: finalMargins.bottom,
            frame: animationState.frameData[animationState.currentFrameIndex],
        }
    }, [animationState.currentFrameIndex, animationState.frameData, finalMargins.bottom])

    const positionLayer = useMemo(() => {
        return <TPAPositionLayer
            width={width}
            height={drawHeight}
            drawData={frameData}
        />
    }, [width, drawHeight, frameData])
    const controlLayer = useMemo(() => {
        return <AnimationPlaybackControls
            width={width}
            height={controlsHeight}
            verticalOffset={drawHeight}
            dispatch={animationStateDispatch}
            totalFrameCount={animationState.frameData.length}
            currentFrameIndex={animationState.currentFrameIndex}
            isPlaying={animationState.isPlaying}
            playbackRate={animationState.framesPerTick}
        />
    }, [width, drawHeight, animationState.frameData.length, animationState.currentFrameIndex, animationState.isPlaying, animationState.framesPerTick])
 
    return (
    <Fragment>
        <div>
            {trackLayer}
            {positionLayer}
            {controlLayer}
        </div>
    </Fragment>)
}

export default TrackPositionAnimationView
