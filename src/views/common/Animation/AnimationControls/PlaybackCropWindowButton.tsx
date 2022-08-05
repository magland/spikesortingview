import { faArrowsLeftRightToLine } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import { AnimationStateDispatcher } from '../AnimationStateReducer'


export const CROP_BUTTON = "cropButton"

type PlaybackCropWindowButtonProps = {
    dispatch: AnimationStateDispatcher<any>
    isCropped: boolean
}

const PlaybackCropWindowButton = (props: PlaybackCropWindowButtonProps) => {
    const { dispatch, isCropped } = props

    // const cropHandler = useCallback((e: React.MouseEvent) => {
    //     isCropped
    //         ? dispatch({ type: 'RELEASE_WINDOW' })
    //         : dispatch({ type: 'COMMIT_WINDOW' })
    // }, [isCropped, dispatch])

    const cropHandler = useCallback((E: React.MouseEvent) => {
        dispatch({ type: 'COMMIT_WINDOW' })
    }, [dispatch])

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
