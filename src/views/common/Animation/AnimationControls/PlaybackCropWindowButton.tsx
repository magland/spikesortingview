import { faArrowsLeftRightToLine } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import { AnimationStateDispatcher } from '../AnimationStateReducer'


export const CROP_BUTTON = "cropButton"

type PlaybackCropWindowButtonProps = {
    dispatch: AnimationStateDispatcher<any>
    isSynced: boolean
    isCropped: boolean
    willCrop: boolean
}

const PlaybackCropWindowButton = (props: PlaybackCropWindowButtonProps) => {
    const { dispatch, isSynced, isCropped, willCrop } = props
    const cropHandler = useCallback((E: React.MouseEvent) => {
        dispatch({ type: 'COMMIT_WINDOW' })
    }, [dispatch])

    const cropButton = useMemo(() =>
        <span className={isSynced ? 'Inactive' : isCropped ? 'Highlighted' : ''}
            title={isSynced
                ? "Playback range syncing is on--playback is automatically limited to global state"
                : willCrop
                    ? "Limit playback bar range to current selection"
                    : isCropped
                        ? "Show complete animation duration in playback bar"
                        : "Drag-click in the playback bar to select a focus range" }
            onMouseDown={cropHandler}
          >
            <FontAwesomeIcon icon={faArrowsLeftRightToLine} />
            {/* <FontAwesomeIcon icon={faCrop} /> */}
          </span>
    , [isSynced, isCropped, willCrop, cropHandler])

    return cropButton
}

export default PlaybackCropWindowButton
