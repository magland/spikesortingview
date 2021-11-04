import React, { useCallback, useContext } from 'react'

export type RecordingSelection = {
    recordingStartTimeSeconds: number
    recordingEndTimeSeconds: number
    focusTimeSeconds?: number
    visibleTimeStartSeconds: number
    visibleTimeEndSeconds: number
}

export const defaultRecordingSelection: RecordingSelection = {
    recordingStartTimeSeconds: -1,
    recordingEndTimeSeconds: -1,
    visibleTimeStartSeconds: -1,
    visibleTimeEndSeconds: -1
}

export const stubRecordingSelectionDispatch = (action: RecordingSelectionAction) => {}

// We probably won't call this, but it's good to spell out the conditions of validity
export const selectionIsValid = (r: RecordingSelection) => {
    // recording start and end times must be non-negative
    if (r.recordingStartTimeSeconds < 0 || r.recordingEndTimeSeconds < 0) return false
    // recording end time must not precede recording start time
    if (r.recordingEndTimeSeconds < r.recordingStartTimeSeconds) return false
    // window end time must not precede window start time
    if (r.visibleTimeEndSeconds < r.visibleTimeStartSeconds) return false
    // window times must be within recording times.
    // Since we already know recording start < recording end and visible start < visible end,
    // we can get away with just comparing visible start to recording start and visible end to recording end.
    // (b/c if visEnd < recStart, then visStart < recStart; if visStart > recEnd, then visEnd > recEnd.)
    if (r.visibleTimeStartSeconds < r.recordingStartTimeSeconds || r.recordingEndTimeSeconds < r.visibleTimeEndSeconds) return false
    if (r.focusTimeSeconds) {
        // if set, focus time must be within the visible window
        if (r.focusTimeSeconds < r.visibleTimeStartSeconds || r.focusTimeSeconds > r.visibleTimeEndSeconds) return false
    }

    return true
}

type RecordingSelectionContextType = {
    recordingSelection: RecordingSelection,
    recordingSelectionDispatch: (action: RecordingSelectionAction) => void
}

const RecordingSelectionContext = React.createContext<RecordingSelectionContextType>({
    recordingSelection: defaultRecordingSelection,
    recordingSelectionDispatch: stubRecordingSelectionDispatch
})

export const useRecordingSelection = () => {
    const c = useContext(RecordingSelectionContext)
    return c
}

// export const useInitializedRecordingSelectionContext = (recordingStart: number, recordingEnd: number) => {
//     const {recordingSelection, recordingSelectionDispatch} = useRecordingSelection()
//     if (recordingSelection === defaultRecordingSelection) {

//     }
// }

// Not sure if this is really the right thing to do, or if we should just expose the underlying reducer directly...
export type ZoomDirection = 'in' | 'out'
export type PanDirection = 'forward' | 'back'
export const useTimeRange = () => {
    const {recordingSelection, recordingSelectionDispatch} = useRecordingSelection()
    const zoomRecordingSelecion = useCallback((direction: ZoomDirection, factor?: number) => {
        recordingSelectionDispatch({
            type: direction === 'in' ? 'zoomIn' : 'zoomOut',
            factor
        })
    }, [recordingSelectionDispatch])
    const panRecordingSelection = useCallback((direction: PanDirection, pct?: number) => {
        recordingSelectionDispatch({
            type: direction === 'forward' ? 'panForward' : 'panBack',
            panAmountPct: pct ?? defaultPanPct
        })
    }, [recordingSelectionDispatch])
    return {
        visibleTimeStartSeconds: recordingSelection.visibleTimeStartSeconds,
        visibleTimeEndSeconds: recordingSelection.visibleTimeEndSeconds,
        zoomRecordingSelecion,
        panRecordingSelection
    }
}

/* RecordingSelection state management code, probably belongs in a different file *********************** */

type InitializeRecordingSelectionAction = {
    type: 'initializeRecordingSelection',
    recordingStartSec: number,
    recordingEndSec: number
}

const defaultPanPct = 10
export const defaultZoomScaleFactor = 1.4

type PanRecordingSelectionAction = {
    type: 'panForward' | 'panBack',
    panAmountPct: number    // how far to pan, as a percent of the current visible window (e.g. 10). Should always be positive.
}

type ZoomRecordingSelectionAction = {
    type: 'zoomIn' | 'zoomOut',
    factor?: number // Factor should always be >= 1 (if we zoom in, we'll use the inverse of factor.)
}

type SetFocusTimeRecordingSelectionAction = {
    type: 'setFocusTime',
    focusTimeSec: number
}

export type RecordingSelectionAction = InitializeRecordingSelectionAction | PanRecordingSelectionAction | ZoomRecordingSelectionAction
    |  SetFocusTimeRecordingSelectionAction

export const recordingSelectionReducer = (state: RecordingSelection, action: RecordingSelectionAction): RecordingSelection => {
    if (action.type === 'initializeRecordingSelection') {
        return initializeRecordingSelection(state, action)
    } else if (action.type === 'panForward' || action.type === 'panBack') {
        return panTime(state, action)
    } else if (action.type === 'zoomIn' || action.type === 'zoomOut') {
        return zoomTime(state, action)
    } else if (action.type === 'setFocusTime') {
        return setFocusTime(state, action)
    } else {
        console.warn(`Unhandled recording selection action ${action.type} in recordingSelectionReducer.`)
        return state
    }
}

const initializeRecordingSelection = (state: RecordingSelection, action: InitializeRecordingSelectionAction): RecordingSelection => {
    if (state !== defaultRecordingSelection) { // TODO: do we need to actually test this, can this break due to reference issues?
        console.log(`******** Ignoring recording-selection initialization request.`)
        if (state.recordingStartTimeSeconds !== action.recordingStartSec || state.recordingEndTimeSeconds !== action.recordingEndSec) {
            console.warn(`WARNING: Recording-selection reinitialization times (${action.recordingStartSec}, ${action.recordingEndSec}) do not match existing ones (${state.recordingStartTimeSeconds}, ${state.recordingEndTimeSeconds}). Attempt to load components with different recordings?`)
        }
        return state
    }
    const newState: RecordingSelection = {
        recordingStartTimeSeconds: action.recordingStartSec,
        recordingEndTimeSeconds: action.recordingEndSec,
        visibleTimeStartSeconds: action.recordingStartSec,
        visibleTimeEndSeconds: action.recordingEndSec
    }
    selectionIsValid(newState) || console.warn(`Bad initialization value for recordingSelection: start ${action.recordingStartSec}, end ${action.recordingEndSec}`)
    return newState
}

const panTime = (state: RecordingSelection, action: PanRecordingSelectionAction): RecordingSelection => {
    const windowLength = state.visibleTimeEndSeconds - state.visibleTimeStartSeconds
    const panDisplacementSeconds = action.panAmountPct/100 * windowLength
    let newStart = state.visibleTimeStartSeconds    
    let newEnd = state.visibleTimeEndSeconds
    if (action.type === 'panForward') {
        // panning forward. Just need to check that we don't run over the end of the recording.
        newEnd = Math.min(state.visibleTimeEndSeconds + panDisplacementSeconds, state.recordingEndTimeSeconds)
        newStart = Math.max(newEnd - windowLength, state.recordingStartTimeSeconds)
    } else if (action.type === 'panBack') {
        // panning backward. Need to make sure not to put the window start time before the recording start time.
        newStart = Math.max(state.visibleTimeStartSeconds - panDisplacementSeconds, state.recordingStartTimeSeconds)
        newEnd = Math.min(newStart + windowLength, state.recordingEndTimeSeconds)
    } else {
        console.warn(`Unrecognized action type ${action.type} in panTime. Can't happen.`)
        return state
    }
    const keepFocus = state.focusTimeSeconds && state.focusTimeSeconds > newStart && state.focusTimeSeconds < newEnd
    const focus = keepFocus ? state.focusTimeSeconds : undefined

    // Avoid creating new object if we didn't actually change anything
    if (newStart === state.visibleTimeStartSeconds && newEnd === state.visibleTimeEndSeconds) return state

    // console.log(`Returning new state: ${newStart} - ${newEnd} (was ${state.visibleTimeStartSeconds} - ${state.visibleTimeEndSeconds})`)
    return {...state, visibleTimeStartSeconds: newStart, visibleTimeEndSeconds: newEnd, focusTimeSeconds: focus }
}

const zoomTime = (state: RecordingSelection, action: ZoomRecordingSelectionAction): RecordingSelection => {
    const totalRecordingLength = state.recordingEndTimeSeconds - state.recordingStartTimeSeconds
    const currentWindow = state.visibleTimeEndSeconds - state.visibleTimeStartSeconds

    // short-circuit: if we're trying to zoom out from the full recording, just return the current state
    if (currentWindow === totalRecordingLength && action.type === 'zoomOut') return state
    // (No such shortcut is available while zooming in--we can always zoom in more.)

    let factor = action.factor ?? defaultZoomScaleFactor
    // zoom in --> shrink the window. zoom out --> expand the window. So when zooming in we use the inverse of the (>=1) factor.
    factor = action.type === 'zoomIn' ? 1 / factor : factor
    const newWindow = Math.min(currentWindow * factor, totalRecordingLength)

    // We can short-circuit some potential edge cases & needless computation around focus time if we catch the case where
    // the new window is too big.
    // TODO: This should probably be "within some epsilon of" to deal with rounding issues...
    if (newWindow >= totalRecordingLength) return {
        ...state,
        visibleTimeStartSeconds: state.recordingStartTimeSeconds,
        visibleTimeEndSeconds: state.recordingEndTimeSeconds
    }

    // We want to maintain the position of the anchor time point relative to the start of the old window.
    // Anchor is the focusTimeSeconds, if set, otherwise we just use the midpoint of the old window.
    const anchorTimeSec = state.focusTimeSeconds ?? state.visibleTimeStartSeconds + (currentWindow / 2)
    // Find the distance of the focus from the window start, as a fraction of the total window length.
    const anchorTimeFrac = state.focusTimeSeconds ? (state.focusTimeSeconds - state.visibleTimeStartSeconds) / currentWindow : 0.5
    // Now the new start time = anchor time - (fraction * new window size), unless that'd put us earlier than the start of the recording.
    let newStart = Math.max(anchorTimeSec - anchorTimeFrac * newWindow, state.recordingStartTimeSeconds)
    const newEnd = Math.min(newStart + newWindow, state.recordingEndTimeSeconds)
    // Setting the end might also have bumped up against the end of the recording. If we were to cap the end time at the recording length
    // but keep the first-computed start time, the window would be too small & we'd have zoomed in too much.
    // So we have to do one more start-time correction (which is safe--newWindow is less than the full recording length.)
    newStart = newEnd - newWindow
    return {
        ...state,
        visibleTimeStartSeconds: newStart,
        visibleTimeEndSeconds: newEnd
    }
}

const setFocusTime = (state: RecordingSelection, action: SetFocusTimeRecordingSelectionAction): RecordingSelection => {
    const newState = { ...state, focusTimeSeconds: action.focusTimeSec }
    return selectionIsValid(newState) ? newState : state
}

export default RecordingSelectionContext
