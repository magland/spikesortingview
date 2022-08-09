import React, { ReactNode, useEffect, useMemo } from "react"
import { CROP_BUTTON } from 'views/common/Animation/AnimationControls/PlaybackCropWindowButton'
import { PlaybackOptionalButtons } from 'views/common/Animation/AnimationControls/PlaybackOptionalButtons'
import { SYNC_BUTTON } from 'views/common/Animation/AnimationControls/PlaybackSyncWindowButton'
import AnimationPlaybackControls from 'views/common/Animation/AnimationPlaybackControls'
import { AnimationState, AnimationStateAction, curryDispatch } from 'views/common/Animation/AnimationStateReducer'

export type FrameAnimationProps<T> = {
    width: number
    height: number
    controlsHeight: number
    state: AnimationState<T>
    dispatch: React.Dispatch<AnimationStateAction<T>>
    dataSeriesFrameRateHz?: number
    children?: ReactNode[]
}


const setupAnimationStateDispatchFn = (animationStateDispatch: React.Dispatch<AnimationStateAction<any>>) => {
    if (!animationStateDispatch) return
    const aniDispatch = curryDispatch(animationStateDispatch)
    animationStateDispatch({
        type: 'SET_DISPATCH',
        animationDispatchFn: aniDispatch
    })
}


const setupReplayRate = (realTimeReplayRateMs: number | undefined, animationStateDispatch: React.Dispatch<AnimationStateAction<any>>) => {
    if (realTimeReplayRateMs && realTimeReplayRateMs !== 0) {
        animationStateDispatch({
            type: 'SET_BASE_MS_PER_FRAME',
            baseMsPerFrame: realTimeReplayRateMs
        })
    }
}


const FrameAnimation = <T, >(props: FrameAnimationProps<T>) => {
    const { width, height, controlsHeight, state, dispatch, dataSeriesFrameRateHz, children } = props

    useEffect(() => {
        const msPerFrame = dataSeriesFrameRateHz !== undefined ? 1000 / dataSeriesFrameRateHz : undefined
        setupReplayRate(msPerFrame, dispatch)
    }, [dataSeriesFrameRateHz, dispatch])
    useEffect(() => setupAnimationStateDispatchFn(dispatch), [dispatch])
    const drawHeight = useMemo(() => height - controlsHeight, [height, controlsHeight])

    const uiFeatures = useMemo(() => {
        return {
            optionalButtons: [ SYNC_BUTTON, CROP_BUTTON ] as PlaybackOptionalButtons[],
            isSynced: state?.windowSynced,
            isCropped: state?.windowSynced || !(state?.window[0] === 0 && state?.window[1] === (state?.frameData?.length - 1))
        }
    }, [state.windowSynced, state.window, state.frameData])

    const controlLayer = useMemo(() => <AnimationPlaybackControls
            width={width}
            height={controlsHeight}
            verticalOffset={drawHeight}
            dispatch={dispatch}
            totalFrameCount={state.frameData.length}
            visibleWindow={state.window}
            windowProposal={state.windowProposal}
            currentFrameIndex={state.currentFrameIndex}
            isPlaying={state.isPlaying}
            playbackRate={state.replayMultiplier}
            ui={uiFeatures}
        />, [width, controlsHeight, drawHeight, dispatch, state.frameData.length, state.window, state.windowProposal, state.currentFrameIndex,
            state.isPlaying, uiFeatures, state.replayMultiplier])
 
    return (
        <div>
            {children}
            {controlLayer}
        </div>
    )
}

export default FrameAnimation
