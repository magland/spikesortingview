import React, { useMemo } from 'react'
import AnimationStateControlButtons from './AnimationStateControlButtons'
import AnimationStatePlaybackBarLayer from './AnimationStatePlaybackBarLayer'
import { AnimationStateDispatcher } from './AnimationStateReducer'

export type TPAControlsProps<T> = {
    width: number
    height: number
    verticalOffset: number
    dispatch: AnimationStateDispatcher<T>
    totalFrameCount: number
    currentFrameIndex: number
    isPlaying: boolean
    playbackRate: number
}

// TODO: Allow changing?
const buttonWidthPx = 280

const AnimationPlaybackControls = <T, >(props: TPAControlsProps<T>) => {
    const { width, height, verticalOffset, dispatch, isPlaying, totalFrameCount, currentFrameIndex, playbackRate } = props
    const ctrlPanelDiv = useMemo(() => {
        return (<AnimationStateControlButtons
            height={height}
            dispatch={dispatch}
            isPlaying={isPlaying}
            buttonWidthPx={buttonWidthPx}
            playbackRate={playbackRate}
        />)
    }, [height, dispatch, isPlaying, playbackRate])

    const barLayerDiv = useMemo(() => {
        return (<AnimationStatePlaybackBarLayer<T>
            width={width}
            height={height}
            buttonPanelOffset={buttonWidthPx}
            dispatch={dispatch}
            totalFrameCount={totalFrameCount}
            currentFrameIndex={currentFrameIndex}
            isPlaying={isPlaying}
        />)
    }, [currentFrameIndex, dispatch, height, isPlaying, totalFrameCount, width])

    return (
        <div
            style={{position: 'absolute', top: verticalOffset}}
        >
            {ctrlPanelDiv}
            {barLayerDiv}
        </div>
    )
}

export default AnimationPlaybackControls
