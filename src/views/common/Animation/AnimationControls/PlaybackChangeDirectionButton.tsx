import { faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import '../AnimationControlButtonStyles.css'
import { ControlFeatures } from '../AnimationPlaybackControls'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

export type PlaybackChangeDirectionButtonProps = {
    dispatch: AnimationStateDispatcher<any>
    playbackRate: number
    ui?: ControlFeatures
}


const PlaybackChangeDirectionButton = (props: PlaybackChangeDirectionButtonProps) => {
    const { dispatch, playbackRate } = props

    const changeDirectionHandler = useCallback((e: React.MouseEvent) => {
        dispatch({
            type: 'SET_REPLAY_RATE',
            newRate: -1 * playbackRate
        })
    }, [dispatch, playbackRate])

    // Alternatively, consider the faArrowRightArrowLeft icon, which wouldn't need to be changed and might be more expressive.
    const directionIcon = useMemo(() => {
        return playbackRate > 0 ? <FontAwesomeIcon icon={faStepBackward} /> : <FontAwesomeIcon icon={faStepForward} />
    }, [playbackRate])

    const button = useMemo(() => {
        return (
            <span onMouseDown={changeDirectionHandler} title="Reverse playback direction">
                {directionIcon}
            </span>
        )
    }, [changeDirectionHandler, directionIcon])

    return button
}

export default PlaybackChangeDirectionButton
