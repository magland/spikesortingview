import { faLink, faLinkSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import { AnimationStateDispatcher } from '../AnimationStateReducer'


export const SYNC_BUTTON = "syncButton"

type PlaybackSyncButtonProps = {
    dispatch: AnimationStateDispatcher<any>
    isSynced: boolean
}

const PlaybackSyncWindowButton = (props: PlaybackSyncButtonProps) => {
    const { dispatch, isSynced } = props

    const toggleWindowSyncHandler = useCallback((e: React.MouseEvent) => {
        dispatch({ type: 'TOGGLE_WINDOW_SYNC' })
    }, [dispatch])

    const syncButton = useMemo(() => 
        <span onMouseDown={toggleWindowSyncHandler}
          title={isSynced ? "Unsync playback window from shared state" : "Sync playback window to shared state"}
        >
            {isSynced ? <FontAwesomeIcon icon={faLinkSlash} /> : <FontAwesomeIcon icon={faLink} />}
        </span>
        , [isSynced, toggleWindowSyncHandler])

    return syncButton
}

export default PlaybackSyncWindowButton
