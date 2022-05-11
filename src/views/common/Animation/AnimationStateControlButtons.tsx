import { faAngleDown, faAngleUp, faBackward, faFastBackward, faFastForward, faForward, faPause, faPlay, faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import Select from 'react-select'
import './AnimationControlButtonStyles.css'
import { AnimationStateDispatcher } from './AnimationStateReducer'

export type AnimationStateControlButtonsProps<T> = {
    height: number
    dispatch: AnimationStateDispatcher<T>
    isPlaying: boolean
    buttonWidthPx: number
    playbackRate: number
    customPlaybackRates?: number[]
    usingRateButtons?: boolean
}

const defaultPlaybackRates = [0.1, 0.25, 0.5, 1, 2, 3, 4, 5, 10 ]
const PlaybackRateDropdown = <T, >(props: AnimationStateControlButtonsProps<T>) => {
    const { playbackRate, customPlaybackRates, usingRateButtons, dispatch } = props
    const playbackRates = useMemo(() => {
        const c = customPlaybackRates || []
        return [...defaultPlaybackRates, ...c]
    }, [customPlaybackRates])
    const playbackRateOptions = useMemo(() => {
        return playbackRates.map(
            r => {return {
                value: r,
                label: `${r.toString().slice(0, 5)}x`
            }}
        )
    }, [playbackRates])
    const selectedRateOption = useMemo(() => {
        if (usingRateButtons) return null
        return playbackRateOptions.find(e => Math.abs(e.value - Math.abs(playbackRate)) < 0.001) || null
    }, [playbackRateOptions, playbackRate, usingRateButtons])

    const handleChangePlaybackRateOption = useCallback((selectedOption) => {
        dispatch({
            type: 'SET_REPLAY_RATE',
            newRate: (playbackRate > 0 ? 1 : -1) * selectedOption.value
        })
    }, [dispatch, playbackRate])

    return (
        <span>
            <Select
                value={selectedRateOption}
                options={playbackRateOptions}
                onChange={handleChangePlaybackRateOption}
                classNamePrefix="dropdown"
                className="dropdown-inline"
                components={{ IndicatorsContainer: () => null }}
                menuPlacement="top"
            />
        </span>)
}


const PlaybackRateButtons = <T, >(props: AnimationStateControlButtonsProps<T>) => {
    const { dispatch, playbackRate } = props
    const getChangePlaybackSpeedHandler = useCallback((direction: 'faster' | 'slower') => {
        const newPlayback = direction === 'faster' ? playbackRate * 1.3 : playbackRate/1.3
        return (e: React.MouseEvent) => {
            dispatch({
                type: 'SET_REPLAY_RATE',
                newRate: newPlayback
            })
        }
    }, [dispatch, playbackRate])

    const resolution = useMemo(() => {
        return playbackRate > 0 ? 4 : 5
    }, [playbackRate])

    return <>
        <span title="Decrease playback rate">
            <FontAwesomeIcon icon={faAngleDown} onMouseDown={getChangePlaybackSpeedHandler('slower')} />
        </span>
        <span title="Playback rate (frames per 1/60th of a second)">
            {`${playbackRate.toString().substring(0, resolution)}`}
        </span>
        <span title="Increase playback rate">
            <FontAwesomeIcon icon={faAngleUp} onMouseDown={getChangePlaybackSpeedHandler('faster')} />
        </span>
    </>
}


const AnimationStateControlButtons = <T, >(props: AnimationStateControlButtonsProps<T>) => {
    const { height, dispatch, isPlaying, buttonWidthPx, playbackRate, usingRateButtons } = props

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

    const rateDropdown = useMemo(() => <PlaybackRateDropdown {...props} />, [props])
    const rateButtons = useMemo(() => <PlaybackRateButtons {...props} />, [props])

    const playPauseIcon = useMemo(() => {
        return isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />
    }, [isPlaying]) 

    // Alternatively, consider the faArrowRightArrowLeft icon, which wouldn't need to be changed and might be more expressive.
    const directionIcon = useMemo(() => {
        return playbackRate > 0 ? <FontAwesomeIcon icon={faStepBackward} /> : <FontAwesomeIcon icon={faStepForward} />
    }, [playbackRate])

    const rateControl = usingRateButtons ? rateButtons : rateDropdown
    const extraSpan = usingRateButtons ? <span>&nbsp;</span> : <></>

    return (
        <div
            className={'AnimationControlButton'}
            style={{position: 'absolute',
                    textAlign: 'center',
                    width: buttonWidthPx,
                    height: usingRateButtons ? Math.floor(height * .8) : height,
                    top: usingRateButtons ? Math.ceil(height * .2) : 0,
                    font: `${Math.floor(height/2)}px FontAwesome`,}}
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
            {extraSpan}
            {rateControl}
            <span onMouseDown={changeDirectionHandler} title="Reverse playback direction">
                {directionIcon}
            </span>
        </div>
    )
}

export default AnimationStateControlButtons
