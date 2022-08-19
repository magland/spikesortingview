import { faBackward, faFastBackward, faFastForward, faForward } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

const usePlaybackPositionArrowButtons = (dispatch: AnimationStateDispatcher<any>) => {
    const handleArrowClick = useCallback((mode: 'end' | 'skip', backward?: boolean) => {
        return (e: React.MouseEvent) => {
            dispatch({
                type: mode === 'end' ? 'TO_END' : 'SKIP',
                backward: backward
            })
        }
    }, [dispatch])

    const beginningButton = useMemo(() => 
        <span onMouseDown={handleArrowClick('end', true)} title="Return to beginning">
            <FontAwesomeIcon icon={faFastBackward} />
        </span>, [handleArrowClick])

    const backSkipButton = useMemo(() => 
        <span onMouseDown={handleArrowClick('skip', true)} title="Return to beginning">
            <FontAwesomeIcon icon={faBackward} />
        </span>, [handleArrowClick])

    const forwardSkipButton = useMemo(() => 
        <span onMouseDown={handleArrowClick('skip')} title="Skip forward">
            <FontAwesomeIcon icon={faForward} />
        </span>, [handleArrowClick])

    const endButton = useMemo(() => 
        <span onMouseDown={handleArrowClick('end')} title="Skip to end">
            <FontAwesomeIcon icon={faFastForward} />
        </span>, [handleArrowClick])


    return { beginningButton, backSkipButton, forwardSkipButton, endButton }
}

export default usePlaybackPositionArrowButtons
