import { useMemo } from 'react'
import { PlaybackOptionalButtons } from './AnimationControls/PlaybackOptionalButtons'
import AnimationStatePlaybackBarLayer from './AnimationStatePlaybackBarLayer'
import { AnimationStateDispatcher } from './AnimationStateReducer'
import MainPlaybackControls from './MainPlaybackControls'
import GetSecondaryPlaybackControls from './SecondaryPlaybackControls'

export type AnimationPlaybackControlsProps = {
    width: number
    height: number
    verticalOffset: number
    dispatch: AnimationStateDispatcher<any>
    totalFrameCount: number
    visibleWindow: [number, number]
    currentFrameIndex: number
    isPlaying: boolean
    playbackRate: number
    ui?: ControlFeatures
}

export type ControlFeatures = {
    isSynced?: boolean
    isCropped?: boolean
    optionalButtons?: PlaybackOptionalButtons[]
    usingRateButtons?: boolean
    customPlaybackRates?: number[]
}

// TODO: Allow changing?
const leftButtonWidthPx = 280

const AnimationPlaybackControls = (props: AnimationPlaybackControlsProps) => {
    const { width, height, verticalOffset, dispatch, isPlaying, visibleWindow, currentFrameIndex, playbackRate, ui } = props
    const ctrlPanelDiv = useMemo(() => {
        return (<MainPlaybackControls
            height={height}
            dispatch={dispatch}
            isPlaying={isPlaying}
            buttonWidthPx={leftButtonWidthPx}
            playbackRate={playbackRate}
            ui={ui}
        />)
    }, [height, dispatch, isPlaying, playbackRate, ui])

    const { panelWidth: secondaryControlPanelWidthPx, panel: secondaryPlaybackControlPanel } = GetSecondaryPlaybackControls({...props})

    const barLayerDiv = useMemo(() => {
        return (<AnimationStatePlaybackBarLayer
            width={width}
            height={height}
            leftOffset={leftButtonWidthPx}
            rightOffset={secondaryControlPanelWidthPx}
            dispatch={dispatch}
            visibleWindow={visibleWindow}
            currentFrameIndex={currentFrameIndex}
            isPlaying={isPlaying}
        />)
    }, [currentFrameIndex, dispatch, height, isPlaying, visibleWindow, width, secondaryControlPanelWidthPx])

    return (
        <div style={{position: 'absolute', top: verticalOffset, userSelect: "none"}}>
            {ctrlPanelDiv}
            {barLayerDiv}
            {secondaryPlaybackControlPanel}
        </div>
    )
}

export default AnimationPlaybackControls
