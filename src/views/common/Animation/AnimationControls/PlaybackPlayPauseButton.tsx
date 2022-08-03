import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import '../AnimationControlButtonStyles.css'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

type PlaybackPlayPauseButtonProps = {
    dispatch: AnimationStateDispatcher<any>
    isPlaying: boolean
}


const PlaybackPlayPauseButton = (props: PlaybackPlayPauseButtonProps) => {
    const { dispatch, isPlaying } = props

    const handlePlayPauseClick = useCallback((e: React.MouseEvent) => {
        dispatch({
            type: 'TOGGLE_PLAYBACK'
        })
    }, [dispatch])

    const playPauseIcon = useMemo(() => {
        return isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />
    }, [isPlaying])

    const button = useMemo(() => {
        return (
            <span onMouseDown={handlePlayPauseClick} title="Play/pause">
                {playPauseIcon}
            </span>
        )
    }, [handlePlayPauseClick, playPauseIcon])

    return button
}

export default PlaybackPlayPauseButton
