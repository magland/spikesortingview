import { useMemo } from 'react'
import AnimationControlButtonContainer from './AnimationControlButtonContainer'
import PlaybackCropWindowButton, { CROP_BUTTON } from './AnimationControls/PlaybackCropWindowButton'
import PlaybackSyncWindowButton, { SYNC_BUTTON } from './AnimationControls/PlaybackSyncWindowButton'
import { ControlFeatures } from './AnimationPlaybackControls'
import { AnimationStateDispatcher } from './AnimationStateReducer'


const perButtonRightButtonSpacingPx = 35

type SecondaryControlButtonsProps = {
    width: number
    height: number
    dispatch: AnimationStateDispatcher<any>
    ui?: ControlFeatures
}

const GetSecondaryPlaybackControls = (props: SecondaryControlButtonsProps) => {
    const { width, height, dispatch, ui } = props

    const rightButtonCount = useMemo(() => {
        return (ui?.optionalButtons?.length || 0)
    }, [ui?.optionalButtons])
    const rightButtonSpacingPx = rightButtonCount * perButtonRightButtonSpacingPx

    const selectedButtons = useMemo(() => new Set(ui?.optionalButtons), [ui?.optionalButtons])
    // TODO: Consider if this could result in building expensive buttons that aren't actually used.
    const syncButton = PlaybackSyncWindowButton({dispatch, isSynced: (ui?.isSynced ?? false)})
    const cropButton = PlaybackCropWindowButton({
        dispatch,
        isSynced: (ui?.isSynced ?? false),
        isCropped: (ui?.isCropped ?? false),
        willCrop: (ui?.couldCrop ?? false)
    }) // TODO: Add range for display ?

    const panel = useMemo(() => {
        return ( 
            <AnimationControlButtonContainer
                 width={rightButtonSpacingPx}
                 baseHeight={height}
                 squeezeHeight={true}
                 overallWidth={width}
             >
                {selectedButtons.has(SYNC_BUTTON) && syncButton}
                {selectedButtons.has(CROP_BUTTON) && cropButton}
             </AnimationControlButtonContainer>
        )
    }, [rightButtonSpacingPx, height, width, syncButton, cropButton, selectedButtons])

    return { panelWidth: rightButtonSpacingPx, panel }
}

export default GetSecondaryPlaybackControls
