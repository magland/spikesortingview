import { useMemo } from 'react'
import AnimationStateControlButtons from './AnimationStateControlButtons'
import AnimationStatePlaybackBarLayer from './AnimationStatePlaybackBarLayer'
import { AnimationStateDispatcher } from './AnimationStateReducer'

export type AnimationPlaybackControlsProps<T> = {
    width: number
    height: number
    verticalOffset: number
    dispatch: AnimationStateDispatcher<T>
    totalFrameCount: number
    visibleWindow: [number, number]
    currentFrameIndex: number
    isPlaying: boolean
    playbackRate: number
    customPlaybackRates?: number[]
    usingRateButtons?: boolean
}

// TODO: Allow changing?
const buttonWidthPx = 280

const AnimationPlaybackControls = <T, >(props: AnimationPlaybackControlsProps<T>) => {
    const { width, height, verticalOffset, dispatch, isPlaying, totalFrameCount, visibleWindow, currentFrameIndex, playbackRate, usingRateButtons, customPlaybackRates } = props
    const ctrlPanelDiv = useMemo(() => {
        return (<AnimationStateControlButtons
            height={height}
            dispatch={dispatch}
            isPlaying={isPlaying}
            buttonWidthPx={buttonWidthPx}
            playbackRate={playbackRate}
            customPlaybackRates={customPlaybackRates}
            usingRateButtons={usingRateButtons}
        />)
    }, [height, dispatch, isPlaying, playbackRate, customPlaybackRates, usingRateButtons])

    const barLayerDiv = useMemo(() => {
        return (<AnimationStatePlaybackBarLayer<T>
            width={width}
            height={height}
            buttonPanelOffset={buttonWidthPx}
            dispatch={dispatch}
            visibleWindow={visibleWindow}
            currentFrameIndex={currentFrameIndex}
            isPlaying={isPlaying}
        />)
    }, [currentFrameIndex, dispatch, height, isPlaying, visibleWindow, width])

    return (
        <div
            style={{position: 'absolute', top: verticalOffset, userSelect: "none"}}
        >
            {ctrlPanelDiv}
            {barLayerDiv}
        </div>
    )
}

export default AnimationPlaybackControls
