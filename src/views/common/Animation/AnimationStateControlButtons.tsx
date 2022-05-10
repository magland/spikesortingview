import { faAngleDown, faAngleUp, faBackward, faFastBackward, faFastForward, faForward, faPause, faPlay, faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import './AnimationControlButtonStyles.css'
import { AnimationStateDispatcher } from './AnimationStateReducer'

export type AnimationStateControlButtonsProps<T> = {
    height: number
    dispatch: AnimationStateDispatcher<T>
    isPlaying: boolean
    buttonWidthPx: number
    playbackRate: number
}

const AnimationStateControlButtons = <T, >(props: AnimationStateControlButtonsProps<T>) => {
    const { height, dispatch, isPlaying, buttonWidthPx, playbackRate } = props

    const handlePlayPauseClick = useCallback((e: React.MouseEvent) => {
        dispatch({
            type: 'TOGGLE_PLAYBACK'
        })
    }, [dispatch])

    const getArrowClickHandler = useCallback((mode: 'end' | 'skip', backward?: boolean) => {
        return (e: React.MouseEvent) => {
            dispatch({
                type: mode === 'end' ? 'TO_END' : 'SKIP',
                backward: backward
            })
        }
    }, [dispatch])

    const changeDirectionHandler = useCallback((e: React.MouseEvent) => {
        dispatch({
            type: 'SET_REPLAY_RATE',
            newRate: -1 * playbackRate
        })
    }, [dispatch, playbackRate])

    const getChangePlaybackSpeedHandler = useCallback((direction: 'faster' | 'slower') => {
        const newPlayback = direction === 'faster' ? playbackRate * 1.3 : playbackRate/1.3
        return (e: React.MouseEvent) => {
            dispatch({
                type: 'SET_REPLAY_RATE',
                newRate: newPlayback
            })
        }
    }, [dispatch, playbackRate])

    const playPauseIcon = useMemo(() => {
        return isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />
    }, [isPlaying]) 

    // Alternatively, consider the faArrowRightArrowLeft icon, which wouldn't need to be changed and might be more expressive.
    const directionIcon = useMemo(() => {
        return playbackRate > 0 ? <FontAwesomeIcon icon={faStepBackward} /> : <FontAwesomeIcon icon={faStepForward} />
    }, [playbackRate])

    const resolution = useMemo(() => {
        return playbackRate > 0 ? 4 : 5
    }, [playbackRate])

    return (
        <div
            className={'AnimationControlButton'}
            style={{position: 'absolute', textAlign: 'center', width: buttonWidthPx, height: Math.floor(height * .75), top: Math.ceil(height * .25), font: `${Math.floor(height/2)}px FontAwesome`,}}
        >
            <span onMouseDown={getArrowClickHandler('end', true)} title="Return to beginning">
                <FontAwesomeIcon icon={faFastBackward} />
            </span>
            <span onMouseDown={getArrowClickHandler('skip', true)} title="Skip backward">
                <FontAwesomeIcon icon={faBackward} />
            </span>
            <span onMouseDown={handlePlayPauseClick} title="Play/pause">
                {playPauseIcon}
            </span>
            <span onMouseDown={getArrowClickHandler('skip')} title="Skip forward">
                <FontAwesomeIcon icon={faForward} />
            </span>
            <span onMouseDown={getArrowClickHandler('end')} title="Skip to end">
                <FontAwesomeIcon icon={faFastForward} />
            </span>
            <span>
                &nbsp;
            </span>
            <span onMouseDown={changeDirectionHandler} title="Reverse playback direction">
                {directionIcon}
            </span>
            <span title="Decrease playback rate">
                <FontAwesomeIcon icon={faAngleDown} onMouseDown={getChangePlaybackSpeedHandler('slower')} />
            </span>
            <span title="Playback rate (frames per 1/60th of a second)">
                {`${playbackRate.toString().substring(0, resolution)}`}
            </span>
            <span title="Increase playback rate">
                <FontAwesomeIcon icon={faAngleUp} onMouseDown={getChangePlaybackSpeedHandler('faster')} />
            </span>
        </div>
    )
}

export default AnimationStateControlButtons
