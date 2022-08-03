import { faArrowsLeftRightToLine } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import { AnimationStateDispatcher } from '../AnimationStateReducer'


export const CROP_BUTTON = "cropButton"

type PlaybackCropWindowButtonProps = {
    dispatch: AnimationStateDispatcher<any>
    isCropped: boolean
    selectionBounds?: [number, number]
}

const PlaybackCropWindowButton = (props: PlaybackCropWindowButtonProps) => {
    const { dispatch, isCropped, selectionBounds } = props

    const cropHandler = useCallback((e: React.MouseEvent) => {
        dispatch({ type: 'SET_WINDOW', bounds: selectionBounds })
    }, [dispatch, selectionBounds])

    const cropButton = useMemo(() =>
        <span className={isCropped ? 'Inverted' : ''}
            title={isCropped ? "Unset window" : "Trim visible time to selection"}
            onMouseDown={cropHandler}
          >
            <FontAwesomeIcon icon={faArrowsLeftRightToLine} />
            {/* <FontAwesomeIcon icon={faCrop} /> */}
          </span>
    , [isCropped, cropHandler])

    return cropButton
}

export default PlaybackCropWindowButton
