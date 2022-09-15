import React, { useCallback, useContext, useEffect, useMemo } from 'react'

export type RecordingSelection = {
    recordingStartTimeSeconds?: number
    recordingEndTimeSeconds?: number
    focusTimeSeconds?: number
    focusTimeIntervalSeconds?: [number, number]
    visibleTimeStartSeconds?: number
    visibleTimeEndSeconds?: number
    selectedElectrodeIds: (number | string)[]
}

export const defaultRecordingSelection: RecordingSelection = {
    recordingStartTimeSeconds: undefined,
    recordingEndTimeSeconds: undefined,
    visibleTimeStartSeconds: undefined,
    visibleTimeEndSeconds: undefined,
    selectedElectrodeIds: []
}

export const stubRecordingSelectionDispatch = (action: RecordingSelectionAction) => {}

export const selectionIsValid = (r: RecordingSelection) => {
    // If any of the required times are unset, the state is not valid.
    if (r.recordingStartTimeSeconds === undefined
        || r.recordingEndTimeSeconds === undefined
        || r.visibleTimeEndSeconds === undefined
        || r.visibleTimeStartSeconds === undefined) {
            return false
        }
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
    // if (r.focusTimeSeconds) {
    //     // if set, focus time must be within the visible window
    //     if (r.focusTimeSeconds < r.visibleTimeStartSeconds || r.focusTimeSeconds > r.visibleTimeEndSeconds) return false
    // }

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

export const useRecordingSelectionTimeInitialization = (start: number, end: number, timeOffset: number=0) => {
    const { recordingSelection, recordingSelectionDispatch } = useRecordingSelection()

    useEffect(() => {
        if (recordingSelection.recordingStartTimeSeconds === start + timeOffset &&
            recordingSelection.recordingEndTimeSeconds === end + timeOffset) return

        recordingSelectionDispatch({
            type: 'initializeRecordingSelectionTimes',
            recordingStartSec: start + timeOffset,
            recordingEndSec: end + timeOffset
        })
    }, [recordingSelection.recordingStartTimeSeconds, recordingSelection.recordingEndTimeSeconds, recordingSelectionDispatch, start, end, timeOffset])
}

export type ZoomDirection = 'in' | 'out'
export type PanDirection = 'forward' | 'back'
export const useTimeRange = (timestampOffset=0) => {
    const {recordingSelection, recordingSelectionDispatch} = useRecordingSelection()
    if (recordingSelection.visibleTimeEndSeconds === undefined || recordingSelection.visibleTimeStartSeconds === undefined) {
        console.warn('WARNING: useTimeRange() with uninitialized recording selection state. Time ranges replaced with MIN_SAFE_INTEGER.')
    }
    const zoomRecordingSelection = useCallback((direction: ZoomDirection, factor?: number) => {
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
    const panRecordingSelectionDeltaT = useCallback((deltaT: number) => {
        recordingSelectionDispatch({
            type: 'panDeltaT',
            deltaT
        })
    }, [recordingSelectionDispatch])
    return {
        visibleTimeStartSeconds: recordingSelection.visibleTimeStartSeconds !== undefined ? recordingSelection.visibleTimeStartSeconds - timestampOffset : undefined,
        visibleTimeEndSeconds: recordingSelection.visibleTimeEndSeconds !== undefined ? recordingSelection.visibleTimeEndSeconds - timestampOffset : undefined,
        zoomRecordingSelection,
        panRecordingSelection,
        panRecordingSelectionDeltaT
    }
}

export const useTimeFocus = () => {
    const {recordingSelection, recordingSelectionDispatch} = useRecordingSelection()
    const timeForFraction = useMemo(() => ((fraction: number) => {
        const window = (recordingSelection.visibleTimeEndSeconds || 0) - (recordingSelection.visibleTimeStartSeconds || 0)
        const time = window * fraction
        return time + (recordingSelection.visibleTimeStartSeconds || 0)
    }), [recordingSelection.visibleTimeStartSeconds, recordingSelection.visibleTimeEndSeconds])
    const setTimeFocus = useCallback((time: number, o: {autoScrollVisibleTimeRange?: boolean}={}) => {
        recordingSelectionDispatch({
            type: 'setFocusTime',
            focusTimeSec: time,
            autoScrollVisibleTimeRange: o.autoScrollVisibleTimeRange
        })
    }, [recordingSelectionDispatch])
    const setTimeFocusFraction = useCallback((fraction: number, opts: {event: React.MouseEvent}) => {
        if (fraction > 1 || fraction < 0) {
            console.warn(`Attempt to set time focus to fraction outside range 0-1 (${fraction})`)
            return
        }
    
        recordingSelectionDispatch({
            type: 'setFocusTime',
            focusTimeSec: timeForFraction(fraction),
            shiftKey: opts.event.shiftKey
        })
    }, [recordingSelectionDispatch, timeForFraction])
    const focusTimeIsVisible = recordingSelection.focusTimeSeconds !== undefined
                               && recordingSelection.focusTimeSeconds <= (recordingSelection.visibleTimeEndSeconds || 0)
                               && recordingSelection.focusTimeSeconds >= (recordingSelection.visibleTimeStartSeconds || 0)
    return {
        focusTime: recordingSelection.focusTimeSeconds,
        focusTimeIsVisible,
        focusTimeInterval: recordingSelection.focusTimeIntervalSeconds,
        setTimeFocus,
        setTimeFocusFraction,
        timeForFraction
    }
}

export const useSelectedElectrodes = () => {
    const { recordingSelection, recordingSelectionDispatch } = useRecordingSelection()
    const setSelectedElectrodeIds = useCallback((ids: (number | string)[]) => {
        recordingSelectionDispatch({
            type: 'setSelectedElectrodeIds',
            selectedIds: ids
        })
    }, [recordingSelectionDispatch])

    return {
        selectedElectrodeIds: recordingSelection.selectedElectrodeIds,
        setSelectedElectrodeIds
    }
}

/* RecordingSelection state management code, probably belongs in a different file *********************** */

type InitializeRecordingSelectionTimesAction = {
    type: 'initializeRecordingSelectionTimes',
    recordingStartSec: number,
    recordingEndSec: number
}

const defaultPanPct = 10
export const defaultZoomScaleFactor = 1.4

type PanRecordingSelectionAction = {
    type: 'panForward' | 'panBack',
    panAmountPct: number    // how far to pan, as a percent of the current visible window (e.g. 10). Should always be positive.
}

type PanRecordingSelectionDeltaTAction = {
    type: 'panDeltaT',
    deltaT: number
}

type ZoomRecordingSelectionAction = {
    type: 'zoomIn' | 'zoomOut',
    factor?: number // Factor should always be >= 1 (if we zoom in, we'll use the inverse of factor.)
}

type SetFocusTimeRecordingSelectionAction = {
    type: 'setFocusTime',
    focusTimeSec: number,
    shiftKey?: boolean
    autoScrollVisibleTimeRange?: boolean
}

type SetFocusTimeIntervalRecordingSelectionAction = {
    type: 'setFocusTimeInterval',
    focusTimeIntervalSec: [number, number],
    autoScrollVisibleTimeRange?: boolean
}

type SetSelectedElectrodeIdsRecordingSelectionAction = {
    type: 'setSelectedElectrodeIds',
    selectedIds: (number | string)[]
}

export type RecordingSelectionAction = InitializeRecordingSelectionTimesAction  | PanRecordingSelectionAction
    | PanRecordingSelectionDeltaTAction | ZoomRecordingSelectionAction | SetFocusTimeRecordingSelectionAction | SetFocusTimeIntervalRecordingSelectionAction | SetSelectedElectrodeIdsRecordingSelectionAction

export const recordingSelectionReducer = (state: RecordingSelection, action: RecordingSelectionAction): RecordingSelection => {
    if (action.type === 'initializeRecordingSelectionTimes') {
        return initializeRecordingSelectionTimes(state, action)
    } else if (action.type === 'panForward' || action.type === 'panBack') {
        return panTime(state, action)
    } else if (action.type === 'panDeltaT') {
        return panTimeDeltaT(state, action)
    } else if (action.type === 'zoomIn' || action.type === 'zoomOut') {
        return zoomTime(state, action)
    } else if (action.type === 'setFocusTime') {
        return setFocusTime(state, action)
    } else if (action.type === 'setFocusTimeInterval') {
        return setFocusTimeInterval(state, action)
    } else if (action.type === 'setSelectedElectrodeIds') {
        return setSelectedElectrodeIds(state, action)
    } else {
        console.warn(`Unhandled recording selection action ${action.type} in recordingSelectionReducer.`)
        return state
    }
}

const initializeRecordingSelectionTimes = (state: RecordingSelection, action: InitializeRecordingSelectionTimesAction): RecordingSelection => {
    const newStart = state.recordingStartTimeSeconds === undefined ? action.recordingStartSec : Math.min(state.recordingStartTimeSeconds, action.recordingStartSec)
    const newEnd = state.recordingEndTimeSeconds === undefined ? action.recordingEndSec : Math.max(state.recordingEndTimeSeconds, action.recordingEndSec)
    const newState: RecordingSelection = {
        recordingStartTimeSeconds: newStart,
        recordingEndTimeSeconds: newEnd,
        visibleTimeStartSeconds: newStart,
        visibleTimeEndSeconds: newEnd,
        selectedElectrodeIds: state.selectedElectrodeIds
    }
    selectionIsValid(newState) || console.warn(`Bad initialization value for recordingSelection: start ${action.recordingStartSec}, end ${action.recordingEndSec}`)
    return newState
}

const panTimeHelper = (state: RecordingSelection, panDisplacementSeconds: number) => {
    if (state.visibleTimeStartSeconds === undefined || state.visibleTimeEndSeconds === undefined || state.recordingStartTimeSeconds === undefined || state.recordingEndTimeSeconds === undefined) {
        console.warn(`WARNING: Attempt to call panTime() with uninitialized state ${state}.`)
        return state
    }
    const windowLength = state.visibleTimeEndSeconds - state.visibleTimeStartSeconds
    let newStart = state.visibleTimeStartSeconds    
    let newEnd = state.visibleTimeEndSeconds
    if (panDisplacementSeconds > 0) {
        // panning forward. Just need to check that we don't run over the end of the recording.
        newEnd = Math.min(state.visibleTimeEndSeconds + panDisplacementSeconds, state.recordingEndTimeSeconds)
        newStart = Math.max(newEnd - windowLength, state.recordingStartTimeSeconds)
    } else if (panDisplacementSeconds < 0) {
        // panning backward. Need to make sure not to put the window start time before the recording start time.
        newStart = Math.max(state.visibleTimeStartSeconds + panDisplacementSeconds, state.recordingStartTimeSeconds)
        newEnd = Math.min(newStart + windowLength, state.recordingEndTimeSeconds)
    } else {
        return state
    }
    const keepFocus = true
    // const keepFocus = state.focusTimeSeconds && state.focusTimeSeconds > newStart && state.focusTimeSeconds < newEnd
    const focus = keepFocus ? state.focusTimeSeconds : undefined

    // Avoid creating new object if we didn't actually change anything
    if (newStart === state.visibleTimeStartSeconds && newEnd === state.visibleTimeEndSeconds) return state

    // console.log(`Returning new state: ${newStart} - ${newEnd} (was ${state.visibleTimeStartSeconds} - ${state.visibleTimeEndSeconds})`)
    return {...state, visibleTimeStartSeconds: newStart, visibleTimeEndSeconds: newEnd, focusTimeSeconds: focus }
}

const panTime = (state: RecordingSelection, action: PanRecordingSelectionAction): RecordingSelection => {
    if (state.visibleTimeStartSeconds === undefined || state.visibleTimeEndSeconds === undefined || state.recordingStartTimeSeconds === undefined || state.recordingEndTimeSeconds === undefined) {
        console.warn(`WARNING: Attempt to call panTime() with uninitialized state ${state}.`)
        return state
    }
    const windowLength = state.visibleTimeEndSeconds - state.visibleTimeStartSeconds
    const panDisplacementSeconds = action.panAmountPct / 100 * windowLength * (action.type === 'panBack' ? -1 : 1)
    return panTimeHelper(state, panDisplacementSeconds)
}

const panTimeDeltaT = (state: RecordingSelection, action: PanRecordingSelectionDeltaTAction): RecordingSelection => {
    if (state.visibleTimeStartSeconds === undefined || state.visibleTimeEndSeconds === undefined || state.recordingStartTimeSeconds === undefined || state.recordingEndTimeSeconds === undefined) {
        console.warn(`WARNING: Attempt to call panTime() with uninitialized state ${state}.`)
        return state
    }
    const panDisplacementSeconds = action.deltaT
    return panTimeHelper(state, panDisplacementSeconds)
}

const zoomTime = (state: RecordingSelection, action: ZoomRecordingSelectionAction): RecordingSelection => {
    if (state.visibleTimeStartSeconds === undefined || state.visibleTimeEndSeconds === undefined || state.recordingStartTimeSeconds === undefined || state.recordingEndTimeSeconds === undefined) {
        console.warn(`WARNING: Attempt to call zoomTime() with uninitialized state ${state}.`)
        return state
    }
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
    const {focusTimeSec, shiftKey, autoScrollVisibleTimeRange} = action
    let newState: RecordingSelection = { ...state, focusTimeSeconds: focusTimeSec, focusTimeIntervalSeconds: undefined }
    if (autoScrollVisibleTimeRange) {
        if ((state.visibleTimeStartSeconds !== undefined) && (state.visibleTimeEndSeconds !== undefined)) {
            if ((focusTimeSec < state.visibleTimeStartSeconds) || (focusTimeSec > state.visibleTimeEndSeconds)) {
                const span = state.visibleTimeEndSeconds - state.visibleTimeStartSeconds
                newState.visibleTimeStartSeconds = focusTimeSec - span / 2
                newState.visibleTimeEndSeconds = focusTimeSec + span / 2
                if (newState.visibleTimeEndSeconds > (state.recordingEndTimeSeconds || 0)) {
                    const delta = (state.recordingEndTimeSeconds || 0) - newState.visibleTimeEndSeconds
                    newState.visibleTimeStartSeconds += delta
                    newState.visibleTimeEndSeconds += delta
                }
                if (newState.visibleTimeStartSeconds < (state.recordingStartTimeSeconds || 0)) {
                    const delta = (state.recordingStartTimeSeconds || 0) - newState.visibleTimeStartSeconds
                    newState.visibleTimeStartSeconds += delta
                    newState.visibleTimeEndSeconds += delta
                }
            }
        }
    }
    if (shiftKey) {
        const t0 = state.focusTimeSeconds
        if (t0 !== undefined) {
            const t1 = Math.min(t0, focusTimeSec)
            const t2 = Math.max(t0, focusTimeSec)
            newState = {...newState, focusTimeSeconds: state.focusTimeSeconds, focusTimeIntervalSeconds: [t1, t2]}
        }
    }
    return selectionIsValid(newState) ? newState : state
}

const setFocusTimeInterval = (state: RecordingSelection, action: SetFocusTimeIntervalRecordingSelectionAction): RecordingSelection => {
    const {focusTimeIntervalSec, autoScrollVisibleTimeRange} = action
    let newState: RecordingSelection = { ...state, focusTimeIntervalSeconds: focusTimeIntervalSec }
    if (autoScrollVisibleTimeRange) {
        const t0 = (action.focusTimeIntervalSec[0] + action.focusTimeIntervalSec[1]) / 2
        if ((state.visibleTimeStartSeconds !== undefined) && (state.visibleTimeEndSeconds !== undefined)) {
            if ((t0 < state.visibleTimeStartSeconds) || (t0 > state.visibleTimeEndSeconds)) {
                const span = state.visibleTimeEndSeconds - state.visibleTimeStartSeconds
                newState.visibleTimeStartSeconds = t0 - span / 2
                newState.visibleTimeEndSeconds = t0 + span / 2
                if (newState.visibleTimeEndSeconds > (state.recordingEndTimeSeconds || 0)) {
                    const delta = (state.recordingEndTimeSeconds || 0) - newState.visibleTimeEndSeconds
                    newState.visibleTimeStartSeconds += delta
                    newState.visibleTimeEndSeconds += delta
                }
                if (newState.visibleTimeStartSeconds < (state.recordingStartTimeSeconds || 0)) {
                    const delta = (state.recordingStartTimeSeconds || 0) - newState.visibleTimeStartSeconds
                    newState.visibleTimeStartSeconds += delta
                    newState.visibleTimeEndSeconds += delta
                }
            }
        }
    }
    return selectionIsValid(newState) ? newState : state
}

const setSelectedElectrodeIds = (state: RecordingSelection, action: SetSelectedElectrodeIdsRecordingSelectionAction): RecordingSelection => {
    if (action.selectedIds.length === state.selectedElectrodeIds.length) {
        const currentSet = new Set<(number | string)>(state.selectedElectrodeIds)
        if (action.selectedIds.every(id => currentSet.has(id))) {
            return state
        }
    }
    const newState = { ...state, selectedElectrodeIds: action.selectedIds }
    return newState
}

export default RecordingSelectionContext
